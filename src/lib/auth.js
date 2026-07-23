import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from './jwt'
import prisma from './prisma'

export async function getAuthUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload?.userId) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, createdAt: true },
    })

    return user
  } catch {
    return null
  }
}
