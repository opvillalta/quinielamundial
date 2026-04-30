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
    <div className="flex flex-col items-center gap-4 w-full">
      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
        {label}
      </span>
      <div className="flex items-center justify-between w-full max-w-[140px] gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 transition-all active:scale-90 bg-white border border-slate-100 shadow-sm"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span
          className="flex-1 text-center tabular-nums font-black text-slate-900 leading-none"
          style={{ fontSize: '2.5rem' }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-all bg-[#FF004C] shadow-lg shadow-red-500/20"
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
  const [selectedGoleadorId, setSelectedGoleadorId] = useState<string>(existing?.firstGoalScorerId ?? existing?.firstGoalScorer ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    
    if (!selectedGoleadorId) {
      alert('Por favor selecciona qué equipo meterá el primer gol')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await savePrediction(token, {
        matchId: match.id,
        homeScore,
        awayScore,
        firstGoalScorer: selectedGoleadorId,
      })
      onSaved(result)
      setSaved(true)
      setTimeout(onClose, 1500)
    } catch (error) {
      console.error('Error saving prediction:', error)
      alert('Error al guardar la predicción. Reintenta por favor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const matchDate = new Date(match.date)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-md transition-all duration-500"
      style={{ background: 'rgba(15, 23, 42, 0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] flex flex-col animate-in slide-in-from-bottom-10 duration-500 overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
      >
        <div className="p-8 pb-10 flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <span className="bg-red-50 text-[#FF004C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] self-start">
                {match.stage}{match.group ? ` · Grupo ${match.group}` : ''}
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Hacer Predicción
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                {format(matchDate, "d 'de' MMMM · HH:mm", { locale: es })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-90 bg-white border border-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {saved ? (
            <div className="flex flex-col items-center gap-6 py-12 animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(34,197,94,0.3)] bg-green-500">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div className="text-center">
                <p className="text-slate-900 text-2xl font-black uppercase tracking-tighter">¡LISTO!</p>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Predicción guardada</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col gap-8">
              {/* Score Input Picker */}
              <div className="flex items-center justify-between bg-slate-50 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                <ScoreInput value={homeScore} onChange={setHomeScore} label="LOCAL" />
                <div className="w-px h-16 bg-slate-200 mx-4 shrink-0" />
                <ScoreInput value={awayScore} onChange={setAwayScore} label="VISITANTE" />
              </div>

              {/* First Goal Scorer - Team Selector */}
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-1">
                  ¿Quién mete el primer gol?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[match.homeTeam, match.awayTeam].map((team) => {
                    const isSelected = selectedGoleadorId === team.id;
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => setSelectedGoleadorId(team.id)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                          isSelected 
                            ? 'border-[#FF004C] bg-red-50/50 shadow-md translate-y-[-2px]' 
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className="w-8 h-8 shrink-0">
                          <img src={team.flag} alt="" className="w-full h-full object-contain" />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-wide truncate ${isSelected ? 'text-[#FF004C]' : 'text-slate-600'}`}>
                          {team.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Points Legend */}
              <div className="flex gap-2">
                {[
                  { pts: '+3', label: 'Resultado' },
                  { pts: '+5', label: 'Exacto' },
                  { pts: '+2', label: 'Goleador' }
                ].map((item, i) => (
                  <div key={i} className="flex-1 bg-slate-50/50 border border-slate-100 rounded-2xl py-3 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-sm font-black text-[#FF004C]">{item.pts}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-20 rounded-[2rem] bg-[#0F172A] text-white font-black text-lg tracking-[0.1em] shadow-[0_20px_40px_rgba(15,23,42,0.3)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group overflow-hidden relative"
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span className="uppercase">Guardar Predicción</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
