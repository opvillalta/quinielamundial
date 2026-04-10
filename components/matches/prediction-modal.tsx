'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Minus, Plus, Loader2, CheckCircle2 } from 'lucide-react'
import type { Match, Prediction } from '@/lib/api'
import { savePrediction } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const schema = z.object({
  firstGoalScorer: z.string().min(2, 'Ingresa el nombre del goleador'),
})

type FormData = z.infer<typeof schema>

interface PredictionModalProps {
  match: Match
  existing?: Prediction
  onClose: () => void
  onSaved: (prediction: Prediction) => void
}

function ScoreInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500"
      >
        {label}
      </span>
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 active:scale-90 transition-transform bg-gray-50 border border-gray-200 shadow-sm"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span
          className="w-14 text-center tabular-nums leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '4rem',
            color: '#111827',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform bg-[#e8003d] shadow-md shadow-red-500/20"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}

export function PredictionModal({ match, existing, onClose, onSaved }: PredictionModalProps) {
  const { token } = useAuth()
  const [homeScore, setHomeScore] = useState(existing?.homeScore ?? 0)
  const [awayScore, setAwayScore] = useState(existing?.awayScore ?? 0)
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { firstGoalScorer: existing?.firstGoalScorer ?? '' },
  })

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function onSubmit(data: FormData) {
    if (!token) return
    const result = await savePrediction(token, {
      matchId: match.id,
      homeScore,
      awayScore,
      firstGoalScorer: data.firstGoalScorer,
    })
    onSaved(result)
    setSaved(true)
    setTimeout(onClose, 1200)
  }

  const matchDate = new Date(match.date)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full rounded-t-3xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 overflow-hidden bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.15)]"
      >
        <div className="p-6 pb-10 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col">
                 <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8003d]">
                   {match.stage}{match.group ? ` · Grupo ${match.group}` : ''}
                 </p>
                 <p className="text-sm font-semibold text-gray-800">
                    Predecir Resultado
                 </p>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                {format(matchDate, "d 'de' MMMM · HH:mm", { locale: es })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 transition-all hover:bg-gray-100 active:scale-90 bg-gray-50 border border-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Teams row */}
          <div
            className="flex items-center justify-around rounded-2xl px-4 py-5 shadow-sm border border-gray-100 bg-[#f9fafb]"
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl shadow-sm rounded-sm overflow-hidden">{match.homeTeam.flag}</span>
              <span
                className="font-bold text-gray-900 tracking-wider"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}
              >
                {match.homeTeam.code}
              </span>
            </div>

            {/* VS divider */}
            <div className="flex flex-col items-center gap-1">
              <span
                className="font-bold text-gray-400"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', letterSpacing: '0.15em' }}
              >
                VS
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl shadow-sm rounded-sm overflow-hidden">{match.awayTeam.flag}</span>
              <span
                className="font-bold text-gray-900 tracking-wider"
                style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}
              >
                {match.awayTeam.code}
              </span>
            </div>
          </div>

          {saved ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.3)] bg-green-50">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <p
                className="text-gray-900 text-2xl tracking-wide uppercase"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                ¡PREDICCIÓN GUARDADA!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              {/* Score picker */}
              <div
                className="flex items-center justify-around rounded-2xl px-4 py-6 shadow-none border border-gray-100 bg-white"
              >
                <ScoreInput value={homeScore} onChange={setHomeScore} label={match.homeTeam.code} />

                {/* Center divider */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-px h-16 bg-gray-200" />
                </div>

                <ScoreInput value={awayScore} onChange={setAwayScore} label={match.awayTeam.code} />
              </div>

              {/* First goal scorer */}
              <div className="flex flex-col gap-1.5 px-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
                  Primer goleador
                </label>
                <input
                  {...register('firstGoalScorer')}
                  type="text"
                  placeholder="Nombre del jugador (ej. Messi)"
                  className="rounded-xl px-4 py-3.5 text-gray-900 text-sm font-medium placeholder:text-gray-400 placeholder:font-normal focus:outline-none transition shadow-sm bg-gray-50 border border-gray-200 focus:border-[#e8003d] focus:ring-2 focus:ring-red-500/20"
                />
                {errors.firstGoalScorer && (
                  <p className="text-xs font-semibold text-red-500 mt-1">
                    {errors.firstGoalScorer.message}
                  </p>
                )}
              </div>

              {/* Points guide — 3 columns */}
              <div
                className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50/50 shadow-sm mt-2"
              >
                <div className="flex-1 flex flex-col items-center gap-1 py-3 group">
                  <span
                    className="font-bold leading-none text-[#e8003d]"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}
                  >
                    +3
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-gray-500 text-center">Resultado</span>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="flex-1 flex flex-col items-center gap-1 py-3">
                  <span
                    className="font-bold leading-none text-[#e8003d]"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}
                  >
                    +5
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-gray-500 text-center">Clavado</span>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="flex-1 flex flex-col items-center gap-1 py-3">
                  <span
                    className="font-bold leading-none text-[#2563eb]"
                    style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}
                  >
                    +2
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-gray-500 text-center">1er gol</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 font-bold text-sm tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform uppercase shadow-[0_6px_20px_rgba(232,0,61,0.3)] bg-[linear-gradient(135deg,#e8003d,#c4003a)] text-white"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem',
                  letterSpacing: '0.12em',
                }}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                GUARDAR PREDICCIÓN
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
