import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { createPinnedFetch, resolveSafeUrl } from '@/lib/ai/safePageFetch'
import { buildChatCompletionsUrl, callLLM, getLLMFailure } from '@/lib/llm/client'

export const runtime = 'nodejs'

const TEST_TIMEOUT_MS = 20_000

function boundedString(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function normalizeLlmConfig(rawConfig) {
  if (!rawConfig || typeof rawConfig !== 'object' || Array.isArray(rawConfig)) return null

  const config = {
    provider: boundedString(rawConfig.provider, 50),
    apiKey: boundedString(rawConfig.apiKey, 1_000),
    baseUrl: boundedString(rawConfig.baseUrl, 2_000),
    model: boundedString(rawConfig.model, 200),
  }
  return config.apiKey && config.baseUrl && config.model ? config : null
}

export async function POST(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '请求格式不正确' }, { status: 400 })
  }

  const llmConfig = normalizeLlmConfig(body.llmConfig)
  if (!llmConfig) {
    return NextResponse.json({ error: '请填写 API Key、Base URL 和模型名称' }, { status: 400 })
  }

  let endpoint
  try {
    endpoint = await resolveSafeUrl(buildChatCompletionsUrl(llmConfig.baseUrl))
  } catch (error) {
    return NextResponse.json(
      { error: `Base URL 无法用于服务端调用：${error.message}` },
      { status: 400 }
    )
  }

  try {
    const result = await callLLM({
      systemPrompt: '你是连接检测助手。只返回合法 JSON。',
      userPrompt: '返回 {"status":"ok"}。',
      llmConfig,
      timeoutMs: TEST_TIMEOUT_MS,
      fetchImpl: createPinnedFetch(endpoint, { timeoutMs: TEST_TIMEOUT_MS }),
    })
    try {
      JSON.parse(result.content)
    } catch {
      return NextResponse.json(
        {
          error: '模型未按要求返回 JSON；请更换支持 OpenAI 兼容 JSON 输出的模型',
          code: 'INVALID_LLM_RESPONSE',
        },
        { status: 502 }
      )
    }
    return NextResponse.json({ ok: true, model: result.model })
  } catch (error) {
    const failure = getLLMFailure(error)
    return NextResponse.json(
      { error: failure.error, code: failure.code },
      { status: failure.status }
    )
  }
}
