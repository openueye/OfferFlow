// src/app/api/ai/analyze/route.js
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { parseDocx } from '@/lib/ai/docParser'
import { saveFile } from '@/lib/ai/fileStore'
import { callLLMWithRetry } from '@/lib/llm/client'
import { buildAnalyzePrompt } from '@/lib/llm/prompts'

export async function POST(request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const jobTitle = formData.get('jobTitle')

    // 可选：从表单中提取前端传入的 LLM 配置（来自 localStorage）
    const llmConfig = {
      apiKey: formData.get('llmApiKey') || undefined,
      baseUrl: formData.get('llmBaseUrl') || undefined,
      model: formData.get('llmModel') || undefined,
      provider: formData.get('llmProvider') || undefined,
    }
    // 没有传入任何字段时保持 undefined，让 client.js 走环境变量
    const hasLlmConfig = Object.values(llmConfig).some(Boolean)
    const effectiveLlmConfig = hasLlmConfig ? llmConfig : undefined

    if (!file || !jobTitle) {
      return NextResponse.json(
        { error: '缺少文件或岗位名称' },
        { status: 400 }
      )
    }

    if (!(file instanceof File) || !file.name.toLowerCase().endsWith('.docx')) {
      return NextResponse.json(
        { error: '仅支持 .docx 文件' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小超过 10MB 限制' },
        { status: 400 }
      )
    }

    // 1. Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // 2. Save file for later reference
    const reviewId = `temp-${Date.now()}`
    const fileUrl = await saveFile({ buffer, fileName: file.name, reviewId })

    // 3. Parse .docx → text
    let parsed
    try {
      parsed = await parseDocx(buffer)
    } catch (err) {
      return NextResponse.json(
        { error: `文件解析失败: ${err.message}` },
        { status: 422 }
      )
    }

    if (parsed.length < 50) {
      return NextResponse.json(
        { error: '文件内容过少，分析结果可能不准确' },
        { status: 422 }
      )
    }

    // 4. Build prompt & call LLM
    const { system, user: userPrompt } = buildAnalyzePrompt({
      jobTitle,
      interviewText: parsed.text,
    })

    let llmResult
    try {
      llmResult = await callLLMWithRetry({
        systemPrompt: system,
        userPrompt,
        llmConfig: effectiveLlmConfig,
      })
    } catch (err) {
      return NextResponse.json(
        { error: `AI 分析失败: ${err.message}` },
        { status: 500 }
      )
    }

    // 5. Parse LLM JSON response
    let analysis
    try {
      analysis = JSON.parse(llmResult.content)
    } catch {
      return NextResponse.json(
        { error: 'AI 返回格式异常，请重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      analysis,
      metadata: {
        model: llmResult.model,
        analyzedAt: new Date().toISOString(),
        wordTextLength: parsed.length,
        fileUrl,
        fileName: file.name,
      },
    })
  } catch (err) {
    console.error('[ai/analyze]', err)
    return NextResponse.json(
      { error: '分析失败，请稍后重试' },
      { status: 500 }
    )
  }
}
