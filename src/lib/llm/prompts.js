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
  "tags": ["string - 问题标签"]
}`

  return {
    system: `你是一名资深的${jobTitle}面试专家。你正在分析一份面试记录。请从面试官角度，对候选人的表现进行打分和评价。严格按照下面的 JSON schema 输出，确保所有字段都存在，不要包含任何其他文字。`,
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
  "高频薄弱点": ["string - 高频出现的弱点标签"],
  "评分趋势": "string - 评分随时间的变化趋势描述",
  "进步项": ["string - 相比之前有进步的地方"],
  "建议": ["string - 改进建议"],
  "commonQuestions": ["string - 常见的面试问题"],
  "questionDistribution": { "技术": 0, "行为": 0, "项目": 0 }
}`

  return {
    system: `你是一名资深职业发展顾问。请根据用户的多场面试记录，分析其整体表现趋势、高频薄弱点、进步情况和改进建议。严格按照下面的 JSON schema 输出，确保所有字段都存在，不要包含任何其他文字。`,
    user: `请分析以下面试数据，严格按照 JSON 格式输出：

JSON Schema:
${schema}

以下是该用户的 ${reviews.length} 场面试复盘数据：
${JSON.stringify(reviews, null, 2)}`,
  }
}
