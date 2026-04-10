'use client'

import { useState } from 'react'
import { Trophy, CalendarDays, BookCheck, BarChart3, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { MatchesScreen } from './matches/matches-screen'
import { MyPredictionsScreen } from './predictions/my-predictions-screen'
import { LeaderboardScreen } from './leaderboard/leaderboard-screen'

type Tab = 'matches' | 'predictions' | 'leaderboard'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'matches', label: 'Partidos', icon: CalendarDays },
  { id: 'predictions', label: 'Mis Picks', icon: BookCheck },
  { id: 'leaderboard', label: 'Tabla', icon: BarChart3 },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('matches')

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: '#f4f5f7' }}>

      {/* Top header — Pure White LiveScore style */}
      <header
        className="shrink-0 bg-white"
        style={{ borderBottom: '1px solid #f3f4f6' }}
      >
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          
          {/* Avatar side */}
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold relative shadow-sm border border-gray-100" style={{ background: '#2563eb', color: '#fff' }}>
                {user?.name?.[0]?.toUpperCase() ?? '?'}
             </div>
             {/* Small rank info */}
             <div className="flex flex-col border border-gray-100 bg-gray-50 rounded-lg px-2 shadow-sm">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{user?.points} pts</span>
             </div>
          </div>

          {/* Center Brand */}
          <div className="absolute left-[50%] translate-x-[-50%] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#111827]" strokeWidth={2.5} />
            <span
              className="text-xl leading-none text-[#111827] tracking-wider"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              QUINIELA
            </span>
          </div>

          {/* Right actions */}
          <button
             onClick={logout}
             className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-50 border border-gray-100 active:scale-95 text-gray-800"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Content area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'matches' && <MatchesScreen />}
        {activeTab === 'predictions' && <MyPredictionsScreen />}
        {activeTab === 'leaderboard' && <LeaderboardScreen />}
      </main>

      {/* Bottom nav — LiveScore Light style */}
      <nav
        className="shrink-0 pb-safe bg-white"
        style={{ borderTop: '1px solid #f3f4f6' }}
      >
        <div className="flex px-2">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center justify-center gap-1.5 py-4 relative transition-all duration-200"
                style={{ color: isActive ? '#e8003d' : '#9ca3af' }}
              >
                <Icon
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`w-[22px] h-[22px] transition-transform duration-200 ${isActive ? '-translate-y-1' : ''}`}
                />
                
                {isActive && (
                  <div
                    className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-[#e8003d]"
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
