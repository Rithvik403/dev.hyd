import React, { useState, useEffect } from 'react'

export default function Preloader({ onFinish, subtitle = "Building Hyderabad's Developer Community" }) {
  const [progress, setProgress] = useState(0)
  const [isDone, setIsDone] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setProgress(100)
      setIsDone(true)
      setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => {
          if (onFinish) onFinish()
        }, 200)
      }, 100)
      return
    }

    const DURATION = 450 // Sweet spot 450ms preloader duration
    const INTERVAL = 16
    const steps = DURATION / INTERVAL
    let stepCount = 0

    const progressTimer = setInterval(() => {
      stepCount++
      const t = Math.min(stepCount / steps, 1)
      const currentPct = Math.round(t * 100)

      setProgress(currentPct)

      if (stepCount >= steps) {
        clearInterval(progressTimer)
        setProgress(100)
        setIsDone(true)

        setTimeout(() => {
          setFadeOut(true)
          setTimeout(() => {
            if (onFinish) onFinish()
          }, 250)
        }, 120)
      }
    }, INTERVAL)

    return () => clearInterval(progressTimer)
  }, [onFinish])

  return (
    <div className={`singleline-preloader ${fadeOut ? 'fade-out' : ''}`}>
      {/* Light Grid Background */}
      <div className="singleline-grid-bg" />

      <div className={`singleline-center-box ${isDone ? 'box-complete' : ''}`}>
        
        {/* Single Line Logo */}
        <div className="singleline-logo-wrap">
          <span className="push-char char-d1">d</span>
          <span className="push-char char-e">e</span>
          <span className="push-char char-v">v</span>
          <span className="push-char char-dot">.</span>
          <span className="push-char char-h">h</span>
          <span className="push-char char-y">y</span>
          <span className="push-char char-d2">d</span>
        </div>

        {/* Subtitle */}
        <p className="singleline-subtitle">
          {subtitle}
        </p>

        {/* Percentage */}
        <div className="singleline-pct">{progress}%</div>

      </div>
    </div>
  )
}
