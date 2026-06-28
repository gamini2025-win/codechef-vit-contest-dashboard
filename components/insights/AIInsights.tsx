'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import {
  ShieldCheck, AlertTriangle, Lightbulb, TrendingUp,
  CalendarCheck, Bot, ChevronDown, Sparkles, RefreshCw,
} from 'lucide-react'
import {
  getAIInsights, MOCK_USERS, USER_LIST, RATING_HISTORY, DIFFICULTY_DATA
} from '@/lib/mockUserData'
import type { AIInsight } from '@/lib/mockUserData'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  ShieldCheck, AlertTriangle, Lightbulb, TrendingUp, CalendarCheck,
}

// ─── Typing animation ─────────────────────────────────────────────────────────

function TypedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [started, setStarted]     = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(t)
  }, [delay, text])

  useEffect(() => {
    if (!started) { setDisplayed(''); return }
    setDisplayed('')
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(interval)
    }, 14)
    return () => clearInterval(interval)
  }, [started, text])

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse align-text-bottom" />
      )}
    </span>
  )
}

// ─── Mini sparkline inside insight card ────────────────────────────────────────

function MiniSparkline({ username, color }: { username: string; color: string }) {
  const data = (RATING_HISTORY[username] ?? []).slice(-8).map(p => ({ v: p.rating, d: p.date }))
  return (
    <ResponsiveContainer width="100%" height={56}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sparkGrad-${username}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        <Tooltip
          contentStyle={{ display: 'none' }}
          wrapperStyle={{ display: 'none' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// ─── Insight card ─────────────────────────────────────────────────────────────

function InsightCard({
  insight, index, username, animating,
}: {
  insight: AIInsight
  index: number
  username: string
  animating: boolean
}) {
  const IconComp = ICONS[insight.icon] ?? Lightbulb
  const isTrend  = insight.type === 'trend'

  return (
    <motion.div
      key={`${username}-${insight.id}`}
      initial={{ opacity: 0, x: -16, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl p-5 border relative overflow-hidden"
      style={{ borderColor: `${insight.accentColor}20` }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r"
        style={{ background: insight.accentColor }}
      />

      <div className="flex items-start justify-between gap-4 mb-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${insight.accentColor}15`,
            border: `1px solid ${insight.accentColor}30`,
          }}
        >
          <IconComp className="w-5 h-5" style={{ color: insight.accentColor }} />
        </div>

        {/* Metric badge */}
        {insight.metric && (
          <div className="text-right flex-shrink-0">
            <div
              className="text-xl font-black font-mono leading-none"
              style={{ color: insight.accentColor }}
            >
              {insight.metric}
            </div>
            <div className="text-[10px] text-white/30 mt-0.5">{insight.metricLabel}</div>
          </div>
        )}
      </div>

      <div className="mb-3">
        <h3 className="text-sm font-bold text-white mb-1">{insight.title}</h3>
        <p className="text-xs text-white/50 leading-relaxed">
          {animating ? (
            <TypedText text={insight.body} delay={index * 120} />
          ) : (
            insight.body
          )}
        </p>
      </div>

      {/* Sparkline for trend card */}
      {isTrend && (
        <div className="mt-3 border-t border-white/5 pt-3">
          <div className="text-[10px] text-white/30 mb-1">Last 8 contests</div>
          <MiniSparkline username={username} color={insight.accentColor} />
        </div>
      )}
    </motion.div>
  )
}

// ─── Difficulty bar breakdown ─────────────────────────────────────────────────

function DifficultyBreakdown({ username }: { username: string }) {
  const data  = DIFFICULTY_DATA[username] ?? []
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/8">
      <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#E84545]" />
        Difficulty Breakdown
      </h3>
      <div className="space-y-3">
        {data.map(bucket => (
          <div key={bucket.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/60 font-medium">{bucket.label}</span>
              <span className="font-bold font-mono" style={{ color: bucket.color }}>
                {bucket.count}
                <span className="text-white/30 font-normal ml-1">
                  ({Math.round((bucket.count / total) * 100)}%)
                </span>
              </span>
            </div>
            <div className="h-1.5 bg-white/6 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(bucket.count / total) * 100}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: bucket.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Rating trend chart ───────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="glass-card border border-white/10 rounded-lg px-3 py-2 text-xs">
      <div className="text-white/40 mb-0.5">{p.payload?.d}</div>
      <div className="font-bold text-white">{p.value}</div>
    </div>
  )
}

function RatingTrendChart({ username, color }: { username: string; color: string }) {
  const data   = (RATING_HISTORY[username] ?? []).map(p => ({ d: p.date, v: p.rating }))
  const avg    = Math.round(data.reduce((s, d) => s + d.v, 0) / (data.length || 1))

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/8">
      <h3 className="text-sm font-bold text-white/70 mb-1 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[#E84545]" />
        Rating Trend
      </h3>
      <div className="text-xs text-white/30 mb-3">18-month history</div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="d" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
          <ReferenceLine y={avg} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} dot={{ fill: color, r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="text-[10px] text-white/25 mt-1">Avg: {avg}</div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AIInsights() {
  const [username,  setUsername]  = useState('arjun_codes')
  const [userOpen,  setUserOpen]  = useState(false)
  const [animating, setAnimating] = useState(true)
  const [key,       setKey]       = useState(0)

  const user     = MOCK_USERS[username]
  const insights = getAIInsights(username)

  const handleRefresh = () => {
    setAnimating(true)
    setKey(k => k + 1)
  }

  const handleUserChange = (uname: string) => {
    setUsername(uname)
    setUserOpen(false)
    setAnimating(true)
    setKey(k => k + 1)
  }

  useEffect(() => {
    const t = setTimeout(() => setAnimating(false), insights.length * 120 + 3000)
    return () => clearTimeout(t)
  }, [key, insights.length])

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E84545]/20 to-[#a855f7]/20 border border-[#E84545]/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#E84545]" />
              </div>
              <h1 className="text-xl font-bold text-white">AI Insights</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E84545]/15 text-[#E84545] border border-[#E84545]/25">
                BETA
              </span>
            </div>
            <p className="text-sm text-white/40">AI-generated performance analysis based on your contest data.</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* User picker */}
            <div className="relative">
              <button
                onClick={() => setUserOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-2 glass-card rounded-xl border border-white/10 hover:border-white/20 transition-all text-sm"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: 'rgba(232,69,69,0.15)', color: '#E84545' }}
                >
                  {user?.avatar}
                </div>
                <span className="font-semibold text-white">{username}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-1 right-0 z-50 glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60 min-w-[160px]"
                  >
                    {USER_LIST.map(u => (
                      <button
                        key={u.username}
                        onClick={() => handleUserChange(u.username)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 transition-colors text-left text-sm ${
                          u.username === username ? 'text-[#E84545]' : 'text-white/70'
                        }`}
                      >
                        <span className="font-mono text-xs w-5">{u.avatar}</span>
                        {u.username}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-2 glass-card rounded-xl border border-white/10 hover:border-white/20 transition-all text-xs text-white/60 hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${animating ? 'animate-spin' : ''}`} />
              Re-analyze
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary bar */}
      <motion.div
        key={`summary-${key}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 px-4 py-3.5 rounded-xl border border-[#E84545]/20 bg-gradient-to-r from-[#E84545]/5 to-[#a855f7]/5 flex items-center gap-3"
      >
        <Sparkles className="w-4 h-4 text-[#E84545] flex-shrink-0" />
        <p className="text-xs text-white/60 leading-relaxed">
          <TypedText
            key={key}
            delay={0}
            text={`Analyzing ${user?.problemsSolved ?? 0} problems, ${user?.contestsParticipated ?? 0} contests, and ${user?.streakDays ?? 0}-day streak for ${username}. Here are your personalized insights:`}
          />
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div key={`insights-${key}-${username}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* Insight cards — 2 columns on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {insights.map((insight, i) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                index={i}
                username={username}
                animating={animating}
              />
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RatingTrendChart username={username} color="#E84545" />
            <DifficultyBreakdown username={username} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
