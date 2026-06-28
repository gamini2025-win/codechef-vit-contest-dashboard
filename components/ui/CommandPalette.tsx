'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContestStore } from '@/store/contestStore'
import { Search, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onTabChange: (tab: string) => void
  onSearchParticipant: (name: string) => void
}

interface Command {
  id: string
  label: string
  hint?: string
  keywords?: string
  action: () => void
  group: string
}

function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const t = target.toLowerCase()
  let qi = 0
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++
  }
  return qi === q.length
}

export function CommandPalette({ open, onClose, onTabChange, onSearchParticipant }: CommandPaletteProps) {
  const { toggleFreeze, toggleDarkMode, frozen, participants, frozenSnapshot } = useContestStore()
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Detect if user is searching a participant by typing "participant <name>" or just a name
  const isParticipantSearch = query.toLowerCase().startsWith('search ')
  const participantQuery = isParticipantSearch ? query.slice(7) : ''

  const displayList = frozen && frozenSnapshot ? frozenSnapshot : participants

  const baseCommands: Command[] = [
    {
      id: 'goto-dashboard',
      label: 'Go to Dashboard',
      group: 'Navigation',
      keywords: 'dashboard home overview',
      action: () => { onTabChange('Dashboard'); onClose() },
    },
    {
      id: 'goto-participants',
      label: 'Go to Participants',
      group: 'Navigation',
      keywords: 'participants users list',
      action: () => { onTabChange('Participants'); onClose() },
    },
    {
      id: 'goto-submissions',
      label: 'Go to Submissions',
      group: 'Navigation',
      keywords: 'submissions verdicts',
      action: () => { onTabChange('Submissions'); onClose() },
    },
    {
      id: 'goto-leaderboard',
      label: 'Go to Leaderboard',
      group: 'Navigation',
      keywords: 'leaderboard rankings',
      action: () => { onTabChange('Leaderboard'); onClose() },
    },
    {
      id: 'goto-compare',
      label: 'Go to Compare Users',
      group: 'Navigation',
      keywords: 'compare users head to head duel',
      action: () => { onTabChange('Compare'); onClose() },
    },
    {
      id: 'goto-achievements',
      label: 'Go to Achievements',
      group: 'Navigation',
      keywords: 'achievements badges unlocked milestones',
      action: () => { onTabChange('Achievements'); onClose() },
    },
    {
      id: 'goto-insights',
      label: 'Go to AI Insights',
      group: 'Navigation',
      keywords: 'ai insights analysis suggestions tips',
      action: () => { onTabChange('AI Insights'); onClose() },
    },
    {
      id: 'goto-performance',
      label: 'Go to Performance Dashboard',
      group: 'Navigation',
      keywords: 'performance dashboard personal stats heatmap',
      action: () => { onTabChange('Performance'); onClose() },
    },
    {
      id: 'toggle-freeze',
      label: frozen ? 'Unfreeze Leaderboard' : 'Freeze Leaderboard',
      hint: 'F',
      group: 'Actions',
      keywords: 'freeze unfreeze lock',
      action: () => { toggleFreeze(); onClose() },
    },
    {
      id: 'toggle-dark',
      label: 'Toggle Dark Mode',
      group: 'Actions',
      keywords: 'dark light mode theme',
      action: () => { toggleDarkMode(); onClose() },
    },
    {
      id: 'export-csv',
      label: 'Export Leaderboard CSV',
      group: 'Actions',
      keywords: 'export csv download',
      action: () => {
        // Trigger the leaderboard export by dispatching a custom event
        window.dispatchEvent(new CustomEvent('codechef:export-csv'))
        onClose()
      },
    },
  ]

  // Participant search commands — only shown when typing "search <name>"
  const participantCommands: Command[] = isParticipantSearch && participantQuery.length > 0
    ? displayList
        .filter((p) => fuzzyMatch(participantQuery, p.name))
        .slice(0, 5)
        .map((p) => ({
          id: `participant-${p.id}`,
          label: `${p.name}`,
          hint: `#${p.rank} · ${p.solved} solved`,
          group: 'Participants',
          keywords: p.name + ' ' + p.institution,
          action: () => {
            onSearchParticipant(p.name)
            onTabChange('Participants')
            onClose()
          },
        }))
    : []

  const filteredBase = query && !isParticipantSearch
    ? baseCommands.filter((c) =>
        fuzzyMatch(query, c.label) || fuzzyMatch(query, c.keywords ?? '')
      )
    : !isParticipantSearch
    ? baseCommands
    : []

  const allCommands = [...filteredBase, ...participantCommands]

  // Group commands
  const groups = allCommands.reduce<Record<string, Command[]>>((acc, cmd) => {
    acc[cmd.group] = acc[cmd.group] ?? []
    acc[cmd.group].push(cmd)
    return acc
  }, {})

  const flatList = Object.values(groups).flat()

  const execute = useCallback((cmd: Command) => {
    cmd.action()
    setQuery('')
    setActiveIdx(0)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[activeIdx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, flatList.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flatList[activeIdx]) execute(flatList[activeIdx])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-[18%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-xl"
            style={{ backgroundColor: 'rgba(14,14,20,0.98)', border: '1px solid rgba(232,69,69,0.25)', borderRadius: '14px', boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,69,69,0.1)' }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
              <Search className="w-4 h-4 text-white/40 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder='Search commands… or type "search <name>" to find a participant'
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-white/30 border border-white/10 bg-white/5">Esc</kbd>
            </div>

            {/* Results */}
            <ul
              ref={listRef}
              className="py-2 max-h-80 overflow-y-auto no-scrollbar"
              role="listbox"
            >
              {flatList.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-white/30">No commands found</li>
              ) : (
                Object.entries(groups).map(([groupName, cmds]) => (
                  <li key={groupName}>
                    <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                      {groupName}
                    </div>
                    {cmds.map((cmd) => {
                      const idx = flatList.indexOf(cmd)
                      return (
                        <button
                          key={cmd.id}
                          role="option"
                          aria-selected={idx === activeIdx}
                          onClick={() => execute(cmd)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                            idx === activeIdx
                              ? 'bg-[#E84545]/15 text-white'
                              : 'text-white/70 hover:bg-white/5'
                          }`}
                        >
                          <span className="font-medium">{cmd.label}</span>
                          {cmd.hint && (
                            <kbd className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-white/40 border border-white/10 bg-white/5 ml-2 shrink-0">
                              {cmd.hint}
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </li>
                ))
              )}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-end gap-4 px-4 py-2.5 border-t border-white/10">
              <span className="flex items-center gap-1 text-[10px] text-white/25">
                <ArrowUp className="w-2.5 h-2.5" /><ArrowDown className="w-2.5 h-2.5" /> navigate
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white/25">
                <CornerDownLeft className="w-2.5 h-2.5" /> execute
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white/25">
                <kbd className="font-mono">Esc</kbd> close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
