'use client'

import { Lock, Unlock, Sun, Moon, Code2 } from 'lucide-react'
import { useContestStore } from '@/store/contestStore'
import { useEffect } from 'react'

interface TopbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const TABS = ['Dashboard', 'Participants', 'Submissions', 'Leaderboard']

export function Topbar({ activeTab, onTabChange }: TopbarProps) {
  const { frozen, toggleFreeze, darkMode, toggleDarkMode } = useContestStore()

  // Keyboard shortcut F to freeze/unfreeze
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'f' || e.key === 'F') {
        // Only if not focused on an input
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
        toggleFreeze()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [toggleFreeze])

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 rounded-lg bg-[#E84545] flex items-center justify-center shadow-lg shadow-[#E84545]/30">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold gradient-text leading-none">CodeChef VIT</div>
            <div className="text-[10px] text-white/50 leading-none">Contest Control</div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-[#E84545] text-white shadow-lg shadow-[#E84545]/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Live badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-400">LIVE</span>
          </div>

          {/* Freeze */}
          <button
            onClick={toggleFreeze}
            title={`${frozen ? 'Unfreeze' : 'Freeze'} leaderboard (F)`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              frozen
                ? 'bg-red-600/30 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/20 hover:bg-red-600/40'
                : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/15 hover:text-white'
            }`}
          >
            {frozen ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{frozen ? 'Frozen' : 'Freeze'}</span>
          </button>

          {/* Dark mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition-all border border-white/10"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  )
}
