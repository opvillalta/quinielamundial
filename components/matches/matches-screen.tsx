'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Radio, Lock, CheckCircle2, ChevronRight } from 'lucide-react'
import { getMatches, getMyPredictions } from '@/lib/api'
import type { Match, Prediction } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { PredictionModal } from './prediction-modal'

const STAGES = ['Todos', 'Próximos', 'En vivo', 'Finalizados']

export function MatchesScreen() {
  const { token } = useAuth()
  const [activeStage, setActiveStage] = useState('Todos')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [localPredictions, setLocalPredictions] = useState<Record<string, Prediction>>({})

  const { data: matches = [], isLoading: matchesLoading } = useSWR(
    token ? ['matches', token] : null,
    ([, t]) => getMatches(t)
  )

  const { data: myPredictions = [] } = useSWR(
    token ? ['predictions', token] : null,
    ([, t]) => getMyPredictions(t)
  )

  const predictionMap = useMemo(() => {
    const map: Record<string, Prediction> = {}
    for (const p of myPredictions) map[p.matchId] = p
    return { ...map, ...localPredictions }
  }, [myPredictions, localPredictions])

  const filtered = useMemo(() => {
    if (activeStage === 'Todos') return matches
    if (activeStage === 'Próximos') return matches.filter(m => m.status === 'upcoming')
    if (activeStage === 'En vivo') return matches.filter(m => m.status === 'live')
    if (activeStage === 'Finalizados') return matches.filter(m => m.status === 'finished')
    return matches
  }, [matches, activeStage])

  const liveMatches = useMemo(() => matches.filter(m => m.status === 'live'), [matches])

  function handleSaved(prediction: Prediction) {
    setLocalPredictions(prev => ({ ...prev, [prediction.matchId]: prediction }))
  }

  if (matchesLoading) {
    return (
      <div className="flex-1 flex flex-col gap-3 p-4" style={{ background: '#f4f5f7' }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-[68px] rounded-2xl animate-pulse"
            style={{ background: '#e8eaed' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]"
    >
      {/* Filter pills */}
      <div className="flex gap-3 px-4 pt-6 pb-4 overflow-x-auto scrollbar-hide">
        {STAGES.map(s => (
          <button
            key={s}
            onClick={() => setActiveStage(s)}
            className="shrink-0 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95"
            style={
              activeStage === s
                ? {
                    background: 'linear-gradient(135deg, #FF004C 0%, #C2003A 100%)',
                    color: '#fff',
                    boxShadow: '0 8px 20px rgba(232, 0, 61, 0.3)',
                    transform: 'translateY(-1px)',
                  }
                : {
                    background: '#fff',
                    color: '#64748B',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }
            }
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-20">

        {/* === LIVE MATCH FEATURED CARD === */}
        {(activeStage === 'Todos' || activeStage === 'En vivo') && liveMatches.length > 0 && (
          <div className="px-4 mb-8">
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-2 h-2 rounded-full bg-[#FF004C] animate-pulse" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0F172A]">
                Partidos en vivo
              </p>
            </div>
            <div
              className="rounded-[2.5rem] p-6 relative overflow-hidden group transition-all duration-500 hover:scale-[1.01]"
              style={{
                background: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.5)',
              }}
            >
              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              
              {/* Dynamic glow orb */}
              <div
                className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full pointer-events-none opacity-20 blur-3xl animate-pulse"
                style={{ background: 'radial-gradient(circle, #FF004C 0%, transparent 70%)' }}
              />

              <div className="text-center mb-6">
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white/60 text-[10px] font-bold uppercase tracking-widest">
                  {liveMatches[0].stage}
                  {liveMatches[0].group ? ` · Grupo ${liveMatches[0].group}` : ''}
                </span>
              </div>

              <div className="flex items-center justify-between px-2 relative z-10">
                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 backdrop-blur-md p-3 shadow-inner ring-1 ring-white/10 group-hover:rotate-[-5deg] transition-transform duration-500">
                    <img src={liveMatches[0].homeTeam.flag} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-white font-black text-xs text-center leading-tight uppercase tracking-wide">
                    {liveMatches[0].homeTeam.name}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2 px-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-black text-white tabular-nums tracking-tighter">
                      {liveMatches[0].homeScore ?? 0}
                    </span>
                    <span className="text-white/20 text-3xl font-light">:</span>
                    <span className="text-5xl font-black text-white tabular-nums tracking-tighter">
                      {liveMatches[0].awayScore ?? 0}
                    </span>
                  </div>
                  <div className="bg-[#FF004C] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,0,76,0.5)]">
                    <Radio className="w-2.5 h-2.5 text-white animate-pulse" />
                    <span className="text-white text-[9px] font-black tracking-[0.2em]">LIVE</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 flex-1">
                  <div className="w-16 h-16 rounded-3xl bg-white/5 backdrop-blur-md p-3 shadow-inner ring-1 ring-white/10 group-hover:rotate-[5deg] transition-transform duration-500">
                    <img src={liveMatches[0].awayTeam.flag} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-white font-black text-xs text-center leading-tight uppercase tracking-wide">
                    {liveMatches[0].awayTeam.name}
                  </span>
                </div>
              </div>

              {predictionMap[liveMatches[0].id] && (
                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Tu Predicción</p>
                      <p className="text-white font-black text-xs">
                        {predictionMap[liveMatches[0].id].homeScore} - {predictionMap[liveMatches[0].id].awayScore}
                      </p>
                    </div>
                  </div>
                  {predictionMap[liveMatches[0].id].points !== undefined && (
                    <div className="bg-yellow-400/20 px-3 py-1.5 rounded-xl">
                      <span className="text-yellow-400 font-black text-xs">+{predictionMap[liveMatches[0].id].points} PTS</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* === MATCH LIST === */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">
              {activeStage === 'Todos' ? 'Próximos Encuentros' : activeStage}
            </p>
            {filtered.length > 0 && (
              <span className="text-[10px] font-bold text-[#94A3B8]">
                {filtered.length} partidos
              </span>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-400">No hay partidos disponibles</p>
              </div>
            )}

            {filtered.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={predictionMap[match.id]}
                onPredict={() => setSelectedMatch(match)}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedMatch && (
        <PredictionModal
          match={selectedMatch}
          existing={predictionMap[selectedMatch.id]}
          onClose={() => setSelectedMatch(null)}
          onSaved={p => { handleSaved(p) }}
        />
      )}
    </div>
  )
}

function MatchCard({ match, prediction, onPredict }: {
  match: Match
  prediction?: Prediction
  onPredict: () => void
}) {
  const isLocked = match.status !== 'upcoming'
  const matchDate = new Date(match.date)
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'

  return (
    <button
      onClick={!isLocked ? onPredict : undefined}
      className="w-full text-left group"
      style={{ cursor: isLocked ? 'default' : 'pointer' }}
    >
      <div
        className="rounded-[2rem] px-5 py-5 transition-all duration-300 active:scale-[0.98] relative overflow-hidden"
        style={{
          background: '#ffffff',
          boxShadow: isLive
            ? '0 20px 40px -10px rgba(34, 197, 94, 0.15)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.02)',
          border: isLive ? '2px solid #22C55E' : '1px solid #F1F5F9',
        }}
      >
        <div className="flex items-center gap-4 relative z-10">

          {/* Home team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center p-2 ring-1 ring-slate-100 group-hover:scale-110 transition-transform duration-300">
              <img src={match.homeTeam.flag} alt="" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-[10px] text-slate-800 uppercase tracking-wider text-center line-clamp-1">
              {match.homeTeam.name}
            </span>
          </div>

          {/* Center — Status */}
          <div className="flex flex-col items-center shrink-0 min-w-[80px]">
            {isLive ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-black text-slate-900 tabular-nums">
                  {match.homeScore ?? 0} - {match.awayScore ?? 0}
                </span>
                <div className="bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-600 text-[8px] font-black tracking-widest uppercase">Live</span>
                </div>
              </div>
            ) : isFinished ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl font-black text-slate-900 tabular-nums">
                  {match.homeScore ?? 0} - {match.awayScore ?? 0}
                </span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Final</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-black text-[#FF004C] tabular-nums leading-none">
                  {format(matchDate, 'HH:mm')}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {format(matchDate, 'd MMM', { locale: es })}
                </span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center p-2 ring-1 ring-slate-100 group-hover:scale-110 transition-transform duration-300">
              <img src={match.awayTeam.flag} alt="" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-[10px] text-slate-800 uppercase tracking-wider text-center line-clamp-1">
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        {/* Prediction strip */}
        {prediction ? (
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                Tu pred: <span className="text-slate-900 font-black">{prediction.homeScore} - {prediction.awayScore}</span>
              </p>
            </div>
            {prediction.points !== undefined && (
              <span className="text-[10px] font-black text-[#FF004C] bg-red-50 px-2 py-1 rounded-lg">
                +{prediction.points} PTS
              </span>
            )}
          </div>
        ) : !isLocked ? (
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center group-hover:gap-3 transition-all duration-300">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF004C]">
              Hacer Predicción
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#FF004C] group-hover:translate-x-1 transition-transform" />
          </div>
        ) : isLocked && !prediction ? (
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
            <Lock className="w-3 h-3 text-slate-300" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Cerrado</span>
          </div>
        ) : null}
      </div>
    </button>
  )
}
