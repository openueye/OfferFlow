const MAX_JOB_TEXT_LENGTH = 30_000
const ALLOWED_WORK_MODES = new Set(['', 'onsite', 'remote', 'hybrid'])
const ALLOWED_CHANNELS = new Set(['', '内推', '官网投递', '猎头', '招聘平台', '校园招聘', '其他'])
const IMPORT_FIELD_NAMES = [
  'companyName',
  'jobTitle',
  'city',
  'salaryRange',
  'workMode',
  'channel',
  'jobLink',
  'jdText',
]

function boundedString(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function decodeHtmlEntities(value) {
  const named = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
  }

  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] !== '#') return named[code.toLowerCase()] ?? entity

    const radix = code[1]?.toLowerCase() === 'x' ? 16 : 10
    const digits = radix === 16 ? code.slice(2) : code.slice(1)
    const point = Number.parseInt(digits, radix)
    if (!Number.isSafeInteger(point) || point > 0x10ffff) return entity

    try {
      return String.fromCodePoint(point)
    } catch {
      return entity
    }
  })
}

export function detectJobSource(rawUrl) {
  let url
  try {
    url = new URL(rawUrl)
  } catch {
    return { source: 'companyWebsite', channel: '官网投递' }
  }
  const hostname = url.hostname.toLowerCase()

  if (hostname === 'zhipin.com' || hostname.endsWith('.zhipin.com')) {
    return { source: 'boss', channel: '招聘平台' }
  }
  if (hostname === 'weixin.qq.com' || hostname.endsWith('.weixin.qq.com')) {
    return { source: 'wechat', channel: '其他' }
  }
  if (
    hostname === 'xiaohongshu.com' ||
    hostname.endsWith('.xiaohongshu.com') ||
    hostname === 'xhslink.com'
  ) {
    return { source: 'xiaohongshu', channel: '其他' }
  }
  return { source: 'companyWebsite', channel: '官网投递' }
}

export function extractTextFromHtml(html) {
  if (typeof html !== 'string') return ''

  return decodeHtmlEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<(script|style|noscript|svg|template)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(
        /<\/(?:address|article|aside|blockquote|div|footer|h[1-6]|header|li|main|nav|p|section|table|tr)>/gi,
        ' '
      )
      .replace(/<br\s*\/?\s*>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_JOB_TEXT_LENGTH)
}

export function normalizeJobFields(
  modelOutput,
  { jobLink = '', jdText = '', detectedChannel = '' } = {}
) {
  const output =
    modelOutput && typeof modelOutput === 'object' && !Array.isArray(modelOutput) ? modelOutput : {}
  const workMode = boundedString(output.workMode, 20)
  const channel = boundedString(detectedChannel || output.channel, 20)

  return {
    companyName: boundedString(output.companyName, 200),
    jobTitle: boundedString(output.jobTitle, 200),
    city: boundedString(output.city, 200),
    salaryRange: boundedString(output.salaryRange, 200),
    workMode: ALLOWED_WORK_MODES.has(workMode) ? workMode : '',
    channel: ALLOWED_CHANNELS.has(channel) ? channel : '',
    jobLink: boundedString(jobLink, 2_000),
    jdText: boundedString(jdText, MAX_JOB_TEXT_LENGTH),
  }
}

export function mergeImportedFields(currentForm, importedFields) {
  const nextForm = { ...currentForm }
  for (const field of IMPORT_FIELD_NAMES) {
    if (typeof importedFields?.[field] === 'string' && importedFields[field].trim()) {
      nextForm[field] = importedFields[field]
    }
  }
  return nextForm
}

export function validateImportInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('请求格式不正确')
  }

  let jobLink = boundedString(input.jobLink, 2_000)
  const jdText = boundedString(input.jdText, MAX_JOB_TEXT_LENGTH)
  if (!jobLink && !jdText) throw new TypeError('请提供岗位链接或粘贴 JD 原文')

  if (jobLink) {
    let parsedLink
    try {
      parsedLink = new URL(jobLink)
    } catch {
      throw new TypeError('岗位链接格式不正确')
    }
    if (parsedLink.protocol !== 'https:') throw new TypeError('岗位链接必须使用 HTTPS')
    if (parsedLink.username || parsedLink.password) throw new TypeError('岗位链接不能包含访问凭据')
    jobLink = parsedLink.href
  }

  return { jobLink, jdText }
}
