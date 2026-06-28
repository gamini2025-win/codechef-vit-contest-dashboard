'use client'

import { useEffect, useState, useCallback } from 'react'
import { useContestStore } from '@/store/contestStore'
import { Topbar } from '@/components/ui/Topbar'
import { AnimatedBackground, FloatingShapes } from '@/components/ui/AnimatedBackground'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { Participants } from '@/components/participants/Participants'
import { Submissions } from '@/components/submissions/Submissions'
import { Leaderboard } from '@/components/leaderboard/Leaderboard'
import { CompareUsers } from '@/components/compare/CompareUsers'
import { Achievements } from '@/components/achievements/Achievements'
import { AIInsights } from '@/components/insights/AIInsights'
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard'
import { PROBLEMS } from '@/lib/mockData'
import type { Submission, Verdict, Language, Participant } from '@/types'

const NAMES_POOL = [
  'Arjun Sharma', 'Priya Patel', 'Rahul Kumar', 'Sneha Reddy', 'Vikram Singh',
  'Ananya Gupta', 'Rohan Mehta', 'Kavya Nair', 'Aditya Joshi', 'Pooja Iyer',
]

const VERDICTS: Verdict[] = ['AC', 'WA', 'TLE', 'RE', 'Pending']
const LANGS: Language[] = ['C++', 'Java', 'Python']

let liveSubCounter = 1000

function generateLiveSub(): Submission {
  const name = NAMES_POOL[Math.floor(Math.random() * NAMES_POOL.length)]
  const prob = PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)]
  const verdict = VERDICTS[Math.floor(Math.random() * VERDICTS.length)]
  const lang = LANGS[Math.floor(Math.random() * LANGS.length)]
  return {
    id: `live-${liveSubCounter++}`,
    participantId: `u${Math.floor(Math.random() * 25) + 1}`,
    participantName: name,
    problemId: prob.id,
    problemName: prob.name,
    verdict,
    language: lang,
    submittedAt: new Date(),
    minutesElapsed: Math.floor(Math.random() * 100) + 1,
  }
}

export default function Home() {
  const { initData, addSubmission, participants, frozenSnapshot, frozen } = useContestStore()
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [mounted, setMounted] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [participantSearch, setParticipantSearch] = useState('')

  useEffect(() => {
    setMounted(true)
    initData()
  }, [initData])

  // Auto-generate a new submission every 10 seconds
  useEffect(() => {
    const id = setInterval(() => {
      addSubmission(generateLiveSub())
    }, 10000)
    return () => clearInterval(id)
  }, [addSubmission])

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Export CSV event from command palette
  useEffect(() => {
    function handleExport() {
      const displayList: Participant[] = frozen && frozenSnapshot ? frozenSnapshot : participants
      const headers = ['Rank', 'Name', 'Institution', 'Solved', 'Penalty', ...PROBLEMS.map((p) => p.name)]
      const rows = displayList.map((p) => {
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
    window.addEventListener('codechef:export-csv', handleExport)
    return () => window.removeEventListener('codechef:export-csv', handleExport)
  }, [participants, frozenSnapshot, frozen])

  const handleSearchParticipant = useCallback((name: string) => {
    setParticipantSearch(name)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      <AnimatedBackground />
      <FloatingShapes />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Topbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenPalette={() => setPaletteOpen(true)}
        />

        <main className="max-w-screen-2xl mx-auto w-full px-4 py-6">
          {activeTab === 'Dashboard'    && <Dashboard />}
          {activeTab === 'Participants' && (
            <Participants
              externalSearch={participantSearch}
              onExternalSearchConsumed={() => setParticipantSearch('')}
            />
          )}
          {activeTab === 'Submissions'  && <Submissions />}
          {activeTab === 'Leaderboard'  && <Leaderboard />}
          {activeTab === 'Compare'      && <CompareUsers />}
          {activeTab === 'Achievements' && <Achievements />}
          {activeTab === 'AI Insights'  && <AIInsights />}
          {activeTab === 'Performance'  && <PerformanceDashboard />}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onTabChange={setActiveTab}
        onSearchParticipant={handleSearchParticipant}
      />
    </div>
  )
}
