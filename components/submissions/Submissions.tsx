'use client'

import { useState, useMemo } from 'react'
import { useContestStore } from '@/store/contestStore'
import { Pagination } from '@/components/ui/Pagination'
import { VerdictBadge } from '@/components/ui/VerdictBadge'
import { Search, RotateCcw } from 'lucide-react'
import type { Verdict } from '@/types'

const ALL_VERDICTS: Verdict[] = ['AC', 'WA', 'TLE', 'RE', 'Pending', 'Running']
const PER_PAGE = 12

export function Submissions() {
  const { submissions, problems, rejudgeSubmission, undoLastRejudge, lastRejudge } = useContestStore()

  const [search, setSearch] = useState('')
  const [filterVerdict, setFilterVerdict] = useState<Verdict | 'All'>('All')
  const [filterProblem, setFilterProblem] = useState('All')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      const q = search.toLowerCase()
      if (q && !s.participantName.toLowerCase().includes(q) && !s.problemName.toLowerCase().includes(q)) return false
      if (filterVerdict !== 'All' && s.verdict !== filterVerdict) return false
      if (filterProblem !== 'All' && s.problemId !== filterProblem) return false
      return true
    })
  }, [submissions, search, filterVerdict, filterProblem])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const thClass = 'py-2.5 px-3 text-left text-xs text-white/40 font-medium uppercase tracking-wider'

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-bold text-white text-lg">Submissions</h2>
        <div className="flex items-center gap-2">
          {lastRejudge && (
            <button
              onClick={undoLastRejudge}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/20 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo Last Rejudge
            </button>
          )}
          <span className="text-xs text-white/40">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Search by participant or problem..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E84545]/50 transition-colors"
          />
        </div>

        <select
          value={filterVerdict}
          onChange={(e) => { setFilterVerdict(e.target.value as Verdict | 'All'); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-[#E84545]/50 transition-colors"
        >
          <option value="All" className="bg-gray-900">All Verdicts</option>
          {ALL_VERDICTS.map((v) => <option key={v} value={v} className="bg-gray-900">{v}</option>)}
        </select>

        <select
          value={filterProblem}
          onChange={(e) => { setFilterProblem(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-[#E84545]/50 transition-colors"
        >
          <option value="All" className="bg-gray-900">All Problems</option>
          {problems.map((p) => <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className={thClass}>ID</th>
              <th className={thClass}>Participant</th>
              <th className={thClass}>Problem</th>
              <th className={thClass}>Verdict</th>
              <th className={thClass}>Language</th>
              <th className={thClass}>Time</th>
              <th className={thClass}>Rejudge</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((sub) => (
              <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-3 font-mono text-xs text-white/40">{sub.id}</td>
                <td className="py-3 px-3 font-medium text-white/90 whitespace-nowrap">{sub.participantName}</td>
                <td className="py-3 px-3 text-white/70 whitespace-nowrap">{sub.problemName}</td>
                <td className="py-3 px-3">
                  <VerdictBadge verdict={sub.verdict} />
                </td>
                <td className="py-3 px-3 text-white/50 text-xs">{sub.language}</td>
                <td className="py-3 px-3 font-mono text-xs text-white/50">{sub.minutesElapsed}m</td>
                <td className="py-3 px-3">
                  <select
                    value={sub.verdict}
                    onChange={(e) => rejudgeSubmission(sub.id, e.target.value as Verdict)}
                    className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white/70 focus:outline-none focus:border-[#E84545]/50 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {ALL_VERDICTS.map((v) => (
                      <option key={v} value={v} className="bg-gray-900">{v}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-white/30 text-sm">
                  No submissions match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
    </div>
  )
}
