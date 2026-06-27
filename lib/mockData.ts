import type { Participant, Problem, Submission, ActivityEvent, Verdict, Language, Institution } from '@/types'

export const PROBLEMS: Problem[] = [
  { id: 'p1', name: 'Two Sum Variant', difficulty: 'Easy', totalSubmissions: 0, accepted: 0 },
  { id: 'p2', name: 'Segment Tree Range', difficulty: 'Medium', totalSubmissions: 0, accepted: 0 },
  { id: 'p3', name: 'DP on Trees', difficulty: 'Hard', totalSubmissions: 0, accepted: 0 },
  { id: 'p4', name: 'Graph Coloring', difficulty: 'Hard', totalSubmissions: 0, accepted: 0 },
  { id: 'p5', name: 'Binary Search Pro', difficulty: 'Medium', totalSubmissions: 0, accepted: 0 },
]

const INSTITUTIONS: Institution[] = [
  'VIT Vellore', 'IIT Bombay', 'BITS Pilani', 'NIT Trichy',
  'VIT Chennai', 'IIT Delhi', 'IIIT Hyderabad', 'DTU Delhi',
]

const NAMES = [
  'Arjun Sharma', 'Priya Patel', 'Rahul Kumar', 'Sneha Reddy', 'Vikram Singh',
  'Ananya Gupta', 'Rohan Mehta', 'Kavya Nair', 'Aditya Joshi', 'Pooja Iyer',
  'Siddharth Rao', 'Neha Saxena', 'Karthik Pillai', 'Divya Krishnan', 'Amit Verma',
  'Shreya Agarwal', 'Nikhil Bose', 'Riya Choudhury', 'Varun Tiwari', 'Meera Menon',
  'Harsh Pandey', 'Tanvi Desai', 'Akash Mishra', 'Simran Malhotra', 'Devansh Shah',
]

const LANGUAGES: Language[] = ['C++', 'Java', 'Python', 'JavaScript', 'Go']

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateMockData(): {
  participants: Participant[]
  submissions: Submission[]
  activity: ActivityEvent[]
  problems: Problem[]
} {
  // Build participants with problem results
  const participants: Participant[] = NAMES.map((name, i) => ({
    id: `u${i + 1}`,
    name,
    institution: INSTITUTIONS[i % INSTITUTIONS.length],
    solved: 0,
    penalty: 0,
    rank: i + 1,
    status: Math.random() > 0.15 ? 'Active' : 'Inactive',
    problemResults: {},
  }))

  // Seed problem results and submissions
  const submissions: Submission[] = []
  const activity: ActivityEvent[] = []
  let subId = 1

  const now = new Date()
  const contestStart = new Date(now.getTime() - 45 * 60 * 1000) // started 45 min ago

  // For each participant, attempt some problems
  participants.forEach((p) => {
    PROBLEMS.forEach((prob) => {
      // Probability of attempting: easy > medium > hard
      const attemptChance = prob.difficulty === 'Easy' ? 0.9 : prob.difficulty === 'Medium' ? 0.65 : 0.4
      if (Math.random() > attemptChance) return

      const numAttempts = randInt(1, 4)
      let accepted = false
      let firstAcTime: number | undefined

      for (let a = 0; a < numAttempts; a++) {
        const minutesElapsed = randInt(3 + a * 5, Math.min(40 + a * 8, 110))
        const submittedAt = new Date(contestStart.getTime() + minutesElapsed * 60 * 1000)

        let verdict: Verdict
        if (!accepted && a === numAttempts - 1) {
          // Last attempt: 60% chance of AC for easy, 45% medium, 30% hard
          const acChance = prob.difficulty === 'Easy' ? 0.6 : prob.difficulty === 'Medium' ? 0.45 : 0.3
          verdict = Math.random() < acChance ? 'AC' : randItem(['WA', 'TLE', 'RE'] as Verdict[])
        } else if (!accepted) {
          verdict = randItem(['WA', 'TLE', 'RE'] as Verdict[])
        } else {
          break
        }

        if (verdict === 'AC') {
          accepted = true
          firstAcTime = minutesElapsed
        }

        submissions.push({
          id: `s${subId++}`,
          participantId: p.id,
          participantName: p.name,
          problemId: prob.id,
          problemName: prob.name,
          verdict,
          language: randItem(LANGUAGES),
          submittedAt,
          minutesElapsed,
        })
      }

      p.problemResults[prob.id] = {
        accepted,
        attempts: numAttempts,
        firstAcTime,
      }
    })
  })

  // Calculate solved & penalty for each participant
  participants.forEach((p) => {
    let solved = 0
    let penalty = 0

    PROBLEMS.forEach((prob) => {
      const result = p.problemResults[prob.id]
      if (!result || !result.accepted) return
      solved++
      const wrongAttempts = result.attempts - 1
      penalty += (result.firstAcTime ?? 0) + wrongAttempts * 20
    })

    p.solved = solved
    p.penalty = penalty
  })

  // Sort and rank
  participants.sort((a, b) => b.solved - a.solved || a.penalty - b.penalty)
  participants.forEach((p, i) => { p.rank = i + 1 })

  // Calculate problem stats
  const updatedProblems = PROBLEMS.map((prob) => {
    const probSubs = submissions.filter((s) => s.problemId === prob.id)
    return {
      ...prob,
      totalSubmissions: probSubs.length,
      accepted: probSubs.filter((s) => s.verdict === 'AC').length,
    }
  })

  // Add some join activity events
  const joinEvents: ActivityEvent[] = participants.slice(0, 10).map((p, i) => ({
    id: `act-join-${i}`,
    type: 'join' as const,
    message: `${p.name} joined the contest`,
    timestamp: new Date(contestStart.getTime() + i * 2 * 60 * 1000),
  }))

  // Add submission activity events (recent ones)
  const recentSubs = [...submissions]
    .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
    .slice(0, 15)

  const subEvents: ActivityEvent[] = recentSubs.map((s, i) => ({
    id: `act-sub-${i}`,
    type: 'submission' as const,
    message: `${s.participantName} submitted ${s.problemName} — ${s.verdict}`,
    timestamp: s.submittedAt,
  }))

  activity.push(...joinEvents, ...subEvents)
  activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return { participants, submissions, activity, problems: updatedProblems }
}
