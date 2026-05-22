import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(reviews)
}

export async function POST(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await request.json()
  const { companyName, jobTitle, jobId, round, interviewType, interviewDate, duration, interviewerInfo, result, rating, note, strengths, weaknesses, scores, questions, tags, improvements, attachments, positiveTags, negativeTags } = body

  const review = await prisma.review.create({
    data: {
      userId: user.id,
      companyName: companyName || '',
      jobTitle: jobTitle || '',
      jobId: jobId || '',
      round: round || '',
      interviewType: interviewType || '',
      interviewDate: interviewDate || '',
      duration: duration || '',
      interviewerInfo: interviewerInfo || '',
      result: result || '',
      rating: rating || 0,
      note: note || '',
      strengths: strengths || '',
      weaknesses: weaknesses || '',
      scores: scores || null,
      questions: questions || [],
      tags: tags || [],
      positiveTags: positiveTags || [],
      negativeTags: negativeTags || [],
      improvements: improvements || [],
      attachments: attachments || [],
    },
  })

  return NextResponse.json({ review }, { status: 201 })
}

export async function PUT(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await request.json()
  const { id, ...data } = body

  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })

  const existing = await prisma.review.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: '无权修改此记录' }, { status: 403 })
  }

  const review = await prisma.review.update({
    where: { id },
    data,
  })

  return NextResponse.json({ review })
}

export async function DELETE(request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 })

  const existing = await prisma.review.findUnique({ where: { id } })
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: '无权删除此记录' }, { status: 403 })
  }

  await prisma.review.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
