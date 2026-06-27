export type Verdict = 'AC' | 'WA' | 'TLE' | 'RE' | 'Pending' | 'Running'

export type Language = 'C++' | 'Java' | 'Python' | 'JavaScript' | 'Go'

export type Institution =
  | 'VIT Vellore'
  | 'IIT Bombay'
  | 'BITS Pilani'
  | 'NIT Trichy'
  | 'VIT Chennai'
  | 'IIT Delhi'
  | 'IIIT Hyderabad'
  | 'DTU Delhi'

export interface Problem {
  id: string
  name: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  totalSubmissions: number
  accepted: number
}

export interface Participant {
  id: string
  name: string
  institution: Institution
  solved: number
  penalty: number
  rank: number
  status: 'Active' | 'Inactive'
  problemResults: Record<string, { accepted: boolean; attempts: number; firstAcTime?: number }>
}

export interface Submission {
  id: string
  participantId: string
  participantName: string
  problemId: string
  problemName: string
  verdict: Verdict
  language: Language
  submittedAt: Date
  minutesElapsed: number
}

export type ActivityType = 'submission' | 'join' | 'rejudge' | 'freeze'

export interface ActivityEvent {
  id: string
  type: ActivityType
  message: string
  timestamp: Date
}

export interface ContestState {
  participants: Participant[]
  submissions: Submission[]
  problems: Problem[]
  activity: ActivityEvent[]
  frozen: boolean
  frozenSnapshot: Participant[] | null
  darkMode: boolean
  lastRejudge: { submissionId: string; oldVerdict: Verdict } | null
  contestStartTime: Date
  contestDuration: number // minutes
}

export interface ContestActions {
  initData: () => void
  toggleFreeze: () => void
  rejudgeSubmission: (submissionId: string, newVerdict: Verdict) => void
  undoLastRejudge: () => void
  addSubmission: (submission: Submission) => void
  toggleDarkMode: () => void
  recalcRanks: () => void
}
