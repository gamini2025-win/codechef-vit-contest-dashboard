'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ContestState, ContestActions, Submission, Verdict, Participant, ActivityEvent } from '@/types'
import { generateMockData, PROBLEMS } from '@/lib/mockData'

type Store = ContestState & ContestActions

function recalcRanksHelper(participants: Participant[]): Participant[] {
  const sorted = [...participants].sort((a, b) => b.solved - a.solved || a.penalty - b.penalty)
  return sorted.map((p, i) => ({ ...p, rank: i + 1 }))
}

function recalcParticipantStats(
  participant: Participant,
  submissions: Submission[]
): Participant {
  const mySubs = submissions.filter((s) => s.participantId === participant.id)
  const newResults: Participant['problemResults'] = {}
  let solved = 0
  let penalty = 0

  PROBLEMS.forEach((prob) => {
    const probSubs = mySubs
      .filter((s) => s.problemId === prob.id)
      .sort((a, b) => a.minutesElapsed - b.minutesElapsed)

    if (probSubs.length === 0) return

    let accepted = false
    let firstAcTime: number | undefined
    let wrongBefore = 0

    for (const sub of probSubs) {
      if (sub.verdict === 'AC' && !accepted) {
        accepted = true
        firstAcTime = sub.minutesElapsed
        break
      } else if (sub.verdict !== 'AC' && sub.verdict !== 'Pending' && sub.verdict !== 'Running') {
        wrongBefore++
      }
    }

    newResults[prob.id] = { accepted, attempts: probSubs.length, firstAcTime }

    if (accepted) {
      solved++
      penalty += (firstAcTime ?? 0) + wrongBefore * 20
    }
  })

  return { ...participant, problemResults: newResults, solved, penalty }
}

export const useContestStore = create<Store>()(
  persist(
    (set, get) => ({
      participants: [],
      submissions: [],
      problems: [],
      activity: [],
      frozen: false,
      frozenSnapshot: null,
      darkMode: true,
      lastRejudge: null,
      contestStartTime: new Date(Date.now() - 45 * 60 * 1000),
      contestDuration: 120,

      initData: () => {
        const { participants, submissions, activity, problems } = generateMockData()
        set({
          participants,
          submissions,
          activity,
          problems,
          contestStartTime: new Date(Date.now() - 45 * 60 * 1000),
        })
      },

      toggleFreeze: () => {
        const { frozen, participants, activity } = get()
        const newFrozen = !frozen
        const newEvent: ActivityEvent = {
          id: `act-freeze-${Date.now()}`,
          type: 'freeze',
          message: newFrozen ? 'Leaderboard frozen by admin' : 'Leaderboard unfrozen — rankings updated',
          timestamp: new Date(),
        }
        set({
          frozen: newFrozen,
          frozenSnapshot: newFrozen ? [...participants] : null,
          activity: [newEvent, ...activity],
        })
        if (!newFrozen) {
          get().recalcRanks()
        }
      },

      rejudgeSubmission: (submissionId: string, newVerdict: Verdict) => {
        const { submissions, participants, frozen, activity } = get()
        const sub = submissions.find((s) => s.id === submissionId)
        if (!sub || sub.verdict === newVerdict) return

        const oldVerdict = sub.verdict
        const updatedSubs = submissions.map((s) =>
          s.id === submissionId ? { ...s, verdict: newVerdict } : s
        )

        // Recalc affected participant
        const affected = participants.find((p) => p.id === sub.participantId)
        let updatedParticipants = participants
        if (affected) {
          const updated = recalcParticipantStats(affected, updatedSubs)
          updatedParticipants = participants.map((p) => (p.id === affected.id ? updated : p))
        }

        const rankedParticipants = frozen
          ? updatedParticipants
          : recalcRanksHelper(updatedParticipants)

        const newEvent: ActivityEvent = {
          id: `act-rejudge-${Date.now()}`,
          type: 'rejudge',
          message: `Rejudged ${sub.participantName}'s ${sub.problemName}: ${oldVerdict} → ${newVerdict}`,
          timestamp: new Date(),
        }

        set({
          submissions: updatedSubs,
          participants: rankedParticipants,
          lastRejudge: { submissionId, oldVerdict },
          activity: [newEvent, ...activity],
        })
      },

      undoLastRejudge: () => {
        const { lastRejudge } = get()
        if (!lastRejudge) return
        get().rejudgeSubmission(lastRejudge.submissionId, lastRejudge.oldVerdict)
        set({ lastRejudge: null })
      },

      addSubmission: (submission: Submission) => {
        const { submissions, participants, frozen, activity } = get()
        const updatedSubs = [submission, ...submissions]

        const affected = participants.find((p) => p.id === submission.participantId)
        let updatedParticipants = participants
        if (affected) {
          const updated = recalcParticipantStats(affected, updatedSubs)
          updatedParticipants = participants.map((p) => (p.id === affected.id ? updated : p))
        }

        const rankedParticipants = frozen
          ? updatedParticipants
          : recalcRanksHelper(updatedParticipants)

        const newEvent: ActivityEvent = {
          id: `act-sub-live-${Date.now()}`,
          type: 'submission',
          message: `${submission.participantName} submitted ${submission.problemName} — ${submission.verdict}`,
          timestamp: submission.submittedAt,
        }

        // Update problems stats
        const updatedProblems = get().problems.map((prob) => {
          if (prob.id !== submission.problemId) return prob
          const probSubs = updatedSubs.filter((s) => s.problemId === prob.id)
          return {
            ...prob,
            totalSubmissions: probSubs.length,
            accepted: probSubs.filter((s) => s.verdict === 'AC').length,
          }
        })

        set({
          submissions: updatedSubs,
          participants: rankedParticipants,
          problems: updatedProblems,
          activity: [newEvent, ...activity],
        })
      },

      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      recalcRanks: () => {
        const { participants } = get()
        set({ participants: recalcRanksHelper(participants) })
      },
    }),
    {
      name: 'codechef-contest-store',
      partialize: (state: Store) => ({ darkMode: state.darkMode }),
    }
  )
)
