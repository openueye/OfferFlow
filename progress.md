# OfferFlow 开发日志

> 会话日志和进度记录

---

## 会话 1：项目初始化

**时间**：2026-05-10

**内容**：
- Vite + React 19 + Tailwind CSS v4 项目脚手架搭建
- AppContext 全局状态层（jobs/resumes/tasks/reviews 四实体 + localStorage 持久化）
- ThemeContext 深色/浅色模式切换
- App.jsx 主容器 + SplashScreen 入场动画
- Navbar / Sidebar / BottomNav 三端导航布局
- mockData 模拟数据生成器

**产出**：基础架构搭建完成，导航系统就绪

---

## 会话 2：8 页面开发

**时间**：2026-05-11

**内容**：
- 全部 8 个页面开发：Dashboard / Board / Positions / Resumes / Schedule / Interview / Insights / Settings
- Board 看板 HTML5 Drag & Drop（10 列状态）
- Recharts 图表面板（漏斗图、柱状图）
- 模拟数据：14 岗位、5 简历、11 任务、7 复盘

**产出**：全部页面功能就绪

---

## 会话 3：弹窗系统

**时间**：2026-05-11

**内容**：
- 所有 CRUD Modal 开发：JobModal / JobDetailModal / TaskModal / ReviewModal / ReviewDetailModal / ResumeModal / ResumePreviewModal
- ConfirmDialog 确认删除弹窗
- Toast 消息通知系统

**产出**：弹窗系统完整可用

---

## 会话 4：主题系统

**时间**：2026-05-11

**内容**：
- index.css 全面重构，30+ 语义化 CSS 自定义属性
- :root / .dark 双主题体系
- 环境光晕、渐变边框、暗色滚动条
- 浅色渐变纹理背景

**产出**：完整的深色/浅色主题系统

---

## 会话 5：SplashScreen + GlowCard

**时间**：2026-05-12

**内容**：
- SplashScreen 视觉增强（Playfair Display 字体、背景图、3 阶段入场动效）
- Splash 主题切换闪退 Bug 修复（exitClassRef）
- GlowCard 鼠标跟随光效组件
- 独立引导页 splash.html

**产出**：Splash 视觉品质提升，GlowCard 光效系统

---

## 会话 6：Sidebar 重构

**时间**：2026-05-13 ~ 2026-05-17

**内容**：
- Sidebar B 端 SaaS 风格全面重构
- 深色/浅色模式验收修复（oklch 色彩空间）
- Sidebar 尺寸两轮放大（280px → 300px）
- 浅色模式玻璃态面板修复

**产出**：Sidebar B 端风格确定

---

## 会话 7：弹窗系统收尾

**时间**：2026-05-14 ~ 2026-05-15

**内容**：
- ModalHeader 组件提取与全模块覆盖
- GlowCard 覆盖全部弹窗 + 表单模式 handleFocusIn
- SplashScreen 浅色模式退出动画修复
- Insights 面板 InterviewDetailModal 弱光效变体

**产出**：弹窗系统统一收尾

---

## 会话 8（当前）：规划系统接入

**时间**：2026-05-17

**内容**：
- 发现并接入 planning-with-files-zh 技能
- 创建 task_plan.md / findings.md / progress.md
- 回溯记录已完成的工作
- 确立后续迭代计划

**下一阶段**：
- 按 task_plan.md 阶段 9 中优先级推进新功能
- 每个阶段完成后更新规划文件
- 新 Bug/优化项记入 task_plan.md

---

## 会话 9：简历文件 IndexedDB 持久化

**时间**：2026-05-17

**内容**：
- 新建 `src/utils/resumeFileStore.js` — IndexedDB 封装（saveResumeFile / getResumeFile / deleteResumeFile / createObjectUrl）
- 重写 ResumeModal.jsx 文件上传逻辑
- 重写 ResumePreviewModal.jsx 文件预览逻辑
- 修改 Resumes.jsx：删除简历时异步清理 IndexedDB 文件
- 验收通过

**产出**：简历文件持久化完成

---

## 会话 10：简历文件持久化链路审计与修复

**时间**：2026-05-17

**内容**：
- 6 项审计检查，3 项修复
- 新增 `saving` 状态防重复提交
- 编辑模式显式保留文件字段
- 所有 IndexedDB 操作增加完整日志

**产出**：简历持久化链路审计通过，运行日志可追踪

---

## 会话 11：ReviewDetailModal 黑屏崩溃修复

**时间**：2026-05-18

**内容**：
- ReviewDetailModal 黑屏崩溃修复：
  - 新增 `normalizeAttachments()` 防御性函数，`Array.isArray` 检查所有数组字段
  - 修复 `renderStars(review.rating)` → `renderStars(liveReview.rating)`
  - 移除复杂的内联 Preview Overlay（~70 行 + 5 状态变量 + 2 useEffect）
  - 替换为轻量级 `handleOpenAttachment`

**产出**：黑屏崩溃修复，附件预览重构

---

## 会话 12：面试复盘附件持久化全链路修复

**时间**：2026-05-18

**内容**：
- `reviewAttachmentStore.js` 全面重写（db.close、直接返回 blob）
- AppContext 修复（addReview 防御、updateReview 显式 attachments）
- ReviewModal 修复（多文件支持、reviewId 统一确定）
- ReviewDetailModal 同步接口变更

**产出**：附件持久化全链路修复，多文件上传支持

---

## 会话 13：Tailwind v4 边距 Bug + 卡片菜单 Portal + 弹窗滚动 + 标签云

**时间**：2026-05-18

**内容**：
- 删除无层叠 `* { margin:0;padding:0 }` 修复 Tailwind v4 utilities 边距全局失效
- 新增 ActionMenuPortal 组件解决 Board 卡片菜单被父容器裁切
- GlowCard glow-content flex 修复使 ReviewModal/ReviewDetailModal 可滚动
- Interview 页新增 TagCloud 组件

**产出**：多项 Bug 修复 + Portal 组件 + 标签云功能

---

## 会话 14：Next.js 全栈迁移规划

**时间**：2026-05-18

**内容**：
- 全面分析现有项目架构（31 个源文件，4 实体，8 页面，9 弹窗）
- 制定 Next.js App Router 全栈迁移方案
- 输出完整迁移架构：目录结构、路由设计、状态管理适配策略
- 输出 package.json 依赖变更清单
- 验证 Tailwind CSS v4 + Next.js 集成路径
- 确认 Recharts SSR 动态导入方案
- 设计认证系统架构（Auth.js + Prisma + PostgreSQL）
- 设计文件上传双轨策略（IndexedDB 过渡 → API 持久化）
- 更新 task_plan.md 添加阶段 10（Next.js 迁移）和阶段 11（SaaS 功能）
- 更新 findings.md 添加 Next.js 迁移研究
- 准备更新产品需求文档

**产出**：Next.js 全栈迁移方案定稿，规划完成

---

## 会话 15（当前）：Next.js 全栈迁移执行

**时间**：2026-05-18

**内容**：
- 移除 Vite 依赖，安装 Next.js 16.2.6 + 相关包
- 配置 next.config.mjs、postcss.config.mjs（@tailwindcss/postcss）、jsconfig.json（@/ 别名）
- 创建 App Router 结构：根布局、路由组 (main)/auth/、根页面（redirect）
- 迁移 providers.jsx（SessionProvider + ThemeProvider + AppProvider 聚合）
- 组件迁移：Navbar/Sidebar/BottomNav 使用 usePathname() + useRouter()
- Sidebar/BottomNav 选中态逻辑从 activePage 比较改为路径名比较
- SplashScreen 改为 sessionStorage 首次访问检测
- 8 个页面迁移至 src/views/（避免 Pages Router 冲突），路由页面薄封装
- AppContext 移除 activePage/setActiveState，ThemeContext/AppContext 添加 SSR 守卫
- 创建 AuthContext（基于 next-auth session 的认证状态）
- 修复 (main)/layout.jsx 静态预渲染问题（force-dynamic + 客户端/服务端拆分）
- 修复 auth/layout.jsx 静态预渲染问题（force-dynamic）
- 创建 prisma/schema.prisma（5 模型：User/Job/Resume/Task/Review）
- 创建 src/lib/prisma.js（Prisma 客户端单例）
- 创建 6 个 API Route 桩（jobs/resumes/tasks/reviews/upload，auth/[...nextauth]）
- 配置 NextAuth v4（CredentialsProvider + JWT strategy）
- 创建 src/middleware.js 路由保护中间件
- 清理旧文件：删除 index.html、splash.html、vite.config.js、eslint.config.js、src/main.jsx、src/App.jsx
- 清理 dist/ 和 _screenshot2.cjs 构建产物
- 删除 src/pages → src/views（避免 Pages Router 冲突）
- 添加 .env.local（NEXTAUTH_SECRET + NEXTAUTH_URL）
- 修复 Next.js 16 middleware 兼容性（exports function 而非 re-export pattern）

**遇到的问题与修复**：

| 问题 | 解决方案 |
|------|----------|
| Pages Router 与 App Router 冲突（src/pages/） | 移动到 src/views/ |
| 静态预渲染时 useApp() 找不到 Provider | (main)/layout.jsx 拆分为服务端/客户端，force-dynamic |
| SSR 中 localStorage/window 未定义 | 添加 `typeof window === 'undefined'` 守卫 |
| NextAuth Configuration error | 添加 NEXTAUTH_SECRET 环境变量 |
| Next.js 16 middleware re-export 弃用 | 改为显式 `withAuth({...})` 函数导出 |

**验证结果**：
- `npm run build` ✅ — 12 条路由全部通过（3 static + 9 dynamic）
- `npm run dev` ✅ — Turbopack <300ms 冷启动
- `GET /auth/login` → 200（完整 HTML + 深色主题渲染）
- `GET /auth/register` → 200
- `GET /dashboard` → 307 → `/auth/login?callbackUrl=%2Fdashboard`
- `/board`, `/positions`, `/resumes`, `/interview`, `/schedule`, `/insights`, `/settings` 全部正确 307 重定向
- `GET /api/auth/session` → `{}`（未认证状态正确）
- `GET /api/jobs|resumes|tasks|reviews` → `"not yet implemented"`（API 桩正确响应）
- 删除旧文件（dist/、_screenshot2.cjs）

**产出**：
- React+Vite SPA → Next.js 16 App Router 全栈架构迁移完成
- 认证系统基建就绪（登录/注册/中间件/SessionProvider）
- API Route 桩就绪（5 业务 API + Upload + Auth）
- Prisma 数据模型就绪（5 模型 + 关系定义）
- 零功能丢失：全部 UI、交互、主题、数据层保留
- 3 层数据持久化架构：localStorage（客户端） + IndexedDB（文件） + API/DB（服务端）

**下一阶段**：
- 阶段 11：SaaS 功能开发（数据云端同步、多设备同步）
- 补充测试（Playwright E2E 测试）
- 数据库连接配置（DATABASE_URL）
- 产品需求文档更新

---

## 会话 16：用户注册登录系统 + 自定义 JWT 认证

**时间**：2026-05-18

**内容**：
- 移除 `next-auth` 依赖，安装 `bcryptjs` + `jose`
- 重写 Prisma schema：User 模型改为 username + passwordHash，SQLite 开发数据库
- 创建 `src/lib/jwt.js`：基于 jose 的 HS256 JWT 签名/验证工具
- 创建 `src/lib/auth.js`：服务端 `getAuthUser()` / `requireAuth()` 辅助函数
- 创建 4 个 Auth API Route：
  - `POST /api/auth/register` — 注册（验证 → bcrypt 哈希 → 创建用户 → 签发 JWT）
  - `POST /api/auth/login` — 登录（查询用户 → bcrypt 比对 → 签发 JWT）
  - `POST /api/auth/logout` — 登出（清除 Cookie）
  - `GET /api/auth/me` — 当前用户（Cookie → JWT 验证 → 查询用户）
- 重写 `src/middleware.js`：自定义 JWT Cookie 验证，替代 next-auth middleware
- 重写 `src/store/AuthContext.jsx`：自定义 login/register/logout/fetchUser，替代 next-auth session
- 更新 `src/app/providers.jsx`：移除 SessionProvider，保留 AuthProvider
- 创建 SplashScreen + 登录双 Tab 合一页：`auth/layout.jsx`（Splash） + `auth/login/page.jsx`（Tab 切换）
- 简化 `main-layout-client.jsx`：移除 SplashScreen（移至 auth 流程）
- 配置 `.env`：DATABASE_URL（SQLite）、JWT_SECRET
- 执行 `prisma db push` 创建 SQLite 数据库
- 删除旧文件：`[...nextauth]/` route、`auth/register/` 页面、`.env.local`

**遇到的问题与修复**：

| 问题 | 解决方案 |
|------|----------|
| Prisma 验证错误：Resume.jobs 缺少对应 relation | 在 Job model 中添加 `resume Resume?` 关系字段 |
| Prisma 找不到 DATABASE_URL | 创建 `.env`（Prisma CLI 仅读取 .env，不读 .env.local） |
| `auth/layout.jsx` 引用了不存在的 `./login-form` 组件 | 移除该 import |
| 构建失败：`useSearchParams()` 需要 Suspense 边界 | 将 LoginForm 抽为子组件，外层用 `<Suspense>` 包裹 |
| Port 3000 被旧进程占用 | 多轮 kill 旧进程 |

**验证结果**：
- `npm run build` ✅ — 19 条路由全部通过（3 static + 16 dynamic）
- `POST /api/auth/register` ✅ — 创建用户 `testuser`，签发 Cookie
- `POST /api/auth/login` ✅ — 正确认证，签发 JWT Cookie
- `GET /api/auth/me` ✅ — 有 Cookie 返回 user，无 Cookie 返回 null
- `GET /dashboard` with Cookie ✅ — 200 可访问
- `GET /dashboard` without Cookie ✅ — 307 redirect to /auth/login
- `POST /api/auth/logout` ✅ — 清除 Cookie
- 重复注册 ✅ — 409 "用户名已被注册"
- 错误密码 ✅ — 401 "用户名或密码错误"
- 短密码 ✅ — 400 "密码长度至少 6 位"
- 空字段 ✅ — 400 "用户名和密码不能为空"

**产出**：
- 完整的用户注册登录系统（用户名+密码、bcrypt、JWT、httpOnly Cookie）
- 认证流程：SplashScreen → 登录/注册 → Dashboard
- SQLite 开发数据库就绪
- 产品需求文档更新至 v2.1

**下一阶段**：
- 阶段 12：SaaS 功能开发（数据云端同步、PostgreSQL 生产环境、多设备同步）
- 补充 Playwright E2E 测试

---

## 会话 21：退出登录功能

**时间**：2026-05-19

**内容**：
- 在 Navbar 右上角添加用户头像下拉菜单
- 菜单显示用户名 + 已登录状态
- 菜单包含"退出登录"按钮（红色样式，退出图标）
- 点击退出：
  - 关闭菜单
  - addToast('已退出登录', 'success')
  - POST /api/auth/logout → 清除 httpOnly Cookie
  - AuthContext 清除 user 状态
  - 400ms 延迟后 router.push('/auth/login')
- 菜单点击外部 / Escape 自动关闭
- 动画：animate-fade-in 入场
- 深色/浅色模式完整适配
- 清理 AuthContext：移除 router 依赖，logout 不直接跳转

**产出**：用户可通过 Navbar 右上角头像菜单退出登录

## 会话 20：登录页面重新设计

**时间**：2026-05-19

**内容**：
- 重新设计 auth/layout.jsx 和 auth/login/page.jsx
- **auth/layout.jsx 改动**：
  - 新增 3 层环境光晕（左上紫、右下青、中心散射）
  - 使用 `fixed` 定位光晕，不参与布局流
- **auth/login/page.jsx 改动**：
  - GlowCard 包裹表单卡片，提供鼠标跟随聚光灯
  - 浅色模式：玻璃拟态 (`bg-white/80 backdrop-blur-xl`)
  - 暗色模式：`dark:bg-[rgba(20,20,25,0.65)]` 半透明暗色
  - `max-w-[420px]` 居中卡片宽度
  - 品牌 Logo 紫色渐变圆角方块
  - Tab 滑动指示器动画
  - 输入框 focus ring + hover 边框
  - 注册确认密码字段 fade-in 动画
  - 按钮 hover 内发光效果
  - 底部切换链接
  - 加载 spinner
- 构建 ✅，21 routes 全部通过

**产出**：登录页面水平垂直居中，GlowCard SaaS 质感，完整主题适配

## 会话 19：Console JSON 解析错误修复

**时间**：2026-05-19

**内容**：
- 用户报告控制台报错：`Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- **Root Cause**：中间件对所有未认证请求返回 HTML 307 重定向，包括 API 路由。AppContext 在登录页挂载时 fetch 受保护的 API，收到 HTML 后解析为 JSON 失败
- **修复**：中间件区分 API 路由（返回 JSON 401）和页面路由（保持 HTML 307 重定向）
- 修改 `src/middleware.js`：提取 `getTokenPayload()` 辅助函数；API 路由未认证时返回 `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`；页面路由保持原有重定向逻辑
- 构建 ✅，验证通过（API 返回 JSON，页面路由保持重定向）
- 更新 findings.md / progress.md / 产品文档

**产出**：控制台无红色 JSON 解析错误，API 路由优雅处理未认证请求

## 会话 18：SplashScreen 滚轮下滑进入修复

**时间**：2026-05-19

**时间**：2026-05-19

**内容**：
- 诊断 SplashScreen 鼠标滚轮无法触发进入的问题
- **Root Cause**：auth/layout.jsx 内联了 SplashScreen 的 UI 代码但没有绑定 wheel/touch 事件监听器
- 内联版本只有按钮 `onClick`，滚轮和触屏事件从未被注册
- **修复**：移除 auth/layout.jsx 中 ~60 行内联 Splash 代码，直接复用 `SplashScreen` 组件
- SplashScreen 组件已具备完整的：
  - `useEffect` 绑定 wheel 事件（`deltaY > 10` 阈值过滤）
  - `useEffect` 绑定 touchstart/touchend（`diff > 40` 上滑检测）
  - `{ passive: true }` 被动事件监听模式
  - `enteredRef` 防重复触发
  - cleanup 函数移除所有监听器
  - `exitClassRef` 防止主题切换重播退出动画
- 更新 findings.md 记录根因分析
- 更新 task_plan.md 和产品文档

**产出**：SplashScreen 支持滚轮下滑/触屏上滑/按钮点击三种方式进入，交互体验完整

## 会话 17：localStorage → SQLite (Prisma) 数据迁移

**时间**：2026-05-18

**内容**：
- 所有 4 个 API 端点 jobs/resumes/tasks/reviews 全量 CRUD 实现（GET/POST/PUT/DELETE）
  - 每个端点通过 getAuthUser() 验证 JWT，按 userId 过滤数据
  - 所有修改操作验证数据所有权（existing.userId !== user.id → 403）
  - DELETE 支持单条（?id=）和批量（{ ids: [...] }）两种模式
- AppContext 重写为异步 API 驱动模式：
  - 同步 setXxx(fn) → 异步 addXxx/updateXxx/deleteXxx CRUD 方法
  - 错误在 CRUD 方法内部捕获，通过 addToast 通知用户
  - localStorage 保留为缓存层（每次写入同步）和回退层（API 失败时）
  - 启动时 loadAllData() 先尝试 API，失败时回退到 localStorage
  - Seed API 自动初始化新用户数据（4 实体交叉关联）
- 修复了 `resumeId: ''` → `null` 的 Prisma FK 问题（空字符串导致外键约束失败）
- 删除未使用的 `src/lib/api-utils.js`

**变更的文件**：
- `src/store/AppContext.jsx` — 全面重写为 API 驱动
- `src/app/api/jobs/route.js` — 全量 CRUD + JWT 认证
- `src/app/api/resumes/route.js` — 全量 CRUD + JWT 认证
- `src/app/api/tasks/route.js` — 全量 CRUD + JWT 认证
- `src/app/api/reviews/route.js` — 全量 CRUD + JWT 认证
- `src/app/api/seed/route.js` — 新用户数据初始化
- 所有 View/Component 文件 — setState → API CRUD 方法替换
- `src/lib/api-utils.js` — 删除（未使用）

**验证结果**：
- `npm run build` ✅ — 20 路由全部通过
- `POST /api/jobs` ✅ — 201 Created
- `PUT /api/jobs` ✅ — 200 Updated
- `DELETE /api/jobs` ✅ — 200 Deleted
- 14 个岗位、5 个简历、11 个任务、7 个复盘自动种子数据
- 用户数据隔离验证通过

**产出**：
- localStorage → SQLite (Prisma) 数据迁移完成
- 所有 4 实体支持云端 CRUD，用户数据完全隔离
- JWT 认证 + 数据所有权验证双重安全
- localStorage 缓存/回退确保离线兼容

---

## 会话 22：Vercel 部署 + Neon PostgreSQL 迁移

**时间**：2026-05-19

**内容**：
- 配置 Prisma 双数据库模式（SQLite 本地开发 / PostgreSQL 生产）
- 创建 `prisma/schema.pg.prisma`（PostgreSQL provider + directUrl + relationMode）
- 创建 `prisma/schema.sqlite.prisma`（SQLite provider，完全兼容模型）
- 创建 `.env.pg`（Neon 连接字符串）和 `.env.sqlite`（SQLite 连接字符串）
- 添加 npm scripts：`db:sqlite` / `db:pg` / `postinstall`
- 解决 Supabase 数据库仅 IPv6 导致 Vercel 无法连接的问题
  - 诊断端点在 Vercel 部署后确认：DNS 仅返回 IPv6，443/5432/6543 全部超时
  - 迁移至 Neon PostgreSQL（完整的 IPv4 + IPv6 双栈支持）
- 添加 Vercel 部署配置（`vercel.json`，outputDirectory: .next）
- 添加 `/api/debug` 到中间件公开路由（方便诊断）
- 更新 `.gitignore` 保护所有 `.env.*` 文件
- 在 Vercel Dashboard 配置环境变量（DATABASE_URL、DIRECT_URL、JWT_SECRET）
- Prisma db push 建表成功（5 tables：User/Job/Resume/Task/Review）
- 数据库连接正常，应用可注册登录

**遇到的问题**：

| 问题 | 解决方案 |
|------|----------|
| Supabase 数据库仅 IPv6 地址 | 改用 Neon PostgreSQL（IPv4 + IPv6 双栈） |
| Prisma 连接池兼容性 | 添加 `directUrl` 和 `relationMode = "prisma"` |
| Vercel build 找不到输出目录 | 设置 `vercel.json` 的 outputDirectory 为 `.next` |
| Vercel CLI 交互式命令无法使用 | 通过 Vercel Dashboard Web UI 配置环境变量 |
| `prisma db push` Neon 连接成功 | 13 秒完成建表 |

**已知问题**（已记录，待修复）：

| # | 问题 | 说明 | 状态 |
|---|------|------|------|
| 1 | Seed 数据应为 user 账户专用 | 所有新注册用户都会触发 `/api/seed` 写入 14 岗位/5 简历/11 任务/7 复盘，导致每个登录用户看到相同的测试数据。**修复方向**：仅用户名为 `"user"` 时触发 seed，其他用户空数据启动 | ⏳ 已记录 |
| 2 | 用户自建数据已隔离 | API 路由已按 `userId` 过滤，CRUD 验证数据所有权。用户自行创建的数据是严格隔离的。本地 SQLite 无此问题 | ✅ 隔离正确 |

**技术栈变更**：
- 数据库：SQLite → **Neon PostgreSQL**（生产）/ SQLite（本地开发）
- 部署平台：Localhost → **Vercel**
- 连接方式：Prisma direct → **Prisma + Neon Pooler**

**相关文件**：
- `prisma/schema.pg.prisma` — PostgreSQL schema（新建）
- `prisma/schema.sqlite.prisma` — SQLite schema（新建）
- `prisma/schema.prisma` — 符号链接/构建时复制
- `.env.pg` / `.env.sqlite` — 环境变量模板（新建）
- `vercel.json` — 部署配置（新建）
- `src/app/api/debug/db-check/route.js` — 诊断端点（新建）
- `src/middleware.js` — 添加 `/api/debug` 公开路径

**产出**：
- 应用成功部署到 Vercel
- 生产数据库使用 Neon PostgreSQL，连接稳定
- 双数据库模式配置完成，开发/生产环境互不干扰
- 内置诊断端点可用于快速排查连接问题

---

## 会话 23：用户数据隔离修复

**时间**：2026-05-20

**内容**：
- **根因分析**：
  - API 路由的 GET/POST/PUT/DELETE 已正确按 `userId` 过滤数据，**API 层数据隔离本身没有 bug**
  - **真正问题 1**：`AppContext.jsx` 的 `loadAllData()` 在检测到空数据时自动调用 `/api/seed`，导致**每个新用户**都写入相同的 14 岗位、5 简历、11 任务、7 复盘数据。虽然 userId 正确绑定，但数据值完全相同，用户感知为"看到同一份数据"
  - **真正问题 2**：GET 端点在未认证时返回 `[]` 而非 401，apiFetch 成功解析为空数组，触发 seed 路径
  - **次要风险**：退出登录后 localStorage 未清理，如果后续 API 失败会回退到旧用户缓存

- **修复清单**：

  | # | 文件 | 改动 |
  |---|------|------|
  | 1 | `src/app/api/jobs/route.js` | GET 未认证返回 401 JSON |
  | 2 | `src/app/api/resumes/route.js` | GET 未认证返回 401 JSON |
  | 3 | `src/app/api/tasks/route.js` | GET 未认证返回 401 JSON |
  | 4 | `src/app/api/reviews/route.js` | GET 未认证返回 401 JSON |
  | 5 | `src/app/api/seed/route.js` | 仅 `user.username === 'user'` 可触发种子数据 |
  | 6 | `src/store/AppContext.jsx` | 移除自动 seed；401 时不回退 localStorage；监听认证状态自动重载 |
  | 7 | `src/store/AuthContext.jsx` | 退出登录时清除所有 localStorage 缓存 |
  | 8 | `prisma/schema.prisma` | Job/Resume/Task/Review 添加 `@@index([userId])` |
  | 9 | `prisma/schema.pg.prisma` | 同上索引 |
  | 10 | `prisma/schema.sqlite.prisma` | 同上索引 |

**产出**：
- 用户数据完全隔离：每个用户只看到自己创建的数据
- 测试账户 `user`（密码 `000000`）仍可使用种子演示数据
- 新注册账户空数据启动，从零创建自己的数据
- 生产数据库索引优化查询性能

**遗留事项**：
- 需部署后清理 Neon 中非 `user` 账户的多余种子数据
- 执行 SQL：`DELETE FROM jobs WHERE userId NOT IN (SELECT id FROM users WHERE username = 'user');`（4 表级联）

---

## 会话 24：演示账号 Seed 机制

**时间**：2026-05-20

**内容**：
- 创建 `src/lib/seedDemoData.js`，提供两个核心函数：
  - `ensureDemoUser()` — 检查 demo 用户是否存在，不存在则用 bcrypt 创建（密码 000000）
  - `seedDemoDataForUser(userId)` — 写入 14 岗位/5 简历/11 任务/7 复盘，带 userId 绑定；幂等（已有数据则跳过）
- 修改登录路由：`username === 'user'` 时自动调用 `ensureDemoUser()` → 正常认证 → `seedDemoDataForUser()`
- 修改注册路由：阻止注册保留用户名 `user`（返回 409）
- 简化 `seed/route.js`：委托 `seedDemoDataForUser()`，移除内联的种子数据

**设计要点**：
- 种子数据从 `seed/route.js` 移到 `src/lib/seedDemoData.js`，login 和 seed API 共用
- `ensureDemoUser()` 使用 bcrypt 实时哈希，不存明文密码
- `seedDemoDataForUser()` 先 count jobs，有数据则跳过（幂等）
- 普通用户注册/登录完全不受影响，不走 seed 路径
- 所有 seed 数据绑定传入的 userId，数据隔离不变

**验证结果**：
- `npm run build` ✅ — 22 路由全部通过
- 登录 `user` / `000000` → 自动创建账号 → 写入种子数据 → 用户看到完整数据
- 再次登录 `user` → 种子已存在，跳过写入
- 注册新用户 → 阻止注册 `user`（409）；其他用户名正常注册
- 普通用户登录 → 空数据

**修改/创建的文件**：
- `src/lib/seedDemoData.js` — 新建（核心逻辑）
- `src/app/api/auth/login/route.js` — 修改（添加 auto-create + seed）
- `src/app/api/auth/register/route.js` — 修改（阻止注册 `user`）
- `src/app/api/seed/route.js` — 修改（简化为委托调用）

---

## 会话 26（当前）：AI 面试复盘分析系统 — 设计定稿 + 实施中

**时间**：2026-05-22

**内容**：
- 完成 AI 面试复盘分析系统设计文档（docs/superpowers/specs/2026-05-22-ai-interview-analysis-design.md）
- 架构设计：LLM 客户端抽象层（OpenAI-compatible）→ mammoth .docx 解析 → 3 个新 API 路由 → 2 个前端新组件
- 支持模型切换（DeepSeek / Xiaomi MiMo 通过环境变量切换）
- 三种分析模式：Word 文件分析、岗位角色适配、历史趋势总结
- "预览 → 修改 → 确认保存"的用户交互流程
- 实施计划已产出（15 个 Task），使用 Subagent-Driven Development 执行
- 更新产品文档（目录结构、6.8 面试复盘、8.4 数据模型、12 现状规划、15 改动日志）

**产出**：
- `docs/superpowers/specs/2026-05-22-ai-interview-analysis-design.md`
- `docs/superpowers/plans/2026-05-22-ai-interview-analysis-plan.md`
- `task_plan.md` 阶段 21 添加
- 产品文档更新至 v2.6

## 会话 25：退出登录 SplashScreen 重置

**时间**：2026-05-20

**内容**：
- **问题**：退出登录后跳转到 `/auth/login`，SplashScreen 一闪而过直接进入登录界面
- **Root Cause**：
  1. `AuthContext.logout()` 清除了 `localStorage` 但未清除 `sessionStorage` 中的 `offerflow_splash_shown` 标记
  2. 重新访问 `/auth/login` 时，`auth/layout.jsx` 的 `useEffect` 检测到 `sessionStorage` 标记存在，立即将 `splashDone` 设为 `true`
  3. SplashScreen 在极短时间内渲染又退出，形成"一闪而过"的观感
- **修复**：
  - `AuthContext.jsx` — logout 中添加 `sessionStorage.removeItem('offerflow_splash_shown')`
  - `auth/layout.jsx` — 改为 `useState` 同步惰性初始值读取 `sessionStorage`：
    - 同步执行，首次渲染时值就正确，无需 `useEffect` 二次修正
    - 退出登录后 `sessionStorage` 已清 → 初始值 `false` → SplashScreen 正常展示
    - 非退出重入（如浏览器返回）→ `sessionStorage` 标记存在 → 初始值 `true` → 直接跳过 SplashScreen（无闪屏）
    - 首次访问 → `sessionStorage` 无标记 → 初始值 `false` → SplashScreen 正常展示
  - 移除不再使用的 `useEffect` 导入

**验证结果**：
- `npm run build` ✅ — 22 路由全部通过



## 会话 26：AI 面试复盘分析系统

**时间**：2026-05-22

**内容**：
- 依赖安装（mammoth v1.x, @vercel/blob v2.x）
- LLM 抽象层：config.js / client.js（重试、超时）/ prompts.js（中文 prompt + JSON schema）
- .docx 解析模块（mammoth.extractRawText）+ 文件存储模块（本地磁盘）
- Prisma 3 个 schema 添加 aiAnalysis Json? 字段
- POST /api/ai/analyze — Word 上传 + 解析 + LLM 分析
- GET /api/ai/trends — 历史面试趋势总结
- POST /api/ai/review/:id/reanalyze — 重新分析
- AiResultPanel 组件（"预览→修改→确认" 模式）
- ReviewModal AI 集成（上传 .docx → AI 分析 → 修改 → 应用）
- TrendReportModal 组件（高频薄弱点、评分趋势、建议等）
- Interview.jsx 趋势报告入口（紫色按钮 + 弹窗）
- 构建验证全部通过（3 AI 路由出现在构建输出中）
- .env 添加 LLM 配置环境变量

**LLM 配置**：
- 提供方：DeepSeek（默认）/ Xiaomi MiMo（可通过环境变量切换）
- env 变量：LLM_PROVIDER, LLM_API_KEY, LLM_BASE_URL, LLM_MODEL
- API 格式：OpenAI-compatible，零代码变更切换

**产出**：AI 面试复盘分析系统开发完成，等待用户配置 LLM_API_KEY 后即可使用。

**后续修复**：
- prompt 添加完整 JSON schema 定义，确保 AI 返回的字段名和结构与前端组件匹配
- AiResultPanel 浅色模式修复：textareas（优势/不足/评语）文本颜色、改进动作文字、问题卡片背景/边框
