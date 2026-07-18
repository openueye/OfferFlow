import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import {
  detectJobSource,
  extractTextFromHtml,
  normalizeJobFields,
  validateImportInput,
} from '@/lib/ai/jobImport'
import { createPinnedFetch, fetchPublicPage, resolveSafeUrl } from '@/lib/ai/safePageFetch'
import { buildChatCompletionsUrl, callLLMWithRetry } from '@/lib/llm/client'
import { buildJobImportPrompt } from '@/lib/llm/prompts'

export const runtime = 'nodejs'

function errorResponse(error, code, status, extra = {}) {
  return NextResponse.json({ error, code, ...extra }, { status })
}

function boundedConfigValue(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function normalizeLlmConfig(rawConfig) {
  if (!rawConfig || typeof rawConfig !== 'object' || Array.isArray(rawConfig)) return undefined

  const config = {
    provider: boundedConfigValue(rawConfig.provider, 50),
    apiKey: boundedConfigValue(rawConfig.apiKey, 1_000),
    baseUrl: boundedConfigValue(rawConfig.baseUrl, 2_000),
    model: boundedConfigValue(rawConfig.model, 200),
  }
  return config.apiKey ? config : undefined
}

async function resolveDynamicLlmEndpoint(llmConfig) {
  if (!llmConfig?.baseUrl) return undefined

  let endpoint
  try {
    endpoint = buildChatCompletionsUrl(llmConfig.baseUrl)
  } catch {
    throw new TypeError('AI 模型 Base URL 格式不正确')
  }
  return resolveSafeUrl(endpoint)
}

export async function POST(request) {
  const user = await getAuthUser()
  if (!user) return errorResponse('未登录', 'UNAUTHORIZED', 401)

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 100_000) return errorResponse('请求内容过大', 'PAYLOAD_TOO_LARGE', 413)

  let body
  try {
    body = await request.json()
  } catch {
    return errorResponse('请求格式不正确', 'INVALID_JSON', 400)
  }

  let input
  try {
    input = validateImportInput(body)
  } catch (error) {
    return errorResponse(error.message, 'INVALID_INPUT', 400)
  }

  const detected = input.jobLink
    ? detectJobSource(input.jobLink)
    : { source: 'manualText', channel: '' }
  let jobText = input.jdText
  let sourceMode = 'text'

  if (!jobText) {
    try {
      const page = await fetchPublicPage(input.jobLink)
      jobText = extractTextFromHtml(page.html)
      sourceMode = 'url'
    } catch {
      return errorResponse(
        '无法读取该岗位页面，请粘贴 JD 原文后继续分析',
        'PAGE_UNAVAILABLE',
        422,
        { needsManualText: true }
      )
    }
  }

  if (jobText.length < 40) {
    return errorResponse(
      '可分析的岗位内容过少，请粘贴更完整的 JD 原文',
      'JOB_TEXT_TOO_SHORT',
      422,
      { needsManualText: true }
    )
  }

  const llmConfig = normalizeLlmConfig(body.llmConfig)
  let resolvedLlmEndpoint
  try {
    resolvedLlmEndpoint = await resolveDynamicLlmEndpoint(llmConfig)
  } catch (error) {
    return errorResponse(error.message, 'INVALID_LLM_CONFIG', 400)
  }

  const prompt = buildJobImportPrompt({ sourceUrl: input.jobLink, jobText })
  let llmResult
  try {
    llmResult = await callLLMWithRetry({
      systemPrompt: prompt.system,
      userPrompt: prompt.user,
      llmConfig,
      timeoutMs: 45_000,
      fetchImpl: resolvedLlmEndpoint ? createPinnedFetch(resolvedLlmEndpoint) : undefined,
    })
  } catch {
    return errorResponse('AI 分析失败，请检查模型配置后重试', 'LLM_ERROR', 502)
  }

  let modelOutput
  try {
    modelOutput = JSON.parse(llmResult.content)
  } catch {
    return errorResponse('AI 返回格式异常，请重试', 'INVALID_LLM_RESPONSE', 502)
  }

  const fields = normalizeJobFields(modelOutput, {
    jobLink: input.jobLink,
    jdText: jobText,
    detectedChannel: detected.channel,
  })
  if (!fields.companyName && !fields.jobTitle) {
    return errorResponse('未能从内容中识别岗位信息，请补充更完整的 JD', 'NO_JOB_FIELDS', 422)
  }

  return NextResponse.json({
    status: 'ready',
    fields,
    metadata: {
      source: detected.source,
      sourceMode,
      model: llmResult.model,
    },
  })
}
