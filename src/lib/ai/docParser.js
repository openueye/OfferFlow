// src/lib/ai/docParser.js
import mammoth from 'mammoth'

/**
 * 解析 .docx 文件为纯文本
 * @param {Buffer} buffer - .docx 文件二进制数据
 * @returns {Promise<{ text: string, length: number }>}
 * @throws {Error} 解析失败或内容为空时抛出
 */
export async function parseDocx(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('文件内容为空')
  }

  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error('文件大小超过 10MB 限制')
  }

  const result = await mammoth.extractRawText({ buffer })
  const text = result.value.trim()

  if (!text) {
    throw new Error('无法从文件中提取文本内容')
  }

  return {
    text,
    length: text.length,
  }
}
