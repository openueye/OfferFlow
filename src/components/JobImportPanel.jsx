'use client'

import { useEffect, useId, useState } from 'react'

const SOURCE_LABELS = {
  boss: 'Boss 直聘',
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  companyWebsite: '公司招聘官网',
  manualText: '粘贴的 JD',
}

const PREVIEW_FIELDS = [
  ['companyName', '公司'],
  ['jobTitle', '岗位'],
  ['city', '城市'],
  ['salaryRange', '薪资'],
  ['workMode', '工作模式'],
  ['channel', '渠道'],
]

function getLlmConfigFromStorage() {
  try {
    const raw = localStorage.getItem('offerflow_llm_config')
    if (!raw) return undefined
    const stored = JSON.parse(raw)
    if (!stored.llmApiKey) return undefined
    return {
      provider: stored.llmProvider,
      apiKey: stored.llmApiKey,
      baseUrl: stored.llmBaseUrl,
      model: stored.llmModel,
    }
  } catch {
    return undefined
  }
}

export default function JobImportPanel({ initialJobLink = '', initialJdText = '', onApply }) {
  const linkId = useId()
  const textId = useId()
  const [jobLink, setJobLink] = useState(initialJobLink)
  const [jdText, setJdText] = useState(initialJdText)
  const [showManualText, setShowManualText] = useState(Boolean(initialJdText))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    setJobLink(initialJobLink)
    setJdText(initialJdText)
    setShowManualText(Boolean(initialJdText))
    setError('')
    setResult(null)
  }, [initialJobLink, initialJdText])

  const analyze = async () => {
    if (!jobLink.trim() && !jdText.trim()) {
      setError('请粘贴岗位链接，或展开下方输入 JD 原文。')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch('/api/ai/job-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobLink: jobLink.trim(),
          jdText: jdText.trim(),
          llmConfig: getLlmConfigFromStorage(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (data.needsManualText) setShowManualText(true)
        throw new Error(data.error || '岗位分析失败，请稍后重试')
      }
      setResult(data)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const applyResult = () => {
    onApply(result.fields)
    setError('')
  }

  return (
    <section
      className="col-span-full rounded-xl border border-purple-400/20 bg-purple-500/[0.06] p-4"
      aria-labelledby={`${linkId}-title`}
    >
      <div className="mb-3">
        <h3 id={`${linkId}-title`} className="text-sm font-semibold text-theme-text">
          AI 一键填写岗位
        </h3>
        <p className="mt-1 text-xs text-offer-muted">
          先读取公开链接；页面需要登录时，可改为粘贴 JD。结果确认后才会写入表单。
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={linkId} className="sr-only">
          岗位链接
        </label>
        <input
          id={linkId}
          type="url"
          value={jobLink}
          onChange={(event) => {
            setJobLink(event.target.value)
            setResult(null)
          }}
          placeholder="粘贴 Boss、公司官网、小红书或公众号链接"
          className="min-h-[40px] min-w-0 flex-1 rounded-xl border border-theme-border bg-theme-card px-4 py-2.5 text-sm text-theme-text placeholder:text-theme-muted outline-none focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20"
        />
        <button
          type="button"
          onClick={analyze}
          disabled={loading}
          className="btn-gradient min-h-[40px] shrink-0 rounded-xl px-4 py-2 text-sm font-medium text-white disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? '正在分析…' : '读取并分析'}
        </button>
      </div>

      {showManualText ? (
        <div className="mt-3">
          <label htmlFor={textId} className="mb-1 block text-xs font-medium text-offer-muted">
            JD 原文（填写后优先分析此内容）
          </label>
          <textarea
            id={textId}
            value={jdText}
            onChange={(event) => {
              setJdText(event.target.value)
              setResult(null)
            }}
            rows={5}
            placeholder="复制网页中的岗位职责和任职要求…"
            className="w-full resize-y rounded-xl border border-theme-border bg-theme-card px-4 py-2.5 text-sm text-theme-text placeholder:text-theme-muted outline-none focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowManualText(true)}
          className="mt-2 text-xs font-medium text-purple-300 hover:text-purple-200"
        >
          网页无法读取？改为粘贴 JD
        </button>
      )}

      <div aria-live="polite">
        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
          >
            {error}
          </p>
        )}

        {result && (
          <div className="mt-4 rounded-xl border border-theme-border bg-theme-card p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-theme-text">AI 提取结果</h4>
                <p className="text-xs text-offer-muted">
                  来源：{SOURCE_LABELS[result.metadata.source] || '岗位页面'} · 请核对后应用
                </p>
              </div>
              <button
                type="button"
                onClick={applyResult}
                className="btn-gradient mt-2 rounded-lg px-3 py-2 text-xs font-medium text-white sm:mt-0"
              >
                应用到表单
              </button>
            </div>

            <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {PREVIEW_FIELDS.map(([field, label]) => (
                <div key={field} className="min-w-0">
                  <dt className="text-[11px] text-offer-muted">{label}</dt>
                  <dd className="truncate text-sm text-theme-text">
                    {result.fields[field] || '未识别'}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 border-t border-theme-border pt-3">
              <p className="text-[11px] text-offer-muted">JD 摘要</p>
              <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-theme-text">
                {result.fields.jdText || '未识别'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
