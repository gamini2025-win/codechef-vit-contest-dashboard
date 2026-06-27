'use client'

import { useContestStore } from '@/store/contestStore'
import { Download, Lock } from 'lucide-react'
import type { Participant } from '@/types'
import { PROBLEMS } from '@/lib/mockData'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const MEDALS = ['🥇', '🥈', '🥉']
const ROW_HIGHLIGHTS = [
  'border-l-2 border-amber-400',
  'border-l-2 border-gray-400',
  'border-l-2 border-orange-500',
]

function ProblemCell({ result }: {
  result?: { accepted: boolean; attempts: number; firstAcTime?: number }
}) {
  if (!result || result.attempts === 0) {
    return <span className="text-white/20 text-xs">—</span>
  }
  if (result.accepted) {
    return (
      <div className="flex flex-col items-center">
        <span className="text-green-400 font-bold text-sm">✓</span>
        {result.firstAcTime !== undefined && (
          <span className="text-green-400/60 text-[10px]">{result.firstAcTime}m</span>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center">
      <span className="text-red-400 text-sm">✗</span>
      <span className="text-red-400/60 text-[10px]">×{result.attempts}</span>
    </div>
  )
}

function exportCSV(participants: Participant[], frozen: boolean) {
  const headers = ['Rank', 'Name', 'Institution', 'Solved', 'Penalty', ...PROBLEMS.map((p) => p.name)]
  const rows = participants.map((p) => {
    const probCells = PROBLEMS.map((prob) => {
      const r = p.problemResults[prob.id]
      if (!r || r.attempts === 0) return '-'
      if (r.accepted) return `AC (${r.firstAcTime}m)`
      return `WA x${r.attempts}`
    })
    return [p.rank, p.name, p.institution, p.solved, p.penalty, ...probCells]
  })
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `leaderboard${frozen ? '-frozen' : ''}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

/** Track previous ranks per participant so we can detect movement direction */
function useRankFlash(participants: Participant[], frozen: boolean) {
  const prevRanks = useRef<Record<string, number>>({})
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down' | null>>({})

  useEffect(() => {
    if (frozen) {
      setFlashes({})
      return
    }
    const newFlashes: Record<string, 'up' | 'down' | null> = {}
    participants.forEach((p) => {
      const prev = prevRanks.current[p.id]
      if (prev !== undefined && prev !== p.rank) {
        newFlashes[p.id] = p.rank < prev ? 'up' : 'down'
      }
    })
    if (Object.keys(newFlashes).length > 0) {
      setFlashes(newFlashes)
      // Clear flashes after 1 second
      const timer = setTimeout(() => setFlashes({}), 1000)
      return () => clearTimeout(timer)
    }
    // Update previous ranks
    participants.forEach((p) => { prevRanks.current[p.id] = p.rank })
  }, [participants, frozen])

  // Always sync prevRanks after render
  useEffect(() => {
    participants.forEach((p) => { prevRanks.current[p.id] = p.rank })
  }, [participants])

  return flashes
}

export function Leaderboard() {
  const { participants, frozenSnapshot, frozen } = useContestStore()
  const displayList = frozen && frozenSnapshot ? frozenSnapshot : participants
  const flashes = useRankFlash(participants, frozen)

  return (
    <div className="space-y-4">
      {frozen && (
        <div className="glass-card rounded-xl px-5 py-3 border border-red-500/30 bg-red-500/10 flex items-center gap-3">
          <Lock className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300 font-medium">
            Leaderboard is frozen — rankings are locked until unfrozen. New submissions still appear in the Submissions tab.
          </p>
        </div>
      )}

      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-bold text-white text-lg">
            Leaderboard
            {frozen && <span className="ml-2 text-xs font-normal text-red-400">(Frozen)</span>}
          </h2>
          <button
            onClick={() => exportCSV(displayList, frozen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/10 border border-white/10 rounded-lg hover:bg-white/15 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-2.5 px-3 text-left text-xs text-white/40 font-medium uppercase tracking-wider w-12">Rank</th>
                <th className="py-2.5 px-3 text-left text-xs text-white/40 font-medium uppercase tracking-wider">Name</th>
                <th className="py-2.5 px-3 text-left text-xs text-white/40 font-medium uppercase tracking-wider hidden sm:table-cell">Institution</th>
                <th className="py-2.5 px-3 text-center text-xs text-white/40 font-medium uppercase tracking-wider">Solved</th>
                <th className="py-2.5 px-3 text-center text-xs text-white/40 font-medium uppercase tracking-wider">Penalty</th>
                {PROBLEMS.map((p, i) => (
                  <th key={p.id} className="py-2.5 px-3 text-center text-xs font-medium uppercase tracking-wider w-16">
                    <span className="text-[#E84545]">P{i + 1}</span>
                    <div className="text-white/20 text-[9px] font-normal normal-case truncate max-w-14">{p.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {displayList.map((p: Participant) => {
                  const flash = flashes[p.id]
                  return (
                    <motion.tr
                      key={p.id}
                      layout={!frozen ? 'position' : false}
                      transition={!frozen ? { type: 'spring', stiffness: 300, damping: 30 } : undefined}
                      className={`border-b border-white/5 transition-colors ${
                        p.rank <= 3 ? ROW_HIGHLIGHTS[p.rank - 1] : ''
                      } ${
                        flash === 'up'
                          ? 'bg-green-500/20'
                          : flash === 'down'
                          ? 'bg-red-500/20'
                          : p.rank <= 3
                          ? p.rank === 1
                            ? 'bg-amber-500/10'
                            : p.rank === 2
                            ? 'bg-gray-400/10'
                            : 'bg-orange-600/10'
                          : 'hover:bg-white/5'
                      }`}
                      style={{
                        transition: flash
                          ? 'background-color 0s'
                          : 'background-color 1s ease-out',
                      }}
                    >
                      <td className="py-3 px-3">
                        <span className="font-mono text-sm">
                          {p.rank <= 3 ? MEDALS[p.rank - 1] : `#${p.rank}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-white/90 whitespace-nowrap">{p.name}</td>
                      <td className="py-3 px-3 text-white/50 text-xs hidden sm:table-cell">{p.institution}</td>
                      <td className="py-3 px-3 text-center font-bold font-mono text-[#E84545]">{p.solved}</td>
                      <td className="py-3 px-3 text-center font-mono text-white/60">{p.penalty}</td>
                      {PROBLEMS.map((prob) => (
                        <td key={prob.id} className="py-3 px-3 text-center">
                          <ProblemCell result={p.problemResults[prob.id]} />
                        </td>
                      ))}
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
