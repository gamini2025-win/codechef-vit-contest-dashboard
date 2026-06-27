'use client'

import { useState, useMemo } from 'react'
import { useContestStore } from '@/store/contestStore'
import { Pagination } from '@/components/ui/Pagination'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { Participant } from '@/types'

type SortKey = 'rank' | 'name' | 'solved' | 'penalty'
type SortDir = 'asc' | 'desc'

const MEDALS = ['🥇', '🥈', '🥉']
const PER_PAGE = 10

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 text-white/30" />
  return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#E84545]" /> : <ChevronDown className="w-3 h-3 text-[#E84545]" />
}

export function Participants() {
  const { participants } = useContestStore()

  const [search, setSearch] = useState('')
  const [filterInstitution, setFilterInstitution] = useState('All')
  const [filterMinSolved, setFilterMinSolved] = useState(0)
  const [filterMaxRank, setFilterMaxRank] = useState(Infinity)
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)

  const institutions = useMemo(() => {
    const set = new Set(participants.map((p) => p.institution))
    return ['All', ...Array.from(set).sort()]
  }, [participants])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const filtered = useMemo(() => {
    let list = participants.filter((p) => {
      const q = search.toLowerCase()
      if (q && !p.name.toLowerCase().includes(q) && !p.institution.toLowerCase().includes(q)) return false
      if (filterInstitution !== 'All' && p.institution !== filterInstitution) return false
      if (p.solved < filterMinSolved) return false
      if (p.rank > filterMaxRank) return false
      if (filterStatus !== 'All' && p.status !== filterStatus) return false
      return true
    })

    list = [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'rank') cmp = a.rank - b.rank
      else if (sortKey === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortKey === 'solved') cmp = b.solved - a.solved
      else if (sortKey === 'penalty') cmp = a.penalty - b.penalty
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [participants, search, filterInstitution, filterMinSolved, filterMaxRank, filterStatus, sortKey, sortDir])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function resetFilters() {
    setSearch('')
    setFilterInstitution('All')
    setFilterMinSolved(0)
    setFilterMaxRank(Infinity)
    setFilterStatus('All')
    setPage(1)
  }

  const thClass = 'py-2.5 px-3 text-left text-xs text-white/40 font-medium uppercase tracking-wider'

  return (
    <div className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white text-lg">Participants</h2>
        <span className="text-xs text-white/40">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Search by name or institution..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E84545]/50 transition-colors"
          />
        </div>

        {/* Institution */}
        <select
          value={filterInstitution}
          onChange={(e) => { setFilterInstitution(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-[#E84545]/50 transition-colors"
        >
          {institutions.map((i) => <option key={i} value={i} className="bg-gray-900">{i}</option>)}
        </select>

        {/* Min Solved */}
        <select
          value={filterMinSolved}
          onChange={(e) => { setFilterMinSolved(Number(e.target.value)); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-[#E84545]/50 transition-colors"
        >
          <option value={0} className="bg-gray-900">Min Solved</option>
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n} className="bg-gray-900">{n}+ solved</option>)}
        </select>

        {/* Max Rank */}
        <select
          value={filterMaxRank === Infinity ? 'All' : filterMaxRank}
          onChange={(e) => { setFilterMaxRank(e.target.value === 'All' ? Infinity : Number(e.target.value)); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-[#E84545]/50 transition-colors"
        >
          <option value="All" className="bg-gray-900">Max Rank</option>
          {[10, 20, 50].map((n) => <option key={n} value={n} className="bg-gray-900">Top {n}</option>)}
        </select>

        {/* Status */}
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); setPage(1) }}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 focus:outline-none focus:border-[#E84545]/50 transition-colors"
        >
          {['All', 'Active', 'Inactive'].map((s) => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
        </select>

        <button
          onClick={resetFilters}
          className="px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/10"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th
                className={`${thClass} cursor-pointer hover:text-white/70`}
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center gap-1">Rank <SortIcon col="rank" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th
                className={`${thClass} cursor-pointer hover:text-white/70`}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">Name <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th className={thClass}>Institution</th>
              <th
                className={`${thClass} cursor-pointer hover:text-white/70`}
                onClick={() => handleSort('solved')}
              >
                <div className="flex items-center gap-1">Solved <SortIcon col="solved" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th
                className={`${thClass} cursor-pointer hover:text-white/70`}
                onClick={() => handleSort('penalty')}
              >
                <div className="flex items-center gap-1">Penalty <SortIcon col="penalty" sortKey={sortKey} sortDir={sortDir} /></div>
              </th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p: Participant) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-3 px-3">
                  <span className="font-mono text-white/80">
                    {p.rank <= 3 ? MEDALS[p.rank - 1] : `#${p.rank}`}
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-white/90">{p.name}</td>
                <td className="py-3 px-3 text-white/50 text-xs">{p.institution}</td>
                <td className="py-3 px-3">
                  <span className="font-mono font-bold text-[#E84545]">{p.solved}</span>
                </td>
                <td className="py-3 px-3 font-mono text-white/60">{p.penalty}</td>
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                    p.status === 'Active'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/10 text-white/40 border border-white/10'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-white/30 text-sm">
                  No participants match the current filters
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
