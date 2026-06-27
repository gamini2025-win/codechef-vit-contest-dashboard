'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  startTime: Date
  durationMinutes: number
}

export function CountdownTimer({ startTime, durationMinutes }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    function calc() {
      const end = startTime.getTime() + durationMinutes * 60 * 1000
      const rem = Math.max(0, end - Date.now())
      setRemaining(rem)
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [startTime, durationMinutes])

  const totalMs = durationMinutes * 60 * 1000
  const progress = Math.max(0, Math.min(1, 1 - remaining / totalMs))

  const h = Math.floor(remaining / 3600000)
  const m = Math.floor((remaining % 3600000) / 60000)
  const s = Math.floor((remaining % 60000) / 1000)

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDash = circumference * (1 - progress)

  const isLow = remaining < 10 * 60 * 1000

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          {/* Track */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          {/* Progress */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={isLow ? '#EF4444' : '#E84545'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold font-mono tabular-nums ${isLow ? 'text-red-400' : 'text-white'}`}>
            {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-white/50 mt-0.5">remaining</span>
        </div>
      </div>
      {remaining === 0 && (
        <span className="text-xs text-red-400 font-semibold animate-pulse">Contest Ended</span>
      )}
    </div>
  )
}
