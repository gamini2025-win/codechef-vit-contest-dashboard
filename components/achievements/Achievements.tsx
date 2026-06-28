'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy, Award, Crown, Code2, Hash, Cpu, Infinity,
  Flame, Zap, Star, TrendingUp, Sparkles, Medal, Globe,
  Lock, ChevronDown, Filter
} from 'lucide-react'
import { getAchievements, MOCK_USERS, USER_LIST } from '@/lib/mockUserData'
import type { Achievement } from '@/lib/mockUserData'

// ─── Icon map ────────────────────────────────────────────────────────────────

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Trophy, Award, Crown, Code2, Hash, Cpu, Infinity,
  Flame, Zap, Star, TrendingUp, Sparkles, Medal, Globe,
}

// ─── Rarity config ────────────────────────────────────────────────────────────

const RARITY = {
  common:    { label: 'Common',    color: '#6b7280', glow: 'rgba(107,114,128,0.25)', border: 'rgba(107,114,128,0.3)' },
  rare:      { label: 'Rare',      color: '#3b82f6', glow: 'rgba(59,130,246,0.25)',  border: 'rgba(59,130,246,0.3)' },
  epic:      { label: 'Epic',      color: '#a855f7', glow: 'rgba(168,85,247,0.3)',   border: 'rgba(168,85,247,0.35)' },
  legendary: { label: 'Legendary', color: '#f59e0b', glow: 'rgba(245,158,11,0.3)',   border: 'rgba(245,158,11,0.4)' },
}

const CATEGORY_COLORS: Record<string, string> = {
  contest:  '#E84545',
  problems: '#22c55e',
  streak:   '#f59e0b',
  rating:   '#a855f7',
  special:  '#3b82f6',
}

// ─── Badge card ────────────────────────────────────────────────────────────────

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const [hovered, setHovered] = useState(false)
  const rarity   = RARITY[achievement.rarity]
  const IconComp = ICONS[achievement.icon] ?? Trophy
  const catColor = CATEGORY_COLORS[achievement.category] ?? '#E84545'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative rounded-2xl overflow-hidden cursor-default"
      style={{
        background: achievement.unlocked
          ? `rgba(10,10,15,0.7)`
          : 'rgba(10,10,15,0.4)',
        border: `1px solid ${achievement.unlocked ? rarity.border : 'rgba(255,255,255,0.06)'}`,
        boxShadow: achievement.unlocked && hovered
          ? `0 0 24px ${rarity.glow}, 0 0 48px ${rarity.glow}`
          : 'none',
        transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        transform: hovered && achievement.unlocked ? 'translateY(-2px)' : 'none',
      }}
    >
      {/* Shimmer on unlocked hover */}
      {achievement.unlocked && hovered && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${rarity.glow}, transparent)`,
          }}
        />
      )}

      {/* Legendary top glow bar */}
      {achievement.unlocked && achievement.rarity === 'legendary' && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${rarity.color}, transparent)` }}
        />
      )}

      <div className={`p-4 ${!achievement.unlocked ? 'opacity-50' : ''}`}>
        {/* Icon + rarity */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: achievement.unlocked
                ? `linear-gradient(135deg, ${catColor}22, ${catColor}08)`
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${achievement.unlocked ? `${catColor}30` : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            {achievement.unlocked ? (
              <IconComp className="w-5 h-5" style={{ color: catColor }} />
            ) : (
              <Lock className="w-4 h-4 text-white/20" />
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
              style={{
                color: rarity.color,
                background: `${rarity.glow}`,
                border: `1px solid ${rarity.border}`,
              }}
            >
              {rarity.label}
            </span>
            <span
              className="text-[9px] font-medium px-1.5 py-0.5 rounded uppercase"
              style={{ color: catColor, background: `${catColor}15` }}
            >
              {achievement.category}
            </span>
          </div>
        </div>

        {/* Title + description */}
        <div className="mb-3">
          <div className="text-sm font-bold text-white leading-tight mb-0.5">{achievement.title}</div>
          <div className="text-[11px] text-white/40 leading-relaxed">{achievement.description}</div>
        </div>

        {/* Progress bar (locked) or unlocked date */}
        {achievement.unlocked ? (
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: catColor }}
            />
            <span className="text-[10px]" style={{ color: catColor }}>
              {achievement.unlockedDate ?? 'Unlocked'}
            </span>
          </div>
        ) : achievement.progress !== undefined ? (
          <div>
            <div className="flex justify-between text-[10px] text-white/30 mb-1">
              <span>{achievement.progressLabel}</span>
              <span>{Math.round(achievement.progress)}%</span>
            </div>
            <div className="h-1 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${achievement.progress}%` }}
                transition={{ delay: index * 0.04 + 0.3, duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${rarity.color}60, ${rarity.color})` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-[10px] text-white/20">Requirements not met</span>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const FILTERS = ['All', 'Unlocked', 'Locked', 'contest', 'problems', 'streak', 'rating', 'special']

export function Achievements() {
  const [username, setUsername] = useState('arjun_codes')
  const [filter,   setFilter]   = useState('All')
  const [userOpen, setUserOpen] = useState(false)

  const user         = MOCK_USERS[username]
  const achievements = getAchievements(username)
  const unlocked     = achievements.filter(a => a.unlocked).length

  const filtered = achievements.filter(a => {
    if (filter === 'Unlocked') return a.unlocked
    if (filter === 'Locked')   return !a.unlocked
    if (['contest','problems','streak','rating','special'].includes(filter)) return a.category === filter
    return true
  })

  const categoryStats = ['contest','problems','streak','rating','special'].map(cat => ({
    cat,
    total:    achievements.filter(a => a.category === cat).length,
    unlocked: achievements.filter(a => a.category === cat && a.unlocked).length,
    color:    CATEGORY_COLORS[cat] ?? '#E84545',
  }))

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Award className="w-5 h-5 text-[#E84545]" />
          <h1 className="text-xl font-bold text-white">Achievements</h1>
        </div>
        <p className="text-sm text-white/40">Track your milestones and unlock badges as you grow.</p>
      </motion.div>

      {/* User + stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        {/* User picker */}
        <div className="relative">
          <button
            onClick={() => setUserOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-2 glass-card rounded-xl border border-white/10 hover:border-white/20 transition-all text-sm"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
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
                className="absolute top-full mt-1 left-0 z-50 glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/60 min-w-[180px]"
              >
                {USER_LIST.map(u => (
                  <button
                    key={u.username}
                    onClick={() => { setUsername(u.username); setUserOpen(false) }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/5 transition-colors text-left text-sm ${u.username === username ? 'text-[#E84545]' : 'text-white/70'}`}
                  >
                    <span className="font-mono text-xs w-6 text-center">{u.avatar}</span>
                    {u.username}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-xs text-white/40 whitespace-nowrap">{unlocked}/{achievements.length} unlocked</span>
          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlocked / achievements.length) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#E84545] to-[#ff7b7b]"
            />
          </div>
          <span className="text-xs font-bold text-[#E84545]">{Math.round((unlocked / achievements.length) * 100)}%</span>
        </div>
      </motion.div>

      {/* Category stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6"
      >
        {categoryStats.map(({ cat, total, unlocked: ul, color }) => (
          <button
            key={cat}
            onClick={() => setFilter(filter === cat ? 'All' : cat)}
            className={`px-3 py-2 rounded-xl border text-left transition-all ${
              filter === cat
                ? 'bg-white/8 border-white/20'
                : 'glass-card border-white/6 hover:border-white/15'
            }`}
          >
            <div className="text-[10px] text-white/40 capitalize mb-0.5">{cat}</div>
            <div className="text-sm font-bold" style={{ color }}>{ul}<span className="text-white/30 font-normal">/{total}</span></div>
          </button>
        ))}
      </motion.div>

      {/* Filter pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12 }}
        className="flex items-center gap-2 flex-wrap mb-5"
      >
        <Filter className="w-3.5 h-3.5 text-white/30" />
        {['All', 'Unlocked', 'Locked'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
              filter === f
                ? 'bg-[#E84545] border-[#E84545] text-white'
                : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Badge grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${username}-${filter}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
        >
          {filtered.map((achievement, i) => (
            <AchievementCard key={achievement.id} achievement={achievement} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-white/30 text-sm">
              No achievements match this filter
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
