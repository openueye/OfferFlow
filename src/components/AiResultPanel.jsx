'use client'
import { useState } from 'react'
import GlowCard from './GlowCard'

const SCORE_LABELS = {
  expression: '表达清晰度',
  jobUnderstanding: '岗位理解',
  projectFamiliarity: '项目熟悉度',
  businessThinking: '业务思考',
  technicalAbility: '技术 / 专业能力',
  composure: '临场状态',
  questionQuality: '反问质量',
  overall: '整体表现',
}

const TAG_OPTIONS = [
  '表达不清', '逻辑混乱', '准备不足', '知识盲区',
  '项目细节不熟', '岗位理解不足', '业务思考不足', '技术能力不足',
  '数据意识不足', '反问质量低', '紧张卡壳', '薪资谈判不足',
]

export default function AiResultPanel({ analysis, metadata, onApply, onCancel }) {
  const [scores, setScores] = useState(analysis.scores || {})
  const [rating, setRating] = useState(analysis.rating || 3)
  const [strengths, setStrengths] = useState(analysis.strengths || '')
  const [weaknesses, setWeaknesses] = useState(analysis.weaknesses || '')
  const [note, setNote] = useState(analysis.note || '')
  const [questions, setQuestions] = useState(analysis.questions || [])
  const [improvements, setImprovements] = useState(analysis.improvements || [])
  const [tags, setTags] = useState(analysis.tags || [])

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleApply = () => {
    onApply({
      scores,
      rating,
      strengths,
      weaknesses,
      note,
      questions,
      improvements,
      tags,
    })
  }

  return (
    <GlowCard className="rounded-[22px] w-full max-w-full">
      <div className="bg-white/90 backdrop-blur-xl dark:bg-[rgba(20,20,25,0.85)] rounded-[22px] w-full max-w-full min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-white">AI 分析结果</h2>
            <p className="text-xs text-offer-muted mt-0.5">
              模型: {metadata?.model || 'N/A'} · {metadata?.wordTextLength || 0} 字
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-5">

          {/* Multi-dimensional Scores */}
          <div>
            <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-3">多维评分</h3>
            <div className="space-y-2">
              {Object.entries(SCORE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-offer-muted w-28 shrink-0">{label}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setScores((prev) => ({ ...prev, [key]: star }))}
                        className="p-0.5 transition-colors hover:scale-105"
                      >
                        <svg className={`w-4 h-4 ${star <= (scores[key] || 0) ? 'text-amber-400' : 'text-offer-muted/30'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-offer-muted">{scores[key] || 0}/5</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-3">整体评分</h3>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}
                  className="p-0.5 transition-colors hover:scale-105">
                  <svg className={`w-5 h-5 ${star <= rating ? 'text-amber-400' : 'text-offer-muted/30'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="text-sm text-offer-muted ml-1">{rating}/5</span>
            </div>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-2">优势</h3>
            <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={2}
              className="min-h-[40px] w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20 resize-none" />
          </div>

          {/* Weaknesses */}
          <div>
            <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-2">不足</h3>
            <textarea value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} rows={2}
              className="min-h-[40px] w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20 resize-none" />
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider">面试问题</h3>
              <span className="text-xs text-offer-muted">{questions.length} 题</span>
            </div>
            {questions.length > 0 ? (
              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div key={q.id || idx} className="card-glow rounded-xl p-3 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.02]">
                    <p className="text-xs text-offer-muted mb-1">Q{idx + 1}: {q.question}</p>
                    {q.betterAnswer && (
                      <p className="text-xs text-emerald-400">改进: {q.betterAnswer}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-offer-muted/50 text-center py-2">无识别到面试问题</p>
            )}
          </div>

          {/* Improvements */}
          <div>
            <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-2">改进动作</h3>
            {improvements.length > 0 ? (
              <div className="space-y-1.5">
                {improvements.map((imp, idx) => (
                  <div key={imp.id || idx} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-offer-accent shrink-0" />
                    <span className="text-slate-950 dark:text-white">{imp.action}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-offer-muted/50 text-center py-2">无改进建议</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-2">问题标签</h3>
            <div className="flex gap-2 flex-wrap">
              {TAG_OPTIONS.map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    tags.includes(tag)
                      ? 'bg-offer-primary text-white border-offer-primary'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}>{tag}</button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <h3 className="text-xs font-semibold text-offer-muted uppercase tracking-wider mb-2">整体评语</h3>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
              className="min-h-[40px] w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-purple-400/70 focus:ring-2 focus:ring-purple-500/20 resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-slate-200 dark:border-white/10">
          <button onClick={onCancel}
            className="btn-secondary px-4 py-2 rounded-xl text-sm font-medium">取消</button>
          <button onClick={handleApply}
            className="btn-gradient px-4 py-2 rounded-xl text-sm font-medium text-white">应用结果</button>
        </div>
      </div>
    </GlowCard>
  )
}
