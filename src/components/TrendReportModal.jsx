'use client'
import { useState, useEffect } from 'react'
import GlowCard from './GlowCard'

export default function TrendReportModal({ open, onClose }) {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) {
      setReport(null)
      setError(null)
      return
    }
    fetchTrends()
  }, [open])

  const fetchTrends = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/trends')
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '获取趋势分析失败')
      }
      const data = await res.json()
      setReport(data.summary)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="modal-panel border w-full max-w-lg mx-4 max-h-[80vh] min-h-0 flex flex-col shadow-2xl shadow-black/40" onClick={(e) => e.stopPropagation()}>
        <GlowCard style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 }} className="rounded-[22px] w-full max-w-full min-w-0 flex flex-col flex-1">
          <div className="bg-white/90 backdrop-blur-xl dark:bg-[rgba(20,20,25,0.85)] rounded-[22px] w-full max-w-full flex flex-col flex-1 min-h-0">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">面试趋势报告</h2>
              <button onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-offer-muted hover:text-white hover:bg-white/10 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 ai-pulse">
                  <svg className="animate-spin h-8 w-8 text-offer-accent" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-offer-muted ai-dots">AI 正在分析面试趋势<span>.</span><span>.</span><span>.</span></p>
                </div>
              )}

              {error && (
                <div className="py-12 text-center">
                  <p className="text-sm text-red-400">{error}</p>
                  <button onClick={fetchTrends}
                    className="mt-3 px-4 py-2 rounded-xl text-sm font-medium text-offer-accent hover:text-white transition-colors">重试</button>
                </div>
              )}

              {report && !loading && !error && (
                <div className="space-y-5">

                  {/* 高频薄弱点 */}
                  {report.高频薄弱点?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-2">高频薄弱点</h3>
                      <div className="flex flex-wrap gap-2">
                        {report.高频薄弱点.map((item, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 评分趋势 */}
                  {report.评分趋势 && (
                    <div>
                      <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-2">评分趋势</h3>
                      <p className="text-sm text-white leading-relaxed">{report.评分趋势}</p>
                    </div>
                  )}

                  {/* 进步项 */}
                  {report.进步项?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-2">进步项</h3>
                      <div className="space-y-1.5">
                        {report.进步项.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-white">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 建议 */}
                  {report.建议?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-2">改进建议</h3>
                      <div className="space-y-1.5">
                        {report.建议.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-offer-accent mt-0.5 shrink-0">{i + 1}.</span>
                            <span className="text-white">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 常见问题 */}
                  {report.commonQuestions?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-2">常见问题</h3>
                      <div className="space-y-1.5">
                        {report.commonQuestions.map((q, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="text-offer-muted">Q{i + 1}.</span>
                            <span className="text-white">{q}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 问题分布 */}
                  {report.questionDistribution && (
                    <div>
                      <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-2">问题类型分布</h3>
                      <div className="space-y-1.5">
                        {Object.entries(report.questionDistribution).map(([type, count]) => (
                          <div key={type} className="flex items-center gap-2 text-sm">
                            <span className="text-offer-muted w-12">{type}</span>
                            <div className="flex-1 h-4 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-offer-primary/60" style={{ width: `${Math.min((count / Math.max(...Object.values(report.questionDistribution))) * 100, 100)}%` }} />
                            </div>
                            <span className="text-white font-medium w-6 text-right">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-5 border-t border-slate-200 dark:border-white/10">
              <button onClick={onClose}
                className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium">关闭</button>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  )
}
