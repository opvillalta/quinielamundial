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
      className="flex-1 flex flex-col overflow-hidden"
      style={{ background: '#f4f5f7' }}
    >
      {/* Filter pills */}
      <div className="flex gap-2 px-4 pt-4 pb-3 overflow-x-auto scrollbar-hide">
        {STAGES.map(s => (
          <button
            key={s}
            onClick={() => setActiveStage(s)}
            className="shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200"
            style={
              activeStage === s
                ? {
                    background: 'linear-gradient(135deg, #e8003d, #c4003a)',
                    color: '#fff',
                    boxShadow: '0 4px 14px rgba(232,0,61,0.35)',
                  }
                : {
                    background: '#fff',
                    color: '#9ca3af',
                    border: '1.5px solid #e5e7eb',
                  }
            }
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-4">

        {/* === LIVE MATCH FEATURED CARD === */}
        {(activeStage === 'Todos' || activeStage === 'En vivo') && liveMatches.length > 0 && (
          <div className="px-4 mb-4">
            <p className="text-sm font-bold text-gray-800 mb-2 px-1">
              En Vivo
            </p>
            <div
              className="rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, #1a1040 0%, #2d1060 50%, #3b1580 100%)',
                boxShadow: '0 8px 32px rgba(45,16,96,0.4)',
              }}
            >
              {/* Subtle glow orb */}
              <div
                className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }}
              />

              {/* Stage label */}
              <div className="text-center mb-3">
                <span className="text-white text-xs font-semibold opacity-80">
                  {liveMatches[0].stage}
                  {liveMatches[0].group ? ` · Grupo ${liveMatches[0].group}` : ''}
                </span>
              </div>

              {/* Teams + score */}
              <div className="flex items-center justify-between px-2">
                {/* Home */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-4xl">{liveMatches[0].homeTeam.flag}</span>
                  <span className="text-white font-bold text-sm text-center leading-tight">
                    {liveMatches[0].homeTeam.name}
                  </span>
                  <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Local</span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center gap-1 px-4">
                  <span
                    className="tabular-nums text-white"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '3rem',
                      lineHeight: 1,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {liveMatches[0].homeScore ?? 0} : {liveMatches[0].awayScore ?? 0}
                  </span>
                  {/* Live badge */}
                  <div
                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <Radio className="w-2.5 h-2.5 text-green-400 animate-pulse" />
                    <span className="text-green-400 text-[10px] font-bold tracking-widest">EN VIVO</span>
                  </div>
                </div>

                {/* Away */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-4xl">{liveMatches[0].awayTeam.flag}</span>
                  <span className="text-white font-bold text-sm text-center leading-tight">
                    {liveMatches[0].awayTeam.name}
                  </span>
                  <span className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">Visitante</span>
                </div>
              </div>

              {/* Prediction strip */}
              {predictionMap[liveMatches[0].id] ? (
                <div
                  className="mt-4 rounded-xl px-4 py-2 flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.10)' }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-white/70 text-xs">
                      Tu pred: <span className="text-white font-bold">{predictionMap[liveMatches[0].id].homeScore} - {predictionMap[liveMatches[0].id].awayScore}</span>
                    </span>
                  </div>
                  {predictionMap[liveMatches[0].id].points !== undefined && (
                    <span className="text-yellow-400 font-bold text-xs">+{predictionMap[liveMatches[0].id].points} pts</span>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* === MATCH LIST === */}
        <div className="px-4">
          {filtered.length > 0 && (activeStage !== 'En vivo' || filtered.length > liveMatches.length) && (
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-sm font-bold text-gray-800">
                {activeStage === 'Todos' ? 'Partidos' : activeStage}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {filtered.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-gray-400">No hay partidos en esta categoría</p>
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
      className="w-full text-left"
      style={{ cursor: isLocked ? 'default' : 'pointer' }}
    >
      <div
        className="rounded-2xl px-4 py-3.5 transition-all duration-150 active:scale-[0.99]"
        style={{
          background: '#ffffff',
          boxShadow: isLive
            ? '0 4px 20px rgba(100,220,100,0.12), 0 1px 3px rgba(0,0,0,0.06)'
            : '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
          border: isLive ? '1.5px solid rgba(100,220,100,0.30)' : '1.5px solid transparent',
        }}
      >
        {/* Main row — Team | Time/Date | Team */}
        <div className="flex items-center gap-2">

          {/* Home team */}
          <div className="flex-1 flex items-center gap-2.5">
            <span className="text-2xl leading-none">{match.homeTeam.flag}</span>
            <span className="font-semibold text-sm text-gray-800 leading-tight truncate">
              {match.homeTeam.name}
            </span>
          </div>

          {/* Center — time & date */}
          <div className="flex flex-col items-center shrink-0 min-w-[72px]">
            {isLive ? (
              <div className="flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-green-500 animate-pulse" />
                <span
                  className="font-bold text-green-500 tracking-wider"
                  style={{ fontSize: '0.8rem' }}
                >
                  EN VIVO
                </span>
              </div>
            ) : isFinished ? (
              <div className="flex flex-col items-center gap-0.5">
                <span
                  className="font-bold tabular-nums"
                  style={{ fontSize: '1.15rem', color: '#374151', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}
                >
                  {match.homeScore ?? 0} - {match.awayScore ?? 0}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Final</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-0">
                <span
                  className="font-bold tabular-nums leading-tight"
                  style={{ fontSize: '1.05rem', color: '#e8003d' }}
                >
                  {format(matchDate, 'HH:mm')}
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: '#9ca3af' }}
                >
                  {format(matchDate, 'd MMM', { locale: es })}
                </span>
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="flex-1 flex items-center gap-2.5 justify-end">
            <span className="font-semibold text-sm text-gray-800 leading-tight text-right truncate">
              {match.awayTeam.name}
            </span>
            <span className="text-2xl leading-none">{match.awayTeam.flag}</span>
          </div>
        </div>

        {/* Prediction row */}
        {prediction ? (
          <div
            className="mt-2.5 pt-2.5 flex items-center justify-between"
            style={{ borderTop: '1px solid #f3f4f6' }}
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-gray-500">
                Tu pred: <span className="text-gray-800 font-bold">{prediction.homeScore} - {prediction.awayScore}</span>
                {prediction.firstGoalScorer && (
                  <span className="text-gray-400"> · {prediction.firstGoalScorer}</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {prediction.points !== undefined && (
                <span className="text-xs font-bold" style={{ color: '#e8003d' }}>+{prediction.points} pts</span>
              )}
              {!isLocked && (
                <span className="text-xs font-bold" style={{ color: '#e8003d' }}>Editar</span>
              )}
            </div>
          </div>
        ) : !isLocked ? (
          <div
            className="mt-2.5 pt-2.5 flex items-center justify-between"
            style={{ borderTop: '1px solid #f3f4f6' }}
          >
            <span className="text-xs font-semibold" style={{ color: '#e8003d' }}>
              Ingresar predicción
            </span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: '#e8003d' }} />
          </div>
        ) : isLocked && !prediction ? (
          <div
            className="mt-2.5 pt-2.5 flex items-center gap-1.5"
            style={{ borderTop: '1px solid #f3f4f6' }}
          >
            <Lock className="w-3 h-3 text-gray-300" />
            <span className="text-xs text-gray-400">Sin predicción</span>
          </div>
        ) : null}
      </div>
    </button>
  )
}
