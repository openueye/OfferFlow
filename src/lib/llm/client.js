// src/lib/llm/client.js
import { getLLMConfig } from './config.js'

export class LLMError extends Error {
  constructor(message, { status, retryable = false } = {}) {
    super(message)
    this.name = 'LLMError'
    this.status = status
    this.retryable = retryable
  }
}

/**
 * 调用 LLM (OpenAI-compatible API)
 * @param {object} options
 * @param {string} options.systemPrompt - 系统角色设定
 * @param {string} options.userPrompt   - 用户输入
 * @param {number} [options.timeoutMs=60000] - 超时毫秒
 * @returns {Promise<{ content: string, model: string, usage: object }>}
 */
export async function callLLM({ systemPrompt, userPrompt, timeoutMs = 60000 }) {
  const config = getLLMConfig()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const retryable = response.status >= 500 || response.status === 429
      throw new LLMError(
        `LLM API 错误: ${response.status} ${response.statusText}`,
        { status: response.status, retryable }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new LLMError('LLM 返回内容为空', { retryable: false })
    }

    return {
      content,
      model: data.model || config.model,
      usage: data.usage || {},
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new LLMError('LLM 请求超时', { retryable: true })
    }
    if (err instanceof LLMError) throw err
    throw new LLMError(`LLM 请求失败: ${err.message}`, { retryable: true })
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * 调用 LLM 带重试（1 次）
 */
export async function callLLMWithRetry(options) {
  try {
    return await callLLM(options)
  } catch (err) {
    if (err instanceof LLMError && err.retryable) {
      return await callLLM(options)
    }
    throw err
  }
}
