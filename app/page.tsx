'use client'

import { useEffect, useState } from 'react'
import { useContestStore } from '@/store/contestStore'
import { Topbar } from '@/components/ui/Topbar'
import { AnimatedBackground, FloatingShapes } from '@/components/ui/AnimatedBackground'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { Participants } from '@/components/participants/Participants'
import { Submissions } from '@/components/submissions/Submissions'
import { Leaderboard } from '@/components/leaderboard/Leaderboard'
import { PROBLEMS } from '@/lib/mockData'
import type { Submission, Verdict, Language } from '@/types'

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
  const { initData, addSubmission } = useContestStore()
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [mounted, setMounted] = useState(false)

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

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative">
      <AnimatedBackground />
      <FloatingShapes />

      <div className="relative z-10">
        <Topbar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="max-w-screen-2xl mx-auto px-4 py-6">
          {activeTab === 'Dashboard' && <Dashboard />}
          {activeTab === 'Participants' && <Participants />}
          {activeTab === 'Submissions' && <Submissions />}
          {activeTab === 'Leaderboard' && <Leaderboard />}
        </main>
      </div>
    </div>
  )
}
