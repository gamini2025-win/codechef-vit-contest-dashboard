// ─── Mock data for Compare Users, Achievements, AI Insights, Performance ───

export interface UserProfile {
  username: string
  fullName: string
  country: string
  countryFlag: string
  avatar: string
  stars: number          // 1–7
  currentRating: number
  highestRating: number
  globalRank: number
  countryRank: number
  problemsSolved: number
  contestsParticipated: number
  division: string
  institution: string
  streakDays: number
  joinedYear: number
}

export interface RatingPoint {
  date: string           // "MMM 'YY"
  rating: number
  contestName: string
  rank: number
}

export interface ContestEntry {
  id: string
  name: string
  date: string
  rank: number
  ratingChange: number
  ratingAfter: number
  problemsSolved: number
  totalProblems: number
  division: string
}

export interface HeatmapCell {
  date: string           // "YYYY-MM-DD"
  count: number          // submissions that day
}

export interface DifficultyBucket {
  label: string
  count: number
  color: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string           // lucide icon name
  category: 'contest' | 'problems' | 'streak' | 'rating' | 'special'
  unlocked: boolean
  unlockedDate?: string
  progress?: number      // 0–100 when locked
  progressLabel?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface AIInsight {
  id: string
  type: 'strength' | 'weakness' | 'suggestion' | 'trend' | 'weekly'
  title: string
  body: string
  metric?: string
  metricLabel?: string
  icon: string
  accentColor: string
}

// ─── User profiles ────────────────────────────────────────────────────────────

export const MOCK_USERS: Record<string, UserProfile> = {
  arjun_codes: {
    username: 'arjun_codes',
    fullName: 'Arjun Sharma',
    country: 'India',
    countryFlag: '🇮🇳',
    avatar: 'AS',
    stars: 5,
    currentRating: 2156,
    highestRating: 2243,
    globalRank: 4812,
    countryRank: 892,
    problemsSolved: 847,
    contestsParticipated: 63,
    division: 'Div 1',
    institution: 'IIT Bombay',
    streakDays: 47,
    joinedYear: 2021,
  },
  priya_dev: {
    username: 'priya_dev',
    fullName: 'Priya Nair',
    country: 'India',
    countryFlag: '🇮🇳',
    avatar: 'PN',
    stars: 4,
    currentRating: 1874,
    highestRating: 1921,
    globalRank: 14203,
    countryRank: 2841,
    problemsSolved: 612,
    contestsParticipated: 48,
    division: 'Div 2',
    institution: 'NIT Trichy',
    streakDays: 22,
    joinedYear: 2022,
  },
  karthik_vit: {
    username: 'karthik_vit',
    fullName: 'Karthik Rajan',
    country: 'India',
    countryFlag: '🇮🇳',
    avatar: 'KR',
    stars: 3,
    currentRating: 1542,
    highestRating: 1599,
    globalRank: 38900,
    countryRank: 7812,
    problemsSolved: 389,
    contestsParticipated: 31,
    division: 'Div 2',
    institution: 'VIT Chennai',
    streakDays: 14,
    joinedYear: 2023,
  },
  neha_algo: {
    username: 'neha_algo',
    fullName: 'Neha Gupta',
    country: 'India',
    countryFlag: '🇮🇳',
    avatar: 'NG',
    stars: 6,
    currentRating: 2487,
    highestRating: 2563,
    globalRank: 1247,
    countryRank: 198,
    problemsSolved: 1243,
    contestsParticipated: 89,
    division: 'Div 1',
    institution: 'BITS Pilani',
    streakDays: 93,
    joinedYear: 2020,
  },
  rahul_cp: {
    username: 'rahul_cp',
    fullName: 'Rahul Verma',
    country: 'India',
    countryFlag: '🇮🇳',
    avatar: 'RV',
    stars: 4,
    currentRating: 1788,
    highestRating: 1902,
    globalRank: 19041,
    countryRank: 3917,
    problemsSolved: 521,
    contestsParticipated: 42,
    division: 'Div 2',
    institution: 'DTU Delhi',
    streakDays: 8,
    joinedYear: 2022,
  },
}

export const USER_LIST = Object.values(MOCK_USERS)

// ─── Rating history (18 months) ───────────────────────────────────────────────

function genRatingHistory(start: number, volatility: number, count: number): RatingPoint[] {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const contestNames = [
    'Starters','Long Challenge','Cook-Off','Lunchtime','Short Contest','CodeChef Rated'
  ]
  let rating = start
  const results: RatingPoint[] = []
  const now = new Date(2025, 5, 1) // Jun 2025
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const change = Math.round((Math.random() - 0.42) * volatility)
    rating = Math.max(1000, rating + change)
    results.push({
      date: `${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
      rating,
      contestName: contestNames[Math.floor(Math.random() * contestNames.length)],
      rank: Math.floor(Math.random() * 2000) + 100,
    })
  }
  return results
}

export const RATING_HISTORY: Record<string, RatingPoint[]> = {
  arjun_codes: genRatingHistory(1650, 120, 18),
  priya_dev: genRatingHistory(1400, 100, 18),
  karthik_vit: genRatingHistory(1200, 90, 18),
  neha_algo: genRatingHistory(2000, 130, 18),
  rahul_cp: genRatingHistory(1350, 110, 18),
}

// Override last point to match current ratings
Object.entries(MOCK_USERS).forEach(([username, user]) => {
  const history = RATING_HISTORY[username]
  if (history) history[history.length - 1].rating = user.currentRating
})

// ─── Contest history ──────────────────────────────────────────────────────────

function genContestHistory(username: string): ContestEntry[] {
  const user = MOCK_USERS[username]
  const history = RATING_HISTORY[username]
  const divs = ['Div 1', 'Div 2', 'Div 3']
  const contestNames = [
    'Starters 141','Long Challenge May','Cook-Off 91','Lunchtime 120',
    'Starters 138','CodeChef Rated','Short Contest 42','Starters 135',
    'Long Challenge Apr','Lunchtime 119','Starters 132','Cook-Off 89',
  ]
  return contestNames.map((name, i) => ({
    id: `${username}-${i}`,
    name,
    date: history[Math.max(0, history.length - 1 - i)]?.date ?? 'Jun \'25',
    rank: Math.floor(Math.random() * 3000) + 50,
    ratingChange: Math.round((Math.random() - 0.4) * 120),
    ratingAfter: history[Math.max(0, history.length - 1 - i)]?.rating ?? user.currentRating,
    problemsSolved: Math.floor(Math.random() * 4) + 1,
    totalProblems: 6,
    division: divs[Math.floor(Math.random() * 2)],
  }))
}

export const CONTEST_HISTORY: Record<string, ContestEntry[]> = {
  arjun_codes: genContestHistory('arjun_codes'),
  priya_dev: genContestHistory('priya_dev'),
  karthik_vit: genContestHistory('karthik_vit'),
  neha_algo: genContestHistory('neha_algo'),
  rahul_cp: genContestHistory('rahul_cp'),
}

// ─── Coding heatmap (52 weeks × 7 days) ──────────────────────────────────────

export function genHeatmap(avgDaily: number): HeatmapCell[] {
  const cells: HeatmapCell[] = []
  const today = new Date(2025, 5, 28)
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const rand = Math.random()
    const count = rand < 0.3 ? 0 : Math.round(rand * avgDaily * (isWeekend ? 0.6 : 1.2))
    cells.push({ date: dateStr, count })
  }
  return cells
}

export const HEATMAPS: Record<string, HeatmapCell[]> = {
  arjun_codes: genHeatmap(6),
  priya_dev: genHeatmap(4),
  karthik_vit: genHeatmap(3),
  neha_algo: genHeatmap(9),
  rahul_cp: genHeatmap(3.5),
}

// ─── Difficulty distribution ──────────────────────────────────────────────────

export const DIFFICULTY_DATA: Record<string, DifficultyBucket[]> = {
  arjun_codes: [
    { label: 'Easy', count: 312, color: '#22c55e' },
    { label: 'Medium', count: 284, color: '#E84545' },
    { label: 'Hard', count: 181, color: '#a855f7' },
    { label: 'Challenge', count: 70, color: '#f59e0b' },
  ],
  priya_dev: [
    { label: 'Easy', count: 298, color: '#22c55e' },
    { label: 'Medium', count: 213, color: '#E84545' },
    { label: 'Hard', count: 82, color: '#a855f7' },
    { label: 'Challenge', count: 19, color: '#f59e0b' },
  ],
  karthik_vit: [
    { label: 'Easy', count: 221, color: '#22c55e' },
    { label: 'Medium', count: 124, color: '#E84545' },
    { label: 'Hard', count: 38, color: '#a855f7' },
    { label: 'Challenge', count: 6, color: '#f59e0b' },
  ],
  neha_algo: [
    { label: 'Easy', count: 398, color: '#22c55e' },
    { label: 'Medium', count: 451, color: '#E84545' },
    { label: 'Hard', count: 289, color: '#a855f7' },
    { label: 'Challenge', count: 105, color: '#f59e0b' },
  ],
  rahul_cp: [
    { label: 'Easy', count: 264, color: '#22c55e' },
    { label: 'Medium', count: 178, color: '#E84545' },
    { label: 'Hard', count: 65, color: '#a855f7' },
    { label: 'Challenge', count: 14, color: '#f59e0b' },
  ],
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export function getAchievements(username: string): Achievement[] {
  const user = MOCK_USERS[username]
  const solved = user?.problemsSolved ?? 0
  const contests = user?.contestsParticipated ?? 0
  const streak = user?.streakDays ?? 0
  const rating = user?.currentRating ?? 0
  const highest = user?.highestRating ?? 0

  return [
    {
      id: 'first_contest',
      title: 'First Blood',
      description: 'Participated in your first contest',
      icon: 'Trophy',
      category: 'contest',
      unlocked: contests >= 1,
      unlockedDate: '2021-08-12',
      rarity: 'common',
    },
    {
      id: 'contest_10',
      title: 'Contest Veteran',
      description: 'Participated in 10 contests',
      icon: 'Award',
      category: 'contest',
      unlocked: contests >= 10,
      progress: Math.min(100, (contests / 10) * 100),
      progressLabel: `${contests}/10 contests`,
      rarity: 'common',
    },
    {
      id: 'contest_50',
      title: 'Contest Champion',
      description: 'Participated in 50+ contests',
      icon: 'Crown',
      category: 'contest',
      unlocked: contests >= 50,
      progress: Math.min(100, (contests / 50) * 100),
      progressLabel: `${contests}/50 contests`,
      rarity: 'rare',
    },
    {
      id: 'solved_50',
      title: 'Problem Crusher',
      description: 'Solved 50 problems',
      icon: 'Code2',
      category: 'problems',
      unlocked: solved >= 50,
      progress: Math.min(100, (solved / 50) * 100),
      progressLabel: `${solved}/50 problems`,
      rarity: 'common',
    },
    {
      id: 'solved_100',
      title: 'Century Coder',
      description: 'Solved 100 problems',
      icon: 'Hash',
      category: 'problems',
      unlocked: solved >= 100,
      progress: Math.min(100, (solved / 100) * 100),
      progressLabel: `${solved}/100 problems`,
      rarity: 'common',
    },
    {
      id: 'solved_500',
      title: 'Grind Machine',
      description: 'Solved 500 problems',
      icon: 'Cpu',
      category: 'problems',
      unlocked: solved >= 500,
      progress: Math.min(100, (solved / 500) * 100),
      progressLabel: `${solved}/500 problems`,
      rarity: 'rare',
    },
    {
      id: 'solved_1000',
      title: 'Code Grandmaster',
      description: 'Solved 1000 problems',
      icon: 'Infinity',
      category: 'problems',
      unlocked: solved >= 1000,
      progress: Math.min(100, (solved / 1000) * 100),
      progressLabel: `${solved}/1000 problems`,
      rarity: 'legendary',
    },
    {
      id: 'streak_7',
      title: 'Week Warrior',
      description: 'Maintained a 7-day streak',
      icon: 'Flame',
      category: 'streak',
      unlocked: streak >= 7,
      progress: Math.min(100, (streak / 7) * 100),
      progressLabel: `${streak}/7 days`,
      rarity: 'common',
    },
    {
      id: 'streak_30',
      title: 'Month of Madness',
      description: 'Maintained a 30-day streak',
      icon: 'Zap',
      category: 'streak',
      unlocked: streak >= 30,
      progress: Math.min(100, (streak / 30) * 100),
      progressLabel: `${streak}/30 days`,
      rarity: 'rare',
    },
    {
      id: 'streak_90',
      title: 'Relentless',
      description: 'Maintained a 90-day streak',
      icon: 'Star',
      category: 'streak',
      unlocked: streak >= 90,
      progress: Math.min(100, (streak / 90) * 100),
      progressLabel: `${streak}/90 days`,
      rarity: 'epic',
    },
    {
      id: 'rating_1500',
      title: '3-Star Coder',
      description: 'Reached a rating of 1500',
      icon: 'TrendingUp',
      category: 'rating',
      unlocked: highest >= 1500,
      rarity: 'common',
    },
    {
      id: 'rating_2000',
      title: 'Expert',
      description: 'Reached a rating of 2000',
      icon: 'Sparkles',
      category: 'rating',
      unlocked: highest >= 2000,
      progress: Math.min(100, (rating / 2000) * 100),
      progressLabel: `${rating}/2000 rating`,
      rarity: 'epic',
    },
    {
      id: 'rating_2400',
      title: 'Master Coder',
      description: 'Reached a rating of 2400',
      icon: 'Medal',
      category: 'rating',
      unlocked: highest >= 2400,
      progress: Math.min(100, (rating / 2400) * 100),
      progressLabel: `${rating}/2400 rating`,
      rarity: 'legendary',
    },
    {
      id: 'top_performer',
      title: 'Top Performer',
      description: 'Ranked in the top 1% globally',
      icon: 'Globe',
      category: 'special',
      unlocked: (user?.globalRank ?? 999999) < 2000,
      rarity: 'legendary',
    },
  ]
}

// ─── AI Insights ──────────────────────────────────────────────────────────────

export function getAIInsights(username: string): AIInsight[] {
  const user = MOCK_USERS[username]
  const diff = DIFFICULTY_DATA[username] ?? []
  const sorted = [...diff].sort((a, b) => b.count - a.count)
  const strongest = sorted[0]?.label ?? 'Medium'
  const weakest = sorted[sorted.length - 1]?.label ?? 'Challenge'
  const history = RATING_HISTORY[username] ?? []
  const last6 = history.slice(-6)
  const trend = last6.length >= 2 
    ? last6[last6.length-1].rating - last6[0].rating 
    : 0

  const topicSuggestions: Record<string, string[]> = {
    Easy: ['Dynamic Programming', 'Graph Algorithms', 'Segment Trees'],
    Medium: ['Advanced DP', 'Network Flow', 'Computational Geometry'],
    Hard: ['String Algorithms', 'Heavy-Light Decomposition', 'FFT'],
    Challenge: ['Advanced Data Structures', 'Game Theory', 'Randomized Algorithms'],
  }
  const topics = topicSuggestions[weakest] ?? ['Dynamic Programming', 'Graphs', 'Trees']

  return [
    {
      id: 'strength',
      type: 'strength',
      title: 'Strongest Difficulty',
      body: `You excel at ${strongest} problems — ${diff.find(d=>d.label===strongest)?.count ?? 0} solved. This is your highest-volume category, showing consistent focus and comfort with this tier.`,
      metric: `${diff.find(d=>d.label===strongest)?.count ?? 0}`,
      metricLabel: 'problems solved',
      icon: 'ShieldCheck',
      accentColor: '#22c55e',
    },
    {
      id: 'weakness',
      type: 'weakness',
      title: 'Weakest Performance Area',
      body: `${weakest} problems are your least solved category (${diff.find(d=>d.label===weakest)?.count ?? 0} problems). Dedicating even 30 min/day to this tier can significantly improve your rating ceiling.`,
      metric: `${diff.find(d=>d.label===weakest)?.count ?? 0}`,
      metricLabel: 'problems in weakest area',
      icon: 'AlertTriangle',
      accentColor: '#f59e0b',
    },
    {
      id: 'topics',
      type: 'suggestion',
      title: 'Suggested Practice Topics',
      body: `Based on your difficulty distribution and recent contest performance, focus on: ${topics.join(', ')}. These topics appear frequently in your target rating band.`,
      metric: `${topics.length}`,
      metricLabel: 'topics recommended',
      icon: 'Lightbulb',
      accentColor: '#E84545',
    },
    {
      id: 'trend',
      type: 'trend',
      title: 'Rating Trend (6 months)',
      body: trend > 0
        ? `Your rating has climbed +${trend} points over the past 6 months — an upward trajectory that places you in the top 30% of improving coders in your division.`
        : `Your rating has dipped ${Math.abs(trend)} points over the last 6 months. Focus on consistency in Long Challenge rounds where you have more time to think.`,
      metric: `${trend > 0 ? '+' : ''}${trend}`,
      metricLabel: 'rating change (6mo)',
      icon: 'TrendingUp',
      accentColor: trend >= 0 ? '#22c55e' : '#ef4444',
    },
    {
      id: 'weekly',
      type: 'weekly',
      title: 'Weekly Improvement Plan',
      body: `Aim for 5 problems Mon–Fri across ${strongest} and ${weakest} tiers, participate in at least 1 rated contest this week, and review all Wrong Answer submissions. Target: +${Math.round(Math.abs(trend) / 6 + 15)} rating this month.`,
      metric: `5 / day`,
      metricLabel: 'recommended problems',
      icon: 'CalendarCheck',
      accentColor: '#a855f7',
    },
  ]
}

// ─── Upcoming contests ────────────────────────────────────────────────────────

export const UPCOMING_CONTESTS = [
  { name: 'CodeChef Starters 142', date: new Date(2025, 6, 2, 20, 0, 0), division: 'All Divisions', duration: '2h' },
  { name: 'CodeChef Long Challenge July', date: new Date(2025, 6, 4, 15, 0, 0), division: 'Div 1, 2, 3', duration: '10d' },
  { name: 'Cook-Off 92', date: new Date(2025, 6, 12, 21, 30, 0), division: 'Div 1, 2', duration: '2.5h' },
]

// ─── Recent activity ──────────────────────────────────────────────────────────

export function getRecentActivity(username: string) {
  const user = MOCK_USERS[username]
  if (!user) return []
  return [
    { id: 1, type: 'solved',   text: 'Solved "Max Subarray Sum" (Medium)',       time: '2h ago',  color: '#22c55e' },
    { id: 2, type: 'contest',  text: `Ranked #${Math.floor(Math.random()*500)+100} in Starters 141`, time: '2d ago', color: '#E84545' },
    { id: 3, type: 'solved',   text: 'Solved "Segment Tree Update" (Hard)',       time: '3d ago',  color: '#22c55e' },
    { id: 4, type: 'streak',   text: `Reached a ${user.streakDays}-day streak`,  time: '4d ago',  color: '#f59e0b' },
    { id: 5, type: 'solved',   text: 'Solved "Graph BFS Shortest Path" (Easy)',  time: '5d ago',  color: '#22c55e' },
    { id: 6, type: 'badge',    text: 'Unlocked "Problem Crusher" achievement',   time: '1w ago',  color: '#a855f7' },
    { id: 7, type: 'solved',   text: 'Solved "DP on Trees" (Hard)',              time: '1w ago',  color: '#22c55e' },
    { id: 8, type: 'contest',  text: 'Participated in Cook-Off 91',              time: '2w ago',  color: '#E84545' },
  ]
}
