// src/lib/llm/prompts.js

/**
 * 构建面试分析 prompt
 * @param {string} jobTitle - 岗位名称
 * @param {string} interviewText - 面试记录文本
 */
export function buildAnalyzePrompt({ jobTitle, interviewText }) {
  return {
    system: `你是一名资深的${jobTitle}面试专家。你正在分析一份面试记录。
请从面试官角度，对候选人的表现进行打分和评价。
严格按照 JSON 格式输出，不要包含任何其他文字。`,
    user: `请分析以下面试记录：
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
  return {
    system: `你是一名资深职业发展顾问。
请根据用户的多场面试记录，分析其整体表现趋势、高频薄弱点、进步情况和改进建议。
严格按照 JSON 格式输出，不要包含任何其他文字。`,
    user: `以下是该用户的 ${reviews.length} 场面试复盘数据：
${JSON.stringify(reviews, null, 2)}`,
  }
}
