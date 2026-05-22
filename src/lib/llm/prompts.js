// src/lib/llm/prompts.js

/**
 * 构建面试分析 prompt
 * @param {string} jobTitle - 岗位名称
 * @param {string} interviewText - 面试记录文本
 */
export function buildAnalyzePrompt({ jobTitle, interviewText }) {
  const schema = `{
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
  "strengths": "string - 做得好的地方",
  "weaknesses": "string - 需要改进的地方",
  "note": "string - 综合评价",
  "questions": [{ "id": "unique-id", "question": "问题原文", "myAnswer": "你的回答", "satisfaction": 1-5, "betterAnswer": "更好的回答", "skills": "涉及能力点" }],
  "improvements": [{ "id": "unique-id", "action": "具体改进行动" }],
  "positiveTags": ["string - 优势标签，如项目经历真实、表达清晰"],
  "negativeTags": ["string - 问题标签，仅限会降低面试通过率的不足"]
}`

  return {
    system: `你是一名资深的${jobTitle}面试专家。你正在分析一份面试记录。请从面试官角度，对候选人的表现进行打分和评价。

分类输出标签（positiveTags / negativeTags）时严格遵循以下规则：
1. positiveTags 放入候选人的优势、亮点、正面表现（如：项目经历真实、表达清晰）
2. negativeTags 仅放入候选人的不足和会降低面试通过率的问题（如：项目细节不熟、表达不清）
3. 绝对不允许将任何优势/正面表现放入 negativeTags
4. 标签使用简短的中文短语

常见标签参考（不限于此）：
- positiveTags 示例：项目经历真实 | 动手能力强 | 表达清晰 | 逻辑较好 | 沟通自然 | 学习能力强 | 业务理解较好 | 技术基础扎实 | 抗压能力强
- negativeTags 示例：项目细节不熟 | 表达不清 | 业务理解不足 | 准备不足 | 缺少数据意识 | 逻辑混乱 | 紧张卡壳 | 回答深度不足 | 八股基础薄弱 | 系统设计薄弱 | 反问质量低

严格按照下面的 JSON schema 输出，确保所有字段都存在，不要包含任何其他文字。`,
    user: `请分析以下面试记录，严格按照 JSON 格式输出：

JSON Schema:
${schema}

面试记录：
---
${interviewText}
---`,
  }
}

/**
 * 构建趋势分析 prompt
 * @param {object[]} reviews - 用户所有面试记录
 */
export function buildTrendsPrompt({ reviews }) {
  const schema = `{
  "高频薄弱点": ["string - 高频出现的负面标签（negativeTags）"],
  "评分趋势": "string - 评分随时间的变化趋势描述",
  "进步项": ["string - 相比之前有进步的地方"],
  "建议": ["string - 改进建议"],
  "commonQuestions": ["string - 常见的面试问题"],
  "questionDistribution": { "技术": 0, "行为": 0, "项目": 0 }
}`

  return {
    system: `你是一名资深职业发展顾问。请根据用户的多场面试记录，分析其整体表现趋势、高频薄弱点、进步情况和改进建议。
分析"高频薄弱点"时，请重点关注每场面试的 negativeTags 字段（如果存在），提取反复出现的薄弱环节。没有 negativeTags 的旧记录可参考 tags 字段。
严格按照下面的 JSON schema 输出，确保所有字段都存在，不要包含任何其他文字。`,
    user: `请分析以下面试数据，严格按照 JSON 格式输出：

JSON Schema:
${schema}

以下是该用户的 ${reviews.length} 场面试复盘数据：
${JSON.stringify(reviews, null, 2)}`,
  }
}
