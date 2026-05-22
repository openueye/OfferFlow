'use client'
import { useState, useEffect, useRef } from 'react'

const DEFAULT_TEXTS = [
  'AI 正在分析数据',
  '正在提取关键信息',
  '正在生成分析结果',
]

export default function LoadingAnimation({
  visible,
  texts = DEFAULT_TEXTS,
  interval = 3000,
  onCancel,
  cancelText = '取消',
  mode = 'overlay',
}) {
  const [textIndex, setTextIndex] = useState(0)
  const [fade, setFade] = useState(true)
  const videoRef = useRef(null)
  const timerRef = useRef(null)

  // Text rotation
  useEffect(() => {
    if (!visible) return
    setTextIndex(0)
    setFade(true)
    timerRef.current = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % texts.length)
        setFade(true)
      }, 300)
    }, interval)
    return () => clearInterval(timerRef.current)
  }, [visible, texts.length, interval])

  // Reset video when hidden
  useEffect(() => {
    if (!visible && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [visible])

  if (!visible) return null

  const video = (
    <video
      ref={videoRef}
      src="/animations/ai-loading.mp4"
      autoPlay
      muted
      loop
      playsInline
      className={mode === 'overlay' ? 'w-full max-w-[320px] h-auto' : 'w-full max-w-[200px] h-auto'}
      style={{ display: 'block' }}
    />
  )

  const textEl = (
    <p className="text-sm text-offer-muted/90 font-medium transition-opacity duration-300 text-center" style={{ opacity: fade ? 1 : 0 }}>
      {texts[textIndex]}
    </p>
  )

  // Overlay mode: full-screen dark backdrop
  if (mode === 'overlay') {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-5">
          {video}
          {textEl}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all"
            >
              {cancelText}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Inline mode: contained within parent
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      {video}
      {textEl}
    </div>
  )
}
