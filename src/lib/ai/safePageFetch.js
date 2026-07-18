import { lookup as dnsLookup } from 'node:dns/promises'
import { request as httpsRequest } from 'node:https'
import { BlockList, isIP } from 'node:net'

const MAX_RESPONSE_BYTES = 1024 * 1024
const REQUEST_TIMEOUT_MS = 10_000
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308])
const blockedAddresses = new BlockList()

for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
]) {
  blockedAddresses.addSubnet(network, prefix, 'ipv4')
}

for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['64:ff9b:1::', 48],
  ['100::', 64],
  ['2001:db8::', 32],
  ['2001:10::', 28],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
]) {
  blockedAddresses.addSubnet(network, prefix, 'ipv6')
}

function isPublicAddress({ address, family }) {
  const addressFamily = family === 6 || family === 'IPv6' ? 'ipv6' : 'ipv4'
  if (addressFamily === 'ipv6' && address.toLowerCase().startsWith('::ffff:')) return false
  return isIP(address) !== 0 && !blockedAddresses.check(address, addressFamily)
}

export async function resolveSafeUrl(rawUrl, { lookup = dnsLookup } = {}) {
  let url
  try {
    url = new URL(rawUrl)
  } catch {
    throw new TypeError('岗位链接格式不正确')
  }

  if (url.protocol !== 'https:') throw new TypeError('岗位链接必须使用 HTTPS')
  if (url.username || url.password) throw new TypeError('岗位链接不能包含访问凭据')
  if (url.port && url.port !== '443') throw new TypeError('岗位链接不能使用非标准端口')

  const hostname = url.hostname.toLowerCase()
  const bareHostname = hostname.replace(/^\[|\]$/g, '')
  if (
    !hostname ||
    isIP(bareHostname) !== 0 ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new TypeError('岗位链接必须指向公网网站')
  }

  let addresses
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true })
  } catch {
    throw new TypeError('岗位网站域名无法解析')
  }

  if (
    !Array.isArray(addresses) ||
    addresses.length === 0 ||
    addresses.some((item) => !isPublicAddress(item))
  ) {
    throw new TypeError('岗位链接必须解析到公网地址')
  }

  return { url, address: addresses[0] }
}

function requestPinnedUrl(
  { url, address },
  {
    method = 'GET',
    headers = {},
    body,
    signal,
    timeoutMs = REQUEST_TIMEOUT_MS,
    maxResponseBytes = MAX_RESPONSE_BYTES,
  } = {}
) {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      url,
      {
        method,
        headers,
        servername: url.hostname,
        lookup: (_hostname, _options, callback) => callback(null, address.address, address.family),
        signal,
      },
      (response) => {
        const chunks = []
        let size = 0

        response.on('data', (chunk) => {
          size += chunk.length
          if (size > maxResponseBytes) {
            response.destroy(new Error('远端响应内容超过大小限制'))
            return
          }
          chunks.push(chunk)
        })
        response.on('end', () =>
          resolve({
            status: response.statusCode || 0,
            headers: response.headers,
            body: Buffer.concat(chunks),
          })
        )
        response.on('error', reject)
      }
    )

    request.setTimeout(timeoutMs, () => request.destroy(new Error('读取远端服务超时')))
    request.on('error', reject)
    if (body) request.write(body)
    request.end()
  })
}

function requestPinnedPage(resolved) {
  return requestPinnedUrl(resolved, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9',
      'Accept-Encoding': 'identity',
      'User-Agent': 'OfferFlow-Job-Importer/1.0',
    },
  })
}

export function createPinnedFetch(resolved, { request = requestPinnedUrl } = {}) {
  return async function pinnedFetch(input, init = {}) {
    const requestedUrl = new URL(
      typeof input === 'string' || input instanceof URL ? input : input.url
    )
    if (requestedUrl.href !== resolved.url.href) {
      throw new TypeError('请求地址与已验证的远端地址不一致')
    }

    const response = await request(resolved, {
      method: init.method || 'GET',
      headers: Object.fromEntries(new Headers(init.headers).entries()),
      body: init.body,
      signal: init.signal,
    })
    const responseHeaders = new Headers()
    for (const [name, value] of Object.entries(response.headers)) {
      if (Array.isArray(value)) {
        for (const item of value) responseHeaders.append(name, item)
      } else if (value !== undefined) {
        responseHeaders.set(name, String(value))
      }
    }

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    })
  }
}

function decodeBody(body, contentType) {
  const charset = contentType.match(/charset\s*=\s*["']?([^;\s"']+)/i)?.[1] || 'utf-8'
  try {
    return new TextDecoder(charset).decode(body)
  } catch {
    return new TextDecoder('utf-8').decode(body)
  }
}

export async function fetchPublicPage(
  rawUrl,
  { resolve = resolveSafeUrl, request = requestPinnedPage, maxRedirects = 3 } = {}
) {
  let currentUrl = rawUrl

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const resolved = await resolve(currentUrl)
    const response = await request(resolved)

    if (REDIRECT_STATUSES.has(response.status) && response.headers.location) {
      if (redirectCount === maxRedirects) throw new Error('岗位网页重定向次数过多')
      currentUrl = new URL(response.headers.location, resolved.url).href
      continue
    }

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`岗位网页返回 ${response.status || '异常'} 状态`)
    }

    const contentType = String(response.headers['content-type'] || '').toLowerCase()
    if (
      !contentType.startsWith('text/html') &&
      !contentType.startsWith('text/plain') &&
      !contentType.startsWith('application/xhtml+xml')
    ) {
      throw new Error('岗位链接返回的不是可分析网页')
    }

    return {
      finalUrl: resolved.url.href,
      html: decodeBody(response.body, contentType),
    }
  }

  throw new Error('岗位网页重定向次数过多')
}
