// src/lib/ai/fileStore.js
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

// Vercel 生产环境使用 /tmp (只读文件系统除外)
const isVercel = !!process.env.VERCEL
const UPLOAD_DIR = isVercel ? '/tmp/uploads/reviews' : 'public/uploads/reviews'

/**
 * 保存上传的文件
 * @param {object} options
 * @param {Buffer} options.buffer - 文件数据
 * @param {string} options.fileName - 原始文件名
 * @param {string} options.reviewId - 关联的复盘 ID
 * @returns {Promise<string>} 存储后的文件路径
 */
export async function saveFile({ buffer, fileName, reviewId }) {
  const dir = path.join(isVercel ? '/tmp' : process.cwd(), UPLOAD_DIR, reviewId)
  await mkdir(dir, { recursive: true })

  const uniqueName = `${Date.now()}-${fileName}`
  const filePath = path.join(dir, uniqueName)

  await writeFile(filePath, buffer)

  return isVercel ? filePath : `/uploads/reviews/${reviewId}/${uniqueName}`
}

/**
 * 删除文件
 * @param {string} urlPath - saveFile 返回的路径
 */
export async function deleteFile(urlPath) {
  if (!urlPath || urlPath.startsWith('http')) return
  try {
    const fullPath = isVercel
      ? urlPath
      : path.join(process.cwd(), 'public', urlPath)
    await unlink(fullPath)
  } catch {
    // 文件不存在则忽略
  }
}
