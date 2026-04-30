'use client'

import { useState } from 'react'
import { LayoutGrid, CheckCircle2, BarChart3, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { MatchesScreen } from './matches/matches-screen'
import { MyPredictionsScreen } from './predictions/my-predictions-screen'
import { LeaderboardScreen } from './leaderboard/leaderboard-screen'

type Tab = 'matches' | 'predictions' | 'leaderboard'

export function AppShell() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('matches')

  return (
    <div className="flex flex-col h-[100dvh] bg-white overflow-hidden">
      {/* HEADER PREMIUM */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 h-24 shrink-0 pt-8 sm:pt-0">
        <div className="h-full px-6 flex items-center justify-between relative">

          {/* User Profile Info */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg group-active:scale-95 transition-transform">
                <span className="text-white font-black text-sm tracking-tighter">
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#FF004C] border-2 border-white rounded-lg px-1.5 py-0.5 shadow-sm">
                <span className="text-[7px] font-black text-white leading-none">
                  {user?.points ?? 0}
                </span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mi Cuenta</span>
              <span className="text-xs font-black text-slate-900">{user?.name}</span>
            </div>
          </div>

          {/* Center Brand / Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5">
            <div className="w-9 h-9  flex items-center justify-center shadow-inner">
              <img src="/logoWC.svg" alt="Logo Quiniela" className="w-10 h-10" />
            </div>
            <span
              className="text-lg font-black text-slate-900 tracking-[0.15em] uppercase"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Quiniela
            </span>
          </div>

          {/* Right Action (Logout) */}
          <button
            onClick={logout}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90"
          >
            <LogOut className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {activeTab === 'matches' && <MatchesScreen />}
        {activeTab === 'predictions' && <MyPredictionsScreen />}
        {activeTab === 'leaderboard' && <LeaderboardScreen />}
      </main>

      {/* BOTTOM NAVIGATION PREMIUM */}
      <nav className="bg-white border-t border-slate-100 px-8 h-24 shrink-0 pb-safe">
        <div className="h-full flex items-center justify-between max-w-md mx-auto">
          <NavItem
            icon={<LayoutGrid className="w-6 h-6" />}
            label="PARTIDOS"
            active={activeTab === 'matches'}
            onClick={() => setActiveTab('matches')}
          />
          <NavItem
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="MIS PICKS"
            active={activeTab === 'predictions'}
            onClick={() => setActiveTab('predictions')}
          />
          <NavItem
            icon={<BarChart3 className="w-6 h-6" />}
            label="RANKING"
            active={activeTab === 'leaderboard'}
            onClick={() => setActiveTab('leaderboard')}
          />
        </div>
      </nav>
    </div>
  )
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? 'text-[#FF004C] scale-110' : 'text-slate-300 hover:text-slate-500'
        }`}
    >
      <div className={`p-1 transition-all ${active ? 'drop-shadow-[0_0_8px_rgba(255,0,76,0.3)]' : ''}`}>
        {icon}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all ${active ? 'opacity-100' : 'opacity-0'}`}>
        {label}
      </span>
      {active && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#FF004C] animate-pulse" />
      )}
    </button>
  )
}
