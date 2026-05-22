// src/app/api/ai/review/[id]/reanalyze/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { parseDocx } from '@/lib/ai/docParser'
import { callLLMWithRetry } from '@/lib/llm/client'
import { buildAnalyzePrompt } from '@/lib/llm/prompts'

export async function POST(request, { params }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const { id } = await params

    // 1. Verify review ownership
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review || review.userId !== user.id) {
      return NextResponse.json({ error: '无权操作此记录' }, { status: 403 })
    }

    // 2. Get attachments to find the AI source file
    const attachments = Array.isArray(review.attachments)
      ? review.attachments
      : []
    const sourceAtt = attachments.find((a) => a.isSourceForAi)

    if (!sourceAtt) {
      return NextResponse.json(
        { error: '未找到 AI 分析源文件，请重新上传 Word 文件分析' },
        { status: 400 }
      )
    }

    // 3. Read file from disk (local dev)
    const fs = await import('fs/promises')
    const path = await import('path')
    const filePath = path.default.join(
      process.cwd(),
      'public',
      sourceAtt.storageKey || ''
    )

    let buffer
    try {
      buffer = await fs.readFile(filePath)
    } catch {
      return NextResponse.json(
        { error: '源文件已丢失，请重新上传' },
        { status: 404 }
      )
    }

    // 4. Parse & analyze
    const parsed = await parseDocx(buffer)
    const { system, user: userPrompt } = buildAnalyzePrompt({
      jobTitle: review.jobTitle || '',
      interviewText: parsed.text,
    })

    const llmResult = await callLLMWithRetry({
      systemPrompt: system,
      userPrompt,
    })

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
      },
    })
  } catch (err) {
    console.error('[ai/reanalyze]', err)
    return NextResponse.json(
      { error: '重新分析失败，请稍后重试' },
      { status: 500 }
    )
  }
}
