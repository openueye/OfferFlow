// src/lib/llm/config.js

export function getLLMConfig() {
  const provider = process.env.LLM_PROVIDER || 'deepseek'
  const apiKey = process.env.LLM_API_KEY
  const baseUrl = process.env.LLM_BASE_URL
  const model = process.env.LLM_MODEL

  if (!apiKey) {
    throw new Error('LLM_API_KEY 环境变量未设置')
  }

  // 根据 provider 设置默认值
  const defaults = {
    deepseek: {
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
    },
    xiaomi: {
      baseUrl: 'https://api.mi.com/v1',
      model: 'miMo',
    },
  }

  const resolved = defaults[provider] || defaults.deepseek

  return {
    provider,
    apiKey,
    baseUrl: baseUrl || resolved.baseUrl,
    model: model || resolved.model,
  }
}
