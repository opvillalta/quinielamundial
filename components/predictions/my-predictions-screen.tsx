'use client'

import useSWR from 'swr'
import { getMyPredictions } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Target, CheckCircle2, Clock } from 'lucide-react'

export function MyPredictionsScreen() {
  const { token, user } = useAuth()

  const { data: predictions = [], isLoading } = useSWR(
    token ? ['my-predictions', token] : null,
    ([, t]) => getMyPredictions(t)
  )

  const totalPoints = predictions.reduce((acc, p) => acc + (p.points ?? 0), 0)
  const correctScores = predictions.filter(p => p.points !== undefined && p.points >= 5).length
  const pending = predictions.filter(p => p.points === undefined).length

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col gap-4 p-4 bg-slate-50">
        <div className="h-40 rounded-[2rem] bg-white animate-pulse border border-slate-100" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-[2rem] bg-white animate-pulse border border-slate-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-8 bg-slate-50">
      {/* Stats header */}
      <div className="mx-4 mt-6 bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] rounded-[2.5rem] p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#FF004C] to-[#C4003A] flex items-center justify-center shadow-[0_10px_20px_rgba(255,0,76,0.3)] ring-4 ring-red-50">
            <span className="text-white font-black text-2xl tracking-tighter">
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-black text-slate-900 text-2xl tracking-tight leading-none">{user?.name}</h2>
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                Mis Predicciones
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <StatBox value={totalPoints} label="PUNTOS" color="#FF004C" />
          <StatBox value={correctScores} label="EXACTOS" color="#10B981" />
          <StatBox value={pending} label="PENDIENTES" color="#64748B" />
        </div>
      </div>

      {/* Prediction list */}
      <div className="flex flex-col gap-4 px-4 mt-8">
        {predictions.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center">
              <Target className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-400 text-sm text-center font-bold uppercase tracking-widest leading-relaxed px-12">
              Aún no tienes predicciones
            </p>
          </div>
        )}

        {predictions.map(prediction => {
          const match = prediction.match
          if (!match) return null
          const matchDate = new Date(match.date)
          const isFinished = match.status === 'finished'
          
          const isCorrectScore =
            isFinished &&
            prediction.homeScore === match.homeScore &&
            prediction.awayScore === match.awayScore

          const predictedWinner =
            prediction.homeScore > prediction.awayScore ? 'home' : prediction.homeScore < prediction.awayScore ? 'away' : 'draw'
          const actualWinner =
            (match.homeScore ?? 0) > (match.awayScore ?? 0) ? 'home' : (match.homeScore ?? 0) < (match.awayScore ?? 0) ? 'away' : 'draw'
          const isCorrectResult = isFinished && predictedWinner === actualWinner

          return (
            <div
              key={prediction.id}
              className={`bg-white rounded-[2rem] overflow-hidden transition-all duration-300 border-2 ${
                isCorrectScore
                  ? 'border-green-500 shadow-[0_15px_30px_rgba(16,185,129,0.15)]'
                  : isCorrectResult
                  ? 'border-[#FF004C] shadow-[0_15px_30px_rgba(255,0,76,0.1)]'
                  : 'border-slate-100 shadow-[0_5px_15px_rgba(0,0,0,0.02)]'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {match.stage} · GRUPO {match.group}
                </span>
                {isFinished ? (
                  prediction.points !== undefined && (
                    <div className={`px-2.5 py-1 rounded-lg ${isCorrectScore ? 'bg-green-50' : 'bg-red-50'}`}>
                      <span className={`text-[10px] font-black ${isCorrectScore ? 'text-green-600' : 'text-[#FF004C]'}`}>
                        +{prediction.points} PTS
                      </span>
                    </div>
                  )
                ) : (
                  <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    {format(matchDate, "d MMM · HH:mm", { locale: es })}
                  </span>
                )}
              </div>

              {/* Teams & Scores */}
              <div className="flex items-center px-6 py-4 gap-4">
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center p-2 ring-1 ring-slate-100">
                    <img src={match.homeTeam.flag} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-black text-slate-900 tracking-widest">{match.homeTeam.code}</span>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 ring-4 ring-slate-50/50">
                    <span className="text-xl font-black text-slate-900">{prediction.homeScore}</span>
                    <span className="text-[10px] font-black text-slate-300">—</span>
                    <span className="text-xl font-black text-slate-900">{prediction.awayScore}</span>
                  </div>
                  {isFinished && (
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      REAL: {match.homeScore}-{match.awayScore}
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center p-2 ring-1 ring-slate-100">
                    <img src={match.awayTeam.flag} alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-black text-slate-900 tracking-widest">{match.awayTeam.code}</span>
                </div>
              </div>

              {/* First Goal Display */}
              <div className="mx-6 mb-5 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">1ER GOL:</span>
                  <span className="text-[10px] font-black text-slate-900 uppercase">{prediction.firstGoalScorer}</span>
                </div>
                {isFinished && match.firstGoalScorer && (
                  <div className="flex items-center gap-1.5">
                    {match.firstGoalScorer.toLowerCase() === prediction.firstGoalScorer.toLowerCase() ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Real: {match.firstGoalScorer}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-slate-50 rounded-[1.5rem] p-4 flex flex-col items-center justify-center gap-1 border border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 group">
      <span
        className="text-2xl font-black tracking-tighter leading-none"
        style={{ color }}
      >
        {value}
      </span>
      <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
        {label}
      </span>
    </div>
  )
}
