# AI 面试复盘分析系统设计

> 项目：OfferFlow — 求职全流程管理工具
> 日期：2026-05-22
> 状态：设计定稿

---

## 1. 概述

在现有面试复盘模块中增加 AI 分析能力，覆盖三个核心场景：

| # | 场景 | 说明 |
|---|------|------|
| 1 | Word 文件智能分析 | 上传 .docx 面试记录，LLM 自动打分并提取优势/不足/问题/改进动作 |
| 2 | 岗位适配专家 | 根据面试岗位（如产品经理、C++ 开发），LLM 扮演对应领域的资深专家角色 |
| 3 | 历史趋势总结 | 聚合用户所有面试记录，LLM 分析高频薄弱点、评分趋势、改进建议 |

---

## 2. 架构概览

```
┌─ 客户端 ─────────────────────────────────────────────┐
│  ReviewModal (新增 AI 分析入口)                        │
│    ├─ 选择 .docx → 点击"AI 分析"                      │
│    ├─ AI 结果预览面板 → 用户可修改                    │
│    └─ 确认后 → 填充表单 → 手动保存                    │
│                                                       │
│  Interview.jsx (新增趋势分析入口)                      │
│    └─ "生成趋势报告" 按钮 → /api/ai/trends            │
└───────────────────────────────────────────────────────┘
                          │
                          ▼
┌─ API Routes ─────────────────────────────────────────┐
│  POST /api/ai/analyze       — Word 文件分析           │
│  GET  /api/ai/trends        — 历史趋势总结            │
│  POST /api/ai/review/:id    — 重新分析已有复盘         │
│                                                       │
│  所有 API 均通过 getAuthUser() 鉴权                    │
└───────────────────────────────────────────────────────┘
                          │
                          ▼
┌─ 服务端层 ───────────────────────────────────────────┐
│  src/lib/llm/                                         │
│    ├── client.js       — OpenAI-compatible LLM 客户端  │
│    ├── prompts.js      — 角色 prompt + JSON schema    │
│    └── config.js       — 模型/API 配置（环境变量驱动）  │
│                                                       │
│  src/lib/ai/                                          │
│    ├── docParser.js    — mammoth 解析 .docx → 纯文本  │
│    └── fileStore.js    — 文件存储（本地/Vercel Blob）  │
└───────────────────────────────────────────────────────┘
                          │
                          ▼
┌─ 数据层 ─────────────────────────────────────────────┐
│  Prisma Review 模型 + aiAnalysis 字段 (Json?)         │
│  附件：复用 attachments JSON + 文件存储                │
└───────────────────────────────────────────────────────┘
```

---

## 3. LLM 客户端抽象层

### 3.1 环境变量配置

```env
# 通过环境变量切换模型，无需改代码
LLM_PROVIDER=deepseek             # deepseek | xiaomi
LLM_API_KEY=sk-xxx
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-chat
```

### 3.2 接口设计 (`src/lib/llm/client.js`)

```js
/**
 * 调用 LLM (OpenAI-compatible API)
 * @param {string} systemPrompt - 系统角色设定
 * @param {string} userPrompt   - 用户输入
 * @returns {{ content: string, model: string, usage: object }}
 * @throws {LLMError} - API 错误、超时、格式异常
 */
export async function callLLM({ systemPrompt, userPrompt })
```

- 使用 `response_format: { type: 'json_object' }` 强制 JSON 输出
- 超时 60 秒
- 错误重试 1 次（仅网络/5xx 类错误）

### 3.3 Prompt 设计 (`src/lib/llm/prompts.js`)

**分析 prompt：**

```
system: 你是一名资深的{jobTitle}面试专家。你正在分析一份面试记录。
请从面试官角度，对候选人的表现进行打分和评价。
严格按照 JSON 格式输出。

user: 请分析以下面试记录：
---
{interviewText}
---
```

**趋势 prompt：**

```
system: 你是一名资深职业发展顾问。请根据用户的多场面试记录，
分析其整体表现趋势、高频薄弱点、进步情况和改进建议。
严格按照 JSON 格式输出。

user: 以下是该用户的 {count} 场面试复盘数据：
{reviewsJson}
```

### 3.4 输出 JSON Schema

```json
{
  "scores": {
    "expression": 1-5,
    "jobUnderstanding": 1-5,
    "projectFamiliarity": 1-5,
    "businessThinking": 1-5,
    "technicalAbility": 1-5,
    "composure": 1-5,
    "questionQuality": 1-5,
    "overall": 1-5
  },
  "rating": 1-5,
  "strengths": "string",
  "weaknesses": "string",
  "note": "string",
  "questions": [
    {
      "question": "string",
      "myAnswer": "string",
      "satisfaction": 1-5,
      "betterAnswer": "string",
      "skills": "string"
    }
  ],
  "improvements": [{ "action": "string" }],
  "tags": ["string"]
}
```

趋势分析返回：

```json
{
  "高频薄弱点": ["string"],
  "评分趋势": "string",
  "进步项": ["string"],
  "建议": ["string"],
  "commonQuestions": ["string"],
  "questionDistribution": { "技术": 0, "行为": 0, "业务": 0 }
}
```

---

## 4. API 路由设计

### 4.1 `POST /api/ai/analyze`

分析 Word 文件并返回结构化结果。

**请求**：`multipart/form-data`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `file` | File | 是 | .docx 文件，最大 10MB |
| `jobTitle` | String | 是 | 岗位名称，用于 LLM 角色设定 |

**响应 200**：

```json
{
  "analysis": { "... 见 3.4 JSON Schema ..." },
  "metadata": {
    "model": "deepseek-chat",
    "analyzedAt": "2026-05-22T10:30:00Z",
    "wordTextLength": 3200
  }
}
```

**错误响应**：

| 状态码 | 场景 |
|--------|------|
| 400 | 文件缺失/格式不对/jobTitle 为空/文件超 10MB |
| 401 | 未登录 |
| 422 | .docx 解析失败，内容为空 |
| 500 | LLM 调用失败/返回格式异常 |

### 4.2 `GET /api/ai/trends`

聚合用户所有面试记录进行趋势分析。

**响应 200**：

```json
{
  "summary": { "... 见 3.4 趋势 JSON Schema ..." },
  "metadata": {
    "totalReviews": 7,
    "analyzedAt": "2026-05-22T10:30:00Z"
  }
}
```

### 4.3 `POST /api/ai/review/:id/reanalyze`

对已有复盘重新运行 AI 分析（如换了模型或补充了 Word 文件）。

**请求**：

```json
{
  "fileId": "att-uuid"  // 可选，使用已有附件重新分析
}
```

---

## 5. 前端交互设计

### 5.1 ReviewModal 改动

在现有"面试资料"区域的附件上传旁，新增"AI 分析"按钮：

```
[上传文件] [AI 分析]  ← 新增
                ↑
         仅当选择了 .docx 文件时可用
```

点击 "AI 分析" 后：

1. 前端显示分析中状态（loading spinner + "AI 正在分析..."）
2. 调用 `POST /api/ai/analyze` 上传文件
3. 返回后弹出 **AI 分析结果面板**
4. 用户修改确认后点"应用结果"，AI 数据填充到表单
5. 用户继续编辑其他字段，最后手动点"创建"保存

### 5.2 AI 结果面板

```
┌─ AI 分析结果 ─────────────────────────────┐
│                                            │
│  多维评分（全部可调）                        │
│  表达清晰度   ★★★★☆  岗位理解  ★★★☆☆    │
│  项目熟悉度   ★★★★☆  ...                  │
│  整体评分     ★★★☆☆                       │
│                                            │
│  优势（可编辑）                              │
│  [文本框：AI 生成的优势分析]                 │
│                                            │
│  不足（可编辑）                              │
│  [文本框：AI 生成的不足分析]                 │
│                                            │
│  面试问题（可增删改）                         │
│  ┌─ 问题 1 ──────────────────────────┐     │
│  │ 问题原文：[editable]               │     │
│  │ 更好的回答：[editable]             │     │
│  └────────────────────────────────────┘     │
│  [+ 添加问题]                               │
│                                            │
│  改进动作（可编辑）                          │
│  [editable]                                 │
│  [+ 添加]                                   │
│                                            │
│  问题标签（可勾选）                          │
│  [标签1] [标签2] [标签3]                    │
│                                            │
│  整体评语（可编辑）                          │
│  [textarea: AI 生成的评价]                  │
│                                            │
│  ┌──────────────────────────────┐          │
│  │  [应用结果]     [取消]       │          │
│  └──────────────────────────────┘          │
└────────────────────────────────────────────┘
```

### 5.3 趋势分析入口

在 `Interview.jsx` 的工具栏区域新增"生成趋势报告"按钮：

```
[搜索框] [结果筛选] [标签筛选] [生成趋势报告]  [新建复盘]
                               ↑ 新增
```

点击后弹出趋势结果的 Modal 展示面板。

### 5.4 状态管理

AI 分析结果仅存储在 ReviewModal 的本地 `useState` 中，不涉及 AppContext 变更。用户点"应用结果"时填充表单状态，点"创建/保存"时通过现有 `addReview`/`updateReview` 方法一并提交。

---

## 6. 数据模型变更

### 6.1 Prisma Schema

Review 模型新增一个字段：

```prisma
model Review {
  // ... 现有字段不变 ...

  aiAnalysis  Json?    @map("ai_analysis")  // 新增
}
```

### 6.2 aiAnalysis 存储结构

```json
{
  "rawResponse": {
    "scores": { "...", "overall": 3 },
    "strengths": "...",
    "weaknesses": "...",
    "questions": [...],
    "improvements": [...],
    "tags": [...],
    "note": "..."
  },
  "metadata": {
    "model": "deepseek-chat",
    "provider": "deepseek",
    "analyzedAt": "2026-05-22T10:30:00Z",
    "wordFileName": "面试复盘_产品经理.docx",
    "wordTextLength": 3200
  },
  "userModified": false
}
```

### 6.3 文件存储

Word 文件在分析后保留，作为 Review 附件管理：

| 环境 | 存储位置 |
|------|----------|
| 本地开发 | `public/uploads/reviews/{reviewId}/{uuid}.docx` |
| Vercel 生产 | Vercel Blob |

附件元数据存入 `review.attachments`：

```json
{
  "id": "att-uuid",
  "fileName": "面试复盘_产品经理_20260522.docx",
  "fileType": "DOCX",
  "fileSize": "32.5 KB",
  "hasFile": true,
  "fileCategory": "复盘文档",
  "description": "AI 分析源文件",
  "uploadDate": "2026-05-22",
  "isSourceForAi": true
}
```

---

## 7. 文件清单

### 新增文件

| 文件 | 职责 |
|------|------|
| `src/lib/llm/client.js` | LLM API 调用封装 |
| `src/lib/llm/prompts.js` | 角色 prompt + JSON schema |
| `src/lib/llm/config.js` | 环境变量配置读取 |
| `src/lib/ai/docParser.js` | mammoth 解析 .docx |
| `src/lib/ai/fileStore.js` | 文件存储抽象（本地/Vercel Blob） |
| `src/app/api/ai/analyze/route.js` | Word 分析 API |
| `src/app/api/ai/trends/route.js` | 趋势总结 API |
| `src/app/api/ai/review/[id]/reanalyze/route.js` | 重新分析 API |
| `src/components/AiResultPanel.jsx` | AI 分析结果预览/编辑面板 |
| `src/components/TrendReportModal.jsx` | 趋势报告展示弹窗 |

### 修改文件

| 文件 | 改动 |
|------|------|
| `src/components/ReviewModal.jsx` | 添加 AI 分析按钮 + 调用 + 结果面板集成 |
| `src/views/Interview.jsx` | 添加"生成趋势报告"按钮 + 趋势弹窗 |
| `prisma/schema.prisma` / `.pg.prisma` / `.sqlite.prisma` | Review 添加 aiAnalysis 字段 |
| `.env` / `.env.pg` | 添加 LLM 环境变量 |

---

## 8. 依赖新增

| 包 | 版本 | 用途 |
|----|------|------|
| `mammoth` | ^2.x | 服务端 .docx → 纯文本解析 |
| `@vercel/blob` | ^8.x | Vercel 生产环境文件存储 |

---

## 9. 错误处理

| 场景 | 前端表现 | 服务端处理 |
|------|----------|-----------|
| 未选择岗位 | "AI 分析"按钮禁用，提示"请先选择岗位" | — |
| 文件非 .docx | 按钮禁用，提示"仅支持 .docx 文件" | — |
| 文件超 10MB | 前端校验拦截 + toast 提示 | 返回 413/400 |
| LLM 超时 | loading 状态 + "分析超时，请重试" | 重试 1 次 |
| LLM 返回非 JSON | "分析异常，请稍后重试" | 重试 1 次 |
| 网络断开 | toast "网络连接失败" | — |
| 趋势分析无数据 | "暂无足够的面试数据" | 返回 400 |

---

## 10. 边界情况

- **新用户无面试记录**：趋势分析返回"暂无数据"，不调用 LLM
- **Word 文件内容极短（<50 字）**：提示"文件内容过少，分析结果可能不准确"
- **岗位名称不常见**：LLM 仍可基于上下文分析，无需预设岗位清单
- **用户修改 AI 结果后更新**：`userModified: true` 记录在 aiAnalysis 中，保留原始分析供对比
- **同文件重复分析**：不受限，每次重新调用 LLM
- **切换 LLM 模型**：改环境变量即可，已有复盘保留原 aiAnalysis 元数据
