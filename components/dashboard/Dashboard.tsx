'use client'

import { useContestStore } from '@/store/contestStore'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { DifficultyBadge } from '@/components/ui/VerdictBadge'
import { Users, FileText, Send, CheckCircle, XCircle, TrendingUp, Activity } from 'lucide-react'
import type { ActivityEvent } from '@/types'

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  color: string
}) {
  return (
    <div className="glass-card p-5 rounded-xl hover:neon-border transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
    </div>
  )
}

const ACTIVITY_COLORS: Record<ActivityEvent['type'], string> = {
  submission: 'bg-blue-500',
  join: 'bg-green-500',
  rejudge: 'bg-amber-500',
  freeze: 'bg-red-500',
}

export function Dashboard() {
  const { participants, problems, submissions, activity, contestStartTime, contestDuration } = useContestStore()

  const totalSubmissions = submissions.length
  const accepted = submissions.filter((s) => s.verdict === 'AC').length
  const rejected = submissions.filter((s) => ['WA', 'TLE', 'RE'].includes(s.verdict)).length
  const pending = submissions.filter((s) => ['Pending', 'Running'].includes(s.verdict)).length
  const acRate = totalSubmissions > 0 ? ((accepted / totalSubmissions) * 100).toFixed(1) : '0.0'

  const stats = [
    { icon: Users, label: 'Total Participants', value: participants.length, color: 'bg-[#E84545]/30' },
    { icon: FileText, label: 'Total Problems', value: problems.length, color: 'bg-blue-500/30' },
    { icon: Send, label: 'Total Submissions', value: totalSubmissions, color: 'bg-purple-500/30' },
    { icon: CheckCircle, label: 'Accepted', value: accepted, color: 'bg-green-500/30' },
    { icon: XCircle, label: 'Rejected', value: rejected, color: 'bg-red-500/30' },
    { icon: TrendingUp, label: 'AC Rate', value: `${acRate}%`, color: 'bg-amber-500/30' },
  ]

  const verdictBreakdown = [
    { label: 'Accepted', count: accepted, color: 'bg-green-500', textColor: 'text-green-400' },
    { label: 'Rejected', count: rejected, color: 'bg-red-500', textColor: 'text-red-400' },
    { label: 'Pending', count: pending, color: 'bg-blue-500', textColor: 'text-blue-400' },
  ]

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Countdown + Submission Breakdown */}
        <div className="glass-card rounded-xl p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white/80 text-sm uppercase tracking-wider">Contest Timer</h3>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-400">LIVE</span>
            </div>
          </div>
          <div className="flex justify-center">
            <CountdownTimer startTime={contestStartTime} durationMinutes={contestDuration} />
          </div>

          {/* Submission Breakdown */}
          <div>
            <h4 className="text-xs text-white/50 uppercase tracking-wider mb-3">Submission Breakdown</h4>
            <div className="space-y-2.5">
              {verdictBreakdown.map((v) => (
                <div key={v.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={v.textColor}>{v.label}</span>
                    <span className="text-white/60">{v.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${v.color} transition-all duration-700`}
                      style={{ width: totalSubmissions > 0 ? `${(v.count / totalSubmissions) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-card rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-[#E84545]" />
            <h3 className="font-semibold text-white/80 text-sm uppercase tracking-wider">Activity Feed</h3>
          </div>
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 no-scrollbar">
            {activity.slice(0, 30).map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-sm">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ACTIVITY_COLORS[event.type]}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs leading-snug">{event.message}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">
                    {event.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="text-white/30 text-sm text-center py-8">No activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Per-Problem Statistics */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="font-semibold text-white/80 text-sm uppercase tracking-wider mb-4">Per-Problem Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Problem', 'Difficulty', 'Submissions', 'Accepted', 'Solve Rate', ''].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-white/40 font-medium uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {problems.map((prob) => {
                const rate = prob.totalSubmissions > 0
                  ? (prob.accepted / prob.totalSubmissions) * 100
                  : 0
                return (
                  <tr key={prob.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-medium text-white/90">{prob.name}</td>
                    <td className="py-3 px-3">
                      <DifficultyBadge difficulty={prob.difficulty} />
                    </td>
                    <td className="py-3 px-3 text-white/60 font-mono">{prob.totalSubmissions}</td>
                    <td className="py-3 px-3 text-green-400 font-mono">{prob.accepted}</td>
                    <td className="py-3 px-3 text-white/60 font-mono">{rate.toFixed(1)}%</td>
                    <td className="py-3 px-3 w-32">
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#E84545] transition-all duration-700"
                          style={{ width: `${Math.min(rate, 100)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
