// src/app/api/ai/trends/route.js
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { callLLMWithRetry } from '@/lib/llm/client'
import { buildTrendsPrompt } from '@/lib/llm/prompts'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 1. Fetch all reviews for this user
    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      orderBy: { interviewDate: 'asc' },
      select: {
        id: true,
        companyName: true,
        jobTitle: true,
        round: true,
        interviewType: true,
        interviewDate: true,
        result: true,
        rating: true,
        scores: true,
        questions: true,
        tags: true,
        strengths: true,
        weaknesses: true,
        improvements: true,
      },
    })

    if (reviews.length === 0) {
      return NextResponse.json(
        { error: '暂无面试数据' },
        { status: 400 }
      )
    }

    // 2. Build prompt & call LLM
    const { system, user: userPrompt } = buildTrendsPrompt({ reviews })

    let llmResult
    try {
      llmResult = await callLLMWithRetry({
        systemPrompt: system,
        userPrompt,
      })
    } catch (err) {
      return NextResponse.json(
        { error: `趋势分析失败: ${err.message}` },
        { status: 500 }
      )
    }

    // 3. Parse LLM JSON response
    let summary
    try {
      summary = JSON.parse(llmResult.content)
    } catch {
      return NextResponse.json(
        { error: 'AI 返回格式异常，请重试' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      summary,
      metadata: {
        totalReviews: reviews.length,
        model: llmResult.model,
        analyzedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('[ai/trends]', err)
    return NextResponse.json(
      { error: '趋势分析失败，请稍后重试' },
      { status: 500 }
    )
  }
}
