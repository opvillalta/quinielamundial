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
      <div className="flex-1 flex flex-col gap-4 p-4" style={{ background: '#f4f5f7' }}>
        <div className="h-28 rounded-2xl animate-pulse" style={{ background: '#e8eaed' }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: '#e8eaed' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4" style={{ background: '#f4f5f7' }}>
      {/* Stats header */}
      <div className="mx-4 mt-4 bg-white border border-gray-200 shadow-sm rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-[#e8003d] flex items-center justify-center shadow-[0_4px_12px_rgba(232,0,61,0.25)]">
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mis predicciones</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatBox value={totalPoints} label="Puntos" color="#e8003d" />
          <StatBox value={correctScores} label="Marcador exacto" color="#059669" />
          <StatBox value={pending} label="Pendientes" color="#6b7280" />
        </div>
      </div>

      {/* Prediction list */}
      <div className="flex flex-col gap-3 px-4 mt-4">
        {predictions.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20">
            <Target className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 text-sm text-center font-medium">
              Aun no tienes predicciones.{'\n'}Ve a Partidos para ingresar las tuyas.
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

          // Determine result correctness
          const predictedWinner =
            prediction.homeScore > prediction.awayScore
              ? 'home'
              : prediction.homeScore < prediction.awayScore
              ? 'away'
              : 'draw'
          const actualWinner =
            (match.homeScore ?? 0) > (match.awayScore ?? 0)
              ? 'home'
              : (match.homeScore ?? 0) < (match.awayScore ?? 0)
              ? 'away'
              : 'draw'
          const isCorrectResult = isFinished && predictedWinner === actualWinner

          return (
            <div
              key={prediction.id}
              className={`bg-white rounded-2xl overflow-hidden transition-all shadow-sm ${
                isCorrectScore
                  ? 'border-[1.5px] border-green-500 shadow-[0_4px_16px_rgba(34,197,94,0.1)]'
                  : isCorrectResult
                  ? 'border-[1.5px] border-[#e8003d] shadow-[0_4px_16px_rgba(232,0,61,0.1)]'
                  : 'border border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Grupo {match.group} · {match.stage}
                </span>
                <div className="flex items-center gap-1.5">
                  {isFinished ? (
                    prediction.points !== undefined ? (
                      <span className="text-xs font-bold text-[#e8003d]">+{prediction.points} pts</span>
                    ) : (
                      <span className="text-[10px] font-medium text-gray-400">Calculando...</span>
                    )
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      {format(matchDate, "d MMM · HH:mm", { locale: es })}
                    </span>
                  )}
                </div>
              </div>

              {/* Teams row */}
              <div className="flex items-center px-4 py-3 gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-2xl drop-shadow-sm">{match.homeTeam.flag}</span>
                  <span className="text-sm font-bold text-gray-800">{match.homeTeam.code}</span>
                </div>
                {/* Real score vs predicted */}
                <div className="flex flex-col items-center gap-0.5 min-w-[72px]">
                  {isFinished && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Real: <span className="text-gray-700">{match.homeScore}-{match.awayScore}</span>
                    </span>
                  )}
                  <div className="bg-gray-50 px-3 py-1 rounded-full border border-gray-100 flex items-center justify-center min-w-[64px]">
                    <span className={`text-[12px] font-bold ${isCorrectScore ? 'text-green-600' : isCorrectResult ? 'text-[#e8003d]' : 'text-gray-800'}`}>
                      {prediction.homeScore} - {prediction.awayScore}
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 justify-end">
                  <span className="text-sm font-bold text-gray-800">{match.awayTeam.code}</span>
                  <span className="text-2xl drop-shadow-sm">{match.awayTeam.flag}</span>
                </div>
              </div>

              {/* First goal scorer */}
              {prediction.firstGoalScorer && (
                 <div className="flex items-center justify-between px-4 pb-3">
                   <span className="text-[11px] font-medium text-gray-500">
                     Primer gol: <span className="text-gray-800 font-bold">{prediction.firstGoalScorer}</span>
                   </span>
                   {isFinished && match.firstGoalScorer && (
                     <div className="flex items-center gap-1">
                       {match.firstGoalScorer.toLowerCase() === prediction.firstGoalScorer.toLowerCase() ? (
                         <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                       ) : (
                         <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                           Real: {match.firstGoalScorer}
                         </span>
                       )}
                     </div>
                   )}
                 </div>
              )}

              {/* Result badge */}
              {isFinished && (
                <div className={`px-4 py-2 border-t flex items-center justify-center gap-1.5 ${
                  isCorrectScore
                    ? 'bg-green-50/80 border-green-100'
                    : isCorrectResult
                    ? 'bg-red-50/80 border-red-100'
                    : 'bg-gray-50/50 border-gray-100'
                }`}>
                  {isCorrectScore ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">Completamente Acertado</span>
                    </>
                  ) : isCorrectResult ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#e8003d]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#e8003d]">Resultado Acertado</span>
                    </>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Sin Puntos</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm">
      <span
        className="leading-none text-2xl"
        style={{ color, fontFamily: 'var(--font-display)' }}
      >
        {value}
      </span>
      <span className="text-[9px] font-bold text-gray-500 text-center uppercase tracking-wide leading-tight">
        {label}
      </span>
    </div>
  )
}
