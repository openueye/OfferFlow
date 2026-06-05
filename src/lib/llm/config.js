/**
 * LLM 配置解析
 *
 * 优先级：传入的 llmConfig 参数 > 环境变量 > 默认值
 *
 * @param {object} [llmConfig] - 前端传入的动态配置（来自 localStorage）
 * @param {string} [llmConfig.provider]
 * @param {string} [llmConfig.apiKey]
 * @param {string} [llmConfig.baseUrl]
 * @param {string} [llmConfig.model]
 * @returns {{ provider: string, apiKey: string, baseUrl: string, model: string }}
 */
export function getLLMConfig(llmConfig) {
  // 1. 优先使用传入的动态配置
  if (llmConfig?.apiKey) {
    return {
      provider: llmConfig.provider || 'custom',
      apiKey: llmConfig.apiKey,
      baseUrl: llmConfig.baseUrl || 'https://api.deepseek.com',
      model: llmConfig.model || 'deepseek-chat',
    }
  }

  // 2. 降级到环境变量
  const provider = process.env.LLM_PROVIDER || 'deepseek'
  const apiKey = process.env.LLM_API_KEY
  const baseUrl = process.env.LLM_BASE_URL
  const model = process.env.LLM_MODEL

  // 常见提供商的默认值
  const defaults = {
    deepseek: {
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
    },
    xiaomi: {
      baseUrl: 'https://token-plan-cn.xiaomimimo.com/v1',
      model: 'minimax-text-01',
    },
  }

  const resolved = defaults[provider] || defaults.deepseek

  return {
    provider,
    apiKey: apiKey || '',
    baseUrl: baseUrl || resolved.baseUrl,
    model: model || resolved.model,
  }
}
