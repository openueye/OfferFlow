# 渐进式岗位导入

## Problem Statement

如何让求职者只提供 Boss 直聘、公司招聘官网、小红书或微信公众号中的岗位链接，就能获得可核对的岗位信息预填结果，并在网页不可读取时自然降级为粘贴 JD？

## Recommended Direction

在现有“新增岗位”表单顶部增加一个 AI 导入区。用户先粘贴链接并请求分析；服务端安全地读取公开网页正文并交给现有 OpenAI-compatible LLM。如果网页需要登录、禁止抓取或内容不足，界面保留原链接并提示用户粘贴 JD 原文后再次分析。

分析结果先以预览形式展示，用户点击“应用到表单”后才写入当前表单，仍需手动点击“新增岗位”才会保存。AI 不得直接创建记录，也不得猜测网页中没有明确提供的信息。

## API Contract

`POST /api/ai/job-import`

请求：

```json
{
  "jobLink": "https://example.com/jobs/123",
  "jdText": "可选；提供时优先分析该文本",
  "llmConfig": {
    "provider": "deepseek",
    "apiKey": "可选；沿用现有本地模型配置",
    "baseUrl": "可选",
    "model": "可选"
  }
}
```

成功响应：

```json
{
  "status": "ready",
  "fields": {
    "companyName": "",
    "jobTitle": "",
    "city": "",
    "salaryRange": "",
    "workMode": "",
    "channel": "",
    "jobLink": "",
    "jdText": ""
  },
  "metadata": {
    "source": "boss|wechat|xiaohongshu|companyWebsite|manualText",
    "sourceMode": "url|text",
    "model": ""
  }
}
```

网页不可读取时返回 `422`，响应包含 `code: "PAGE_UNAVAILABLE"` 和 `needsManualText: true`。其他错误沿用项目现有的 `{ error, code? }` 形式。

## Key Assumptions to Validate

- [ ] 公司官网与公开公众号文章能在足够多的情况下提取出有效正文；以实际导入链接的成功率验证。
- [ ] Boss 与小红书抓取失败后，粘贴 JD 的降级流程仍比完整手填更省时；比较导入前后的录入耗时。
- [ ] 用户愿意在保存前检查 AI 结果；观察“应用后修改字段”的比例来识别易错字段。

## MVP Scope

- 支持 HTTPS 岗位链接和直接粘贴 JD 两种输入。
- 自动识别 Boss、微信公众号、小红书和普通公司官网来源。
- 仅预填公司、岗位名称、城市、薪资、工作模式、渠道、岗位链接和 JD 原文。
- 状态保持“感兴趣”，优先级保持“中”，投递日期不自动填写。
- 对抓取失败、模型未配置、模型输出异常分别给出可行动的错误提示。
- 服务端限制 URL、DNS 目标、重定向、响应类型、正文大小和请求时长。

## Not Doing (and Why)

- **自动登录或绕过反爬**：安全和维护成本高，也不应尝试规避第三方访问控制。
- **浏览器扩展或书签脚本**：能提高登录页面成功率，但不是验证核心体验所必需。
- **截图 OCR**：适合作为后续降级方式，首版先验证链接加文本粘贴是否足够。
- **自动保存岗位**：模型可能提取错误，必须由用户确认并通过现有表单保存。
- **为每个平台维护脆弱的 DOM 选择器**：首版使用通用正文提取，避免网站改版立即破坏功能。

## Security Boundaries

- 用户提供的 URL、远端 DNS、重定向、网页内容和 LLM 输出全部是不可信输入。
- 仅允许 HTTPS；拒绝凭据、非 443 端口、IP 字面量、本机名、私有/保留 DNS 地址。
- DNS 解析结果固定用于实际连接，避免检查后重新解析造成 DNS rebinding。
- 最多跟随三次重定向，每一跳重新校验；只接受文本/HTML，限制响应大小和超时。
- 网页中的提示词指令不具备权限；LLM 输出经白名单、类型、枚举和长度校验后只用于预览。

## Open Questions

- 实际使用一段时间后，是否值得为失败率最高的平台增加浏览器辅助导入？
- 是否需要在第二阶段加入截图 OCR 作为第三层降级路径？
