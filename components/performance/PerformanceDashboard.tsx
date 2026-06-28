'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts'
import {
  TrendingUp, Code2, Trophy, Flame, Globe, Star, ChevronDown,
  CalendarDays, Clock, Activity, Sparkles, BookOpen,
  CheckCircle2, Swords, Medal, Target, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import {
  MOCK_USERS, USER_LIST, RATING_HISTORY, CONTEST_HISTORY,
  HEATMAPS, DIFFICULTY_DATA, UPCOMING_CONTESTS, getRecentActivity, getAIInsights,
} from '@/lib/mockUserData'

// ─── Animated counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const count  = useMotionValue(0)
  const rounded = useTransform(count, v => Math.round(v).toLocaleString())
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    const controls = animate(count, value, { duration, ease: 'easeOut' })
    const unsub = rounded.on('change', v => setDisplay(v))
    return () => { controls.stop(); unsub() }
  }, [value, duration, count, rounded])

  return <span>{display}</span>
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color, change, index,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: number
  sub?: string
  color: string
  change?: number
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass-card rounded-2xl p-4 border border-white/8 relative overflow-hidden"
    >
      {/* Faint background glow */}
      <div
        className="absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl pointer-events-none"
        style={{ background: `${color}18` }}
      />

      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-white font-mono leading-none mb-1">
        <AnimatedNumber value={value} />
      </div>
      <div className="text-xs text-white/40">{label}</div>
      {sub && <div className="text-[10px] text-white/25 mt-0.5">{sub}</div>}
    </motion.div>
  )
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = ['','M','','W','','F','']

function Heatmap({ username }: { username: string }) {
  const cells = HEATMAPS[username] ?? []

  // Group into 52 columns of 7 cells
  const weeks: typeof cells[] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const max   = Math.max(...cells.map(c => c.count), 1)

  function colorFor(count: number) {
    if (count === 0) return 'rgba(255,255,255,0.04)'
    const intensity = count / max
    if (intensity < 0.25) return 'rgba(232,69,69,0.2)'
    if (intensity < 0.5)  return 'rgba(232,69,69,0.4)'
    if (intensity < 0.75) return 'rgba(232,69,69,0.65)'
    return '#E84545'
  }

  // Get month labels from first cell of each month transition
  const monthLabels: { weekIdx: number; month: string }[] = []
  let lastMonth = -1
  weeks.forEach((week, wi) => {
    const d = week[0]?.date
    if (!d) return
    const m = new Date(d).getMonth()
    if (m !== lastMonth) {
      monthLabels.push({ weekIdx: wi, month: MONTHS[m] ?? '' })
      lastMonth = m
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl p-5 border border-white/8"
    >
      <h3 className="text-sm font-bold text-white/70 mb-3 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-[#E84545]" />
        Coding Activity
        <span className="text-xs text-white/25 font-normal ml-1">Last 52 weeks</span>
      </h3>

      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[640px]">
          {/* Month labels */}
          <div className="flex mb-1 ml-5">
            {weeks.map((_, wi) => {
              const lbl = monthLabels.find(m => m.weekIdx === wi)
              return (
                <div key={wi} className="flex-1 text-[8px] text-white/25 leading-none">
                  {lbl ? lbl.month : ''}
                </div>
              )
            })}
          </div>

          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAYS.map((d, i) => (
                <div key={i} className="w-3 h-3 flex items-center justify-end text-[8px] text-white/20 leading-none">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5 flex-1">
                {Array.from({ length: 7 }).map((_, di) => {
                  const cell = week[di]
                  return (
                    <div
                      key={di}
                      title={cell ? `${cell.date}: ${cell.count} submissions` : ''}
                      className="w-full aspect-square rounded-[2px] transition-all duration-100 cursor-default"
                      style={{ background: colorFor(cell?.count ?? 0) }}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1 mt-2 justify-end">
            <span className="text-[9px] text-white/25">Less</span>
            {[0, 0.2, 0.5, 0.75, 1].map(v => (
              <div
                key={v}
                className="w-2.5 h-2.5 rounded-sm"
                style={{ background: colorFor(v * max) }}
              />
            ))}
            <span className="text-[9px] text-white/25">More</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Contest timeline ─────────────────────────────────────────────────────────

function ContestTimeline({ username }: { username: string }) {
  const contests = (CONTEST_HISTORY[username] ?? []).slice(0, 8)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="glass-card rounded-2xl p-5 border border-white/8"
    >
      <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-[#E84545]" />
        Contest Timeline
      </h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-white/6" />
        <div className="space-y-3">
          {contests.map((c, i) => {
            const up = c.ratingChange >= 0
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="flex items-start gap-3 pl-8 relative"
              >
                {/* Dot */}
                <div
                  className="absolute left-2 top-1.5 w-3 h-3 rounded-full border-2 flex-shrink-0"
                  style={{
                    borderColor: up ? '#22c55e' : '#ef4444',
                    background: up ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-white/80 truncate">{c.name}</span>
                    <span className={`text-xs font-bold font-mono flex-shrink-0 ${up ? 'text-green-400' : 'text-red-400'}`}>
                      {up ? '+' : ''}{c.ratingChange}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/30">
                    <span>{c.date}</span>
                    <span>·</span>
                    <span>Rank #{c.rank.toLocaleString()}</span>
                    <span>·</span>
                    <span>{c.problemsSolved}/{c.totalProblems} solved</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Upcoming contest countdown ────────────────────────────────────────────────

function UpcomingContest() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const next = UPCOMING_CONTESTS[0]
  if (!next) return null

  const diff   = Math.max(0, Math.floor((next.date.getTime() - now.getTime()) / 1000))
  const days   = Math.floor(diff / 86400)
  const hours  = Math.floor((diff % 86400) / 3600)
  const mins   = Math.floor((diff % 3600) / 60)
  const secs   = diff % 60

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card rounded-2xl p-5 border border-[#E84545]/20 bg-gradient-to-br from-[#E84545]/5 to-transparent relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E84545]/40 to-transparent" />
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#E84545]/15 border border-[#E84545]/25 flex items-center justify-center">
          <Clock className="w-4 h-4 text-[#E84545]" />
        </div>
        <div>
          <div className="text-xs text-white/40 mb-0.5">Next Contest</div>
          <div className="text-sm font-bold text-white">{next.name}</div>
          <div className="text-[10px] text-white/30">{next.division} · {next.duration}</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[{ v: days, l: 'Days' }, { v: hours, l: 'Hrs' }, { v: mins, l: 'Min' }, { v: secs, l: 'Sec' }].map(({ v, l }) => (
          <div key={l} className="text-center py-2 rounded-lg bg-white/5 border border-white/6">
            <div className="text-xl font-black text-white font-mono leading-none">{pad(v)}</div>
            <div className="text-[9px] text-white/30 mt-0.5">{l}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-white/25">
          {next.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {' '}at {next.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="text-[10px] text-[#E84545] font-medium flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E84545] animate-pulse" />
          Live Soon
        </span>
      </div>
    </motion.div>
  )
}

// ─── Activity feed ────────────────────────────────────────────────────────────

function ActivityFeed({ username }: { username: string }) {
  const activity = getRecentActivity(username)
  const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
    solved: CheckCircle2, contest: Trophy, streak: Flame, badge: Medal,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="glass-card rounded-2xl p-5 border border-white/8"
    >
      <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-[#E84545]" />
        Recent Activity
      </h3>
      <div className="space-y-2">
        {activity.map((item, i) => {
          const Icon = ACTIVITY_ICONS[item.type] ?? Activity
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.04 }}
              className="flex items-center gap-3 py-1.5"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: item.color } as React.CSSProperties} />
              </div>
              <span className="flex-1 text-xs text-white/60">{item.text}</span>
              <span className="text-[10px] text-white/25 flex-shrink-0">{item.time}</span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Difficulty Pie ───────────────────────────────────────────────────────────

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="glass-card border border-white/10 rounded-lg px-3 py-2 text-xs">
      <span style={{ color: p.payload.color }} className="font-bold">{p.name}</span>
      <span className="text-white/60 ml-2">{p.value} problems</span>
    </div>
  )
}

function DifficultyPie({ username }: { username: string }) {
  const data  = DIFFICULTY_DATA[username] ?? []
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.38 }}
      className="glass-card rounded-2xl p-5 border border-white/8"
    >
      <h3 className="text-sm font-bold text-white/70 mb-1 flex items-center gap-2">
        <Target className="w-4 h-4 text-[#E84545]" />
        Difficulty Split
      </h3>
      <div className="text-xs text-white/25 mb-2">{total.toLocaleString()} total</div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="count" paddingAngle={3}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-1.5 mt-1">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: d.color }} />
            <span className="text-white/40">{d.label}</span>
            <span className="font-bold text-white/70 font-mono ml-auto">{d.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Rating history ───────────────────────────────────────────────────────────

const AreaTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="glass-card border border-white/10 rounded-lg px-3 py-2 text-xs">
      <div className="text-white/40">{p.payload?.d}</div>
      <div className="font-bold text-white mt-0.5">{p.value}</div>
      {p.payload?.c && <div className="text-white/30 mt-0.5 text-[10px]">{p.payload.c}</div>}
    </div>
  )
}

function RatingHistory({ username }: { username: string }) {
  const history = RATING_HISTORY[username] ?? []
  const data    = history.map(p => ({ d: p.date, v: p.rating, c: p.contestName, r: p.rank }))
  const first   = data[0]?.v ?? 0
  const last    = data[data.length - 1]?.v ?? 0
  const delta   = last - first
  const up      = delta >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-2xl p-5 border border-white/8"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-white/70 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#E84545]" />
          Rating History
        </h3>
        <div className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-green-400' : 'text-red-400'}`}>
          {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {up ? '+' : ''}{delta}
        </div>
      </div>
      <div className="text-xs text-white/25 mb-3">18 months</div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#E84545" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#E84545" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="d" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
          <Tooltip content={<AreaTooltip />} />
          <Area type="monotone" dataKey="v" stroke="#E84545" fill="url(#ratingGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#E84545' }} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ─── AI summary ───────────────────────────────────────────────────────────────

function AISummary({ username }: { username: string }) {
  const user     = MOCK_USERS[username]
  const insights = getAIInsights(username)
  const trend    = insights.find(i => i.type === 'trend')
  const suggest  = insights.find(i => i.type === 'suggestion')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card rounded-2xl p-5 border border-[#a855f7]/20 bg-gradient-to-br from-[#a855f7]/5 to-transparent relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a855f7]/30 to-transparent" />
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/25 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
        </div>
        <h3 className="text-sm font-bold text-white/70">AI Performance Summary</h3>
      </div>
      <p className="text-xs text-white/50 leading-relaxed">
        <span className="text-white font-semibold">{user?.username}</span> is a{' '}
        <span style={{ color: '#a855f7' }}>{user?.division}</span> coder with{' '}
        <span className="text-white">{user?.currentRating}</span> rating.{' '}
        {trend?.body.split('.')[0]}.{' '}
        {suggest?.body.split('.')[0]}.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['Consistent', user && user.streakDays > 20 ? 'Active Streak' : 'Building Streak',
          user && user.problemsSolved > 500 ? 'Prolific Solver' : 'Growing Solver',
        ].map(tag => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#a855f7]/10 border border-[#a855f7]/20 text-[#a855f7]"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

// ─── User selector header ─────────────────────────────────────────────────────

function UserHeader({
  username, onChangeUser,
}: {
  username: string
  onChangeUser: (u: string) => void
}) {
  const [open, setOpen] = useState(false)
  const user = MOCK_USERS[username]
  if (!user) return null

  const starColors = ['', '#808080', '#40e0d0', '#40e0d0', '#008000', '#008000', '#ff7f00', '#ff0000']

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black"
            style={{ background: 'rgba(232,69,69,0.15)', color: '#E84545', border: '1px solid rgba(232,69,69,0.25)' }}
          >
            {user.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-black text-white">{user.username}</span>
              <span className="text-lg" style={{ color: starColors[user.stars] }}>{'★'.repeat(user.stars)}</span>
            </div>
            <div className="text-xs text-white/40">{user.fullName} · {user.institution} · {user.countryFlag} {user.country}</div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-white/40">
                Global <span className="text-white font-bold">#{user.globalRank.toLocaleString()}</span>
              </span>
              <span className="text-white/20">·</span>
              <span className="text-[11px] text-white/40">
                Country <span className="text-white font-bold">#{user.countryRank.toLocaleString()}</span>
              </span>
              <span className="text-white/20">·</span>
              <span className="text-[11px] text-[#E84545] font-bold">{user.division}</span>
            </div>
          </div>
        </div>

        {/* User switcher */}
        <div className="relative">
          <button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2 glass-card rounded-xl border border-white/10 hover:border-white/20 transition-all text-sm"
          >
            <span className="text-white/60">Switch user</span>
            <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1 right-0 z-50 glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60 min-w-[180px]"
              >
                {USER_LIST.map(u => (
                  <button
                    key={u.username}
                    onClick={() => { onChangeUser(u.username); setOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 transition-colors text-left text-sm ${
                      u.username === username ? 'text-[#E84545]' : 'text-white/70'
                    }`}
                  >
                    <span className="font-mono text-xs w-5">{u.avatar}</span>
                    <span>{u.username}</span>
                    <span className="ml-auto text-[10px]" style={{ color: starColors[u.stars] }}>
                      {'★'.repeat(u.stars)}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PerformanceDashboard() {
  const [username, setUsername] = useState('arjun_codes')
  const user = MOCK_USERS[username]
  if (!user) return null

  const history = RATING_HISTORY[username] ?? []
  const last    = history[history.length - 1]
  const prev    = history[history.length - 2]
  const delta   = last && prev ? last.rating - prev.rating : 0

  return (
    <div className="min-h-screen px-4 py-6 max-w-7xl mx-auto">
      <UserHeader username={username} onChangeUser={setUsername} />

      {/* Stat cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        <StatCard index={0} icon={TrendingUp} label="Current Rating"    value={user.currentRating}         color="#E84545"  change={delta} />
        <StatCard index={1} icon={Star}       label="Highest Rating"    value={user.highestRating}         color="#f59e0b"  />
        <StatCard index={2} icon={Code2}      label="Problems Solved"   value={user.problemsSolved}        color="#22c55e"  />
        <StatCard index={3} icon={Trophy}     label="Contests"          value={user.contestsParticipated}  color="#3b82f6"  />
        <StatCard index={4} icon={Flame}      label="Day Streak"        value={user.streakDays}            color="#f97316"  sub="current" />
        <StatCard index={5} icon={Globe}      label="Global Rank"       value={user.globalRank}            color="#a855f7"  sub={`#${user.countryRank.toLocaleString()} country`} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left column (2/3 width on lg) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <RatingHistory username={username} />
          <Heatmap username={username} />
          <ContestTimeline username={username} />
        </div>

        {/* Right column (1/3 width on lg) */}
        <div className="flex flex-col gap-4">
          <UpcomingContest />
          <DifficultyPie username={username} />
          <AISummary username={username} />
          <ActivityFeed username={username} />
        </div>
      </div>
    </div>
  )
}
