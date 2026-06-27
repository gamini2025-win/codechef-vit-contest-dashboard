import type { Verdict } from '@/types'

const STYLES: Record<Verdict, string> = {
  AC: 'bg-green-500/20 text-green-400 border border-green-500/40',
  WA: 'bg-red-500/20 text-red-400 border border-red-500/40',
  TLE: 'bg-amber-500/20 text-amber-400 border border-amber-500/40',
  RE: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
  Pending: 'bg-blue-500/20 text-blue-400 border border-blue-500/40',
  Running: 'bg-purple-500/20 text-purple-400 border border-purple-500/40',
}

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${STYLES[verdict]}`}>
      {verdict}
    </span>
  )
}

export function DifficultyBadge({ difficulty }: { difficulty: 'Easy' | 'Medium' | 'Hard' }) {
  const styles = {
    Easy: 'bg-green-500/20 text-green-400',
    Medium: 'bg-amber-500/20 text-amber-400',
    Hard: 'bg-red-500/20 text-red-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[difficulty]}`}>
      {difficulty}
    </span>
  )
}
