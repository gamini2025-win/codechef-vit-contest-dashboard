'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import {
  Search, Star, Globe, Trophy, Code2,
  Flag, Swords, ChevronDown, X, TrendingUp, TrendingDown, Minus
} from 'lucide-react'
import { MOCK_USERS, RATING_HISTORY, USER_LIST } from '@/lib/mockUserData'
import type { UserProfile } from '@/lib/mockUserData'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StarDisplay({ count, size = 'sm' }: { count: number; size?: 'sm' | 'lg' }) {
  const starColors = ['', '#808080', '#40e0d0', '#40e0d0', '#008000', '#008000', '#ff7f00', '#ff0000']
  const color = starColors[Math.min(count, 7)] ?? '#808080'
  const sz = size === 'lg' ? 'text-xl' : 'text-sm'
  return (
    <span className={`font-bold ${sz}`} style={{ color }}>
      {'★'.repeat(count)}
    </span>
  )
}

function MetricRow({
  label, leftVal, rightVal, leftRaw, rightRaw, higherIsBetter = true
}: {
  label: string
  leftVal: string
  rightVal: string
  leftRaw: number
  rightRaw: number
  higherIsBetter?: boolean
}) {
  const leftWins  = higherIsBetter ? leftRaw > rightRaw : leftRaw < rightRaw
  const rightWins = higherIsBetter ? rightRaw > leftRaw : rightRaw < leftRaw
  const tied      = leftRaw === rightRaw

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      {/* Left value */}
      <div className="flex-1 text-right">
        <span
          className={`text-base font-bold font-mono transition-colors ${
            tied ? 'text-white/60' : leftWins ? 'text-[#E84545]' : 'text-white/40'
          }`}
        >
          {leftVal}
        </span>
        {!tied && leftWins && (
          <span className="ml-1 text-[10px] text-[#E84545] font-bold align-middle">▲</span>
        )}
      </div>

      {/* Label */}
      <div className="w-36 text-center text-xs text-white/40 font-medium">{label}</div>

      {/* Right value */}
      <div className="flex-1 text-left">
        {!tied && rightWins && (
          <span className="mr-1 text-[10px] text-[#E84545] font-bold align-middle">▲</span>
        )}
        <span
          className={`text-base font-bold font-mono transition-colors ${
            tied ? 'text-white/60' : rightWins ? 'text-[#E84545]' : 'text-white/40'
          }`}
        >
          {rightVal}
        </span>
      </div>
    </div>
  )
}

// ─── User selector dropdown ────────────────────────────────────────────────────

function UserSelector({
  selected, onSelect, exclude, placeholder
}: {
  selected: UserProfile | null
  onSelect: (u: UserProfile) => void
  exclude?: string
  placeholder: string
}) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const ref               = useRef<HTMLDivElement>(null)

  const filtered = USER_LIST
    .filter(u => u.username !== exclude)
    .filter(u =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.fullName.toLowerCase().includes(query.toLowerCase())
    )

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const starColors = ['', '#808080', '#40e0d0', '#40e0d0', '#008000', '#008000', '#ff7f00', '#ff0000']

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 glass-card rounded-xl border border-white/10 hover:border-white/20 transition-all text-left"
      >
        {selected ? (
          <>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'rgba(232,69,69,0.2)', color: '#E84545' }}
            >
              {selected.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{selected.username}</div>
              <div className="text-[11px] text-white/40">{selected.fullName} · {selected.institution}</div>
            </div>
            <StarDisplay count={selected.stars} />
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
              <Search className="w-4 h-4 text-white/30" />
            </div>
            <span className="text-sm text-white/30">{placeholder}</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 text-white/30 ml-auto flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 left-0 right-0 z-50 glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60"
          >
            <div className="p-2 border-b border-white/5">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg">
                <Search className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search users..."
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto no-scrollbar">
              {filtered.map(u => (
                <button
                  key={u.username}
                  onClick={() => { onSelect(u); setOpen(false); setQuery('') }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(232,69,69,0.15)', color: '#E84545' }}
                  >
                    {u.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{u.username}</div>
                    <div className="text-[11px] text-white/40">{u.institution}</div>
                  </div>
                  <span className="text-xs font-bold" style={{ color: starColors[u.stars] }}>
                    {'★'.repeat(u.stars)}
                  </span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-white/30">No users found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Radar data builder ────────────────────────────────────────────────────────

function buildRadarData(a: UserProfile, b: UserProfile) {
  const norm = (val: number, max: number) => Math.round((val / max) * 100)
  return [
    { metric: 'Rating',    [a.username]: norm(a.currentRating, 3500), [b.username]: norm(b.currentRating, 3500) },
    { metric: 'Solved',    [a.username]: norm(a.problemsSolved, 1500), [b.username]: norm(b.problemsSolved, 1500) },
    { metric: 'Contests',  [a.username]: norm(a.contestsParticipated, 100), [b.username]: norm(b.contestsParticipated, 100) },
    { metric: 'Stars',     [a.username]: norm(a.stars, 7), [b.username]: norm(b.stars, 7) },
    { metric: 'Streak',    [a.username]: norm(a.streakDays, 100), [b.username]: norm(b.streakDays, 100) },
    { metric: 'Rank',      [a.username]: norm(100000 - a.globalRank, 100000), [b.username]: norm(100000 - b.globalRank, 100000) },
  ]
}

// ─── Score summary ────────────────────────────────────────────────────────────

function calcWins(a: UserProfile, b: UserProfile) {
  const metrics = [
    { av: a.currentRating,    bv: b.currentRating,    hi: true },
    { av: a.problemsSolved,   bv: b.problemsSolved,   hi: true },
    { av: a.contestsParticipated, bv: b.contestsParticipated, hi: true },
    { av: a.stars,            bv: b.stars,            hi: true },
    { av: a.streakDays,       bv: b.streakDays,       hi: true },
    { av: a.globalRank,       bv: b.globalRank,       hi: false },
  ]
  let aw = 0, bw = 0
  for (const m of metrics) {
    if (m.hi ? m.av > m.bv : m.av < m.bv) aw++
    else if (m.hi ? m.bv > m.av : m.bv < m.av) bw++
  }
  return { aWins: aw, bWins: bw }
}

// ─── Rating history overlay chart ─────────────────────────────────────────────

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card border border-white/10 rounded-lg px-3 py-2 text-xs">
      <div className="text-white/50 mb-1">{payload[0]?.payload?.date}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/70">{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CompareUsers() {
  const [userA, setUserA] = useState<UserProfile | null>(MOCK_USERS['arjun_codes'] ?? null)
  const [userB, setUserB] = useState<UserProfile | null>(MOCK_USERS['priya_dev'] ?? null)

  // Merge rating histories by date
  const chartData = (() => {
    if (!userA || !userB) return []
    const ha = RATING_HISTORY[userA.username] ?? []
    const hb = RATING_HISTORY[userB.username] ?? []
    const len = Math.min(ha.length, hb.length)
    return ha.slice(-len).map((p, i) => ({
      date: p.date,
      [userA.username]: p.rating,
      [userB.username]: hb[hb.length - len + i]?.rating ?? 0,
    }))
  })()

  const radarData = userA && userB ? buildRadarData(userA, userB) : []
  const wins = userA && userB ? calcWins(userA, userB) : { aWins: 0, bWins: 0 }
  const leader = wins.aWins > wins.bWins ? userA : wins.bWins > wins.aWins ? userB : null

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Swords className="w-5 h-5 text-[#E84545]" />
          <h1 className="text-xl font-bold text-white">Compare Users</h1>
        </div>
        <p className="text-sm text-white/40">Select two CodeChef users to view a head-to-head performance breakdown.</p>
      </motion.div>

      {/* User selectors */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
      >
        <UserSelector
          selected={userA}
          onSelect={setUserA}
          exclude={userB?.username}
          placeholder="Select first user..."
        />
        <UserSelector
          selected={userB}
          onSelect={setUserB}
          exclude={userA?.username}
          placeholder="Select second user..."
        />
      </motion.div>

      {userA && userB ? (
        <>
          {/* Winner banner */}
          <AnimatePresence mode="wait">
            {leader && (
              <motion.div
                key={leader.username}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="mb-6 px-4 py-3 rounded-xl border border-[#E84545]/30 bg-[#E84545]/5 flex items-center gap-3"
              >
                <Trophy className="w-5 h-5 text-[#E84545] flex-shrink-0" />
                <span className="text-sm text-white/80">
                  <span className="font-bold text-white">{leader.username}</span> leads with{' '}
                  <span className="font-bold text-[#E84545]">
                    {wins.aWins > wins.bWins ? wins.aWins : wins.bWins}/6
                  </span>{' '}
                  metrics won
                </span>
              </motion.div>
            )}
            {!leader && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6 px-4 py-3 rounded-xl border border-white/10 bg-white/3 flex items-center gap-3"
              >
                <Minus className="w-4 h-4 text-white/40" />
                <span className="text-sm text-white/40">It&apos;s a tie — 3 metrics each</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[userA, userB].map((user, idx) => (
              <motion.div
                key={user.username}
                custom={idx}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="glass-card rounded-2xl p-5 border border-white/8"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ background: idx === 0 ? 'rgba(232,69,69,0.15)' : 'rgba(168,85,247,0.15)',
                             color: idx === 0 ? '#E84545' : '#a855f7' }}
                  >
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">{user.username}</span>
                      {leader?.username === user.username && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E84545]/20 text-[#E84545]">LEADING</span>
                      )}
                    </div>
                    <div className="text-xs text-white/40 mb-2">{user.fullName} · {user.institution}</div>
                    <StarDisplay count={user.stars} size="lg" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {[
                    { icon: TrendingUp, label: 'Rating',    val: user.currentRating.toLocaleString() },
                    { icon: Globe,      label: 'Global Rank', val: `#${user.globalRank.toLocaleString()}` },
                    { icon: Code2,      label: 'Solved',    val: user.problemsSolved.toLocaleString() },
                    { icon: Trophy,     label: 'Contests',  val: user.contestsParticipated },
                    { icon: Flag,       label: 'Country Rank', val: `#${user.countryRank.toLocaleString()}` },
                    { icon: Star,       label: 'Division',  val: user.division },
                  ].map(({ icon: Icon, label, val }) => (
                    <div key={label} className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg bg-white/3 border border-white/5">
                      <Icon className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-white/30 leading-none">{label}</div>
                        <div className="text-xs font-bold text-white font-mono truncate">{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Metrics comparison */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="glass-card rounded-2xl p-5 border border-white/8 mb-6"
          >
            <h2 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2">
              <Swords className="w-4 h-4 text-[#E84545]" />
              Head-to-Head Metrics
            </h2>
            {/* Column headers */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 text-right text-xs font-bold text-[#E84545] truncate">{userA.username}</div>
              <div className="w-36" />
              <div className="flex-1 text-left text-xs font-bold text-[#a855f7] truncate">{userB.username}</div>
            </div>
            <MetricRow label="Current Rating"      leftVal={userA.currentRating.toLocaleString()}      rightVal={userB.currentRating.toLocaleString()}      leftRaw={userA.currentRating}      rightRaw={userB.currentRating} />
            <MetricRow label="Highest Rating"      leftVal={userA.highestRating.toLocaleString()}      rightVal={userB.highestRating.toLocaleString()}      leftRaw={userA.highestRating}      rightRaw={userB.highestRating} />
            <MetricRow label="Global Rank"         leftVal={`#${userA.globalRank.toLocaleString()}`}  rightVal={`#${userB.globalRank.toLocaleString()}`}  leftRaw={userA.globalRank}         rightRaw={userB.globalRank}         higherIsBetter={false} />
            <MetricRow label="Country Rank"        leftVal={`#${userA.countryRank.toLocaleString()}`} rightVal={`#${userB.countryRank.toLocaleString()}`} leftRaw={userA.countryRank}        rightRaw={userB.countryRank}        higherIsBetter={false} />
            <MetricRow label="Problems Solved"     leftVal={userA.problemsSolved.toLocaleString()}     rightVal={userB.problemsSolved.toLocaleString()}     leftRaw={userA.problemsSolved}     rightRaw={userB.problemsSolved} />
            <MetricRow label="Contests Joined"     leftVal={userA.contestsParticipated.toString()}     rightVal={userB.contestsParticipated.toString()}     leftRaw={userA.contestsParticipated} rightRaw={userB.contestsParticipated} />
            <MetricRow label="Stars"               leftVal={'★'.repeat(userA.stars)}                  rightVal={'★'.repeat(userB.stars)}                  leftRaw={userA.stars}              rightRaw={userB.stars} />
            <MetricRow label="Current Streak"      leftVal={`${userA.streakDays}d`}                   rightVal={`${userB.streakDays}d`}                   leftRaw={userA.streakDays}         rightRaw={userB.streakDays} />
          </motion.div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar */}
            <motion.div
              custom={3}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-5 border border-white/8"
            >
              <h2 className="text-sm font-bold text-white/70 mb-4">Skill Radar</h2>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Radar name={userA.username} dataKey={userA.username} stroke="#E84545" fill="#E84545" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name={userB.username} dataKey={userB.username} stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <span className="w-3 h-0.5 bg-[#E84545] rounded" />{userA.username}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <span className="w-3 h-0.5 bg-[#a855f7] rounded" />{userB.username}
                </div>
              </div>
            </motion.div>

            {/* Rating history */}
            <motion.div
              custom={4}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="glass-card rounded-2xl p-5 border border-white/8"
            >
              <h2 className="text-sm font-bold text-white/70 mb-4">Rating History</h2>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#E84545" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E84545" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey={userA.username} stroke="#E84545" fill="url(#gradA)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey={userB.username} stroke="#a855f7" fill="url(#gradB)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <Swords className="w-12 h-12 text-white/10 mb-4" />
          <p className="text-white/30 text-sm">Select two users above to begin the comparison</p>
        </motion.div>
      )}
    </div>
  )
}
