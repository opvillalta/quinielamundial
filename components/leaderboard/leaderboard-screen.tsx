'use client'

import useSWR from 'swr'
import { getLeaderboard } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Trophy, Target } from 'lucide-react'

export function LeaderboardScreen() {
  const { token, user } = useAuth()

  const { data: entries = [], isLoading } = useSWR(
    token ? ['leaderboard', token] : null,
    ([, t]) => getLeaderboard(t)
  )

  const myEntry = entries.find(e => e.user.id === user?.id)
  const top3 = entries.slice(0, 3)

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col gap-3 p-4" style={{ background: '#f4f5f7' }}>
        <div className="h-44 rounded-xl animate-pulse" style={{ background: '#e8eaed' }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: '#e8eaed' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-6 scrollbar-hide" style={{ background: '#f4f5f7' }}>

      {/* Podium — top 3 */}
      {top3.length === 3 && (
        <div
          className="mx-4 mt-4 rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            border: '1px solid #f3f4f6',
          }}
        >
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-5 text-center" style={{ color: '#9ca3af' }}>
              PODIO
            </p>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              <PodiumColumn entry={top3[1]} position={2} height="h-20" userId={user?.id} />
              {/* 1st */}
              <PodiumColumn entry={top3[0]} position={1} height="h-28" userId={user?.id} />
              {/* 3rd */}
              <PodiumColumn entry={top3[2]} position={3} height="h-14" userId={user?.id} />
            </div>
          </div>
        </div>
      )}

      {/* My position banner */}
      {myEntry && (
        <div
          className="mx-4 mt-4 rounded-2xl p-4 flex items-center gap-3 relative overflow-hidden"
          style={{
            background: '#ffffff',
            boxShadow: '0 4px 16px rgba(232,0,61,0.08)',
            border: '1.5px solid rgba(232,0,61,0.3)',
          }}
        >
          {/* Red left border accent */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1.5"
            style={{ background: '#e8003d' }}
          />

          <div className="pl-1.5 flex items-center gap-3 flex-1">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold"
              style={{
                background: '#e8003d',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
              }}
            >
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>

            <div className="flex-1">
              <p className="font-bold text-sm text-gray-800">Tu posición</p>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                <span className="text-green-600 font-bold">{myEntry.correctScores}</span> exactos ·{' '}
                <span className="text-gray-700 font-bold">{myEntry.correctResults}</span> correctos
              </p>
            </div>

            <div className="flex flex-col items-end">
              <span
                className="font-bold leading-none"
                style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: '#e8003d', lineHeight: 1 }}
              >
                #{myEntry.rank}
              </span>
              <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{myEntry.points} pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Full ranking */}
      <div className="mx-4 mt-4 flex flex-col gap-2">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.22em] px-1 mb-1"
          style={{ color: '#9ca3af' }}
        >
          Clasificación general
        </p>
        
        {entries.map(entry => {
          const isMe = entry.user.id === user?.id
          const isFirst = entry.rank === 1
          const isSecond = entry.rank === 2
          const isThird = entry.rank === 3

          const leftAccentColor = isFirst
            ? '#e8003d'
            : isSecond
            ? '#9ca3af'
            : isThird
            ? '#d97706'
            : isMe
            ? '#2563eb'
            : 'transparent'

          return (
            <div
              key={entry.user.id}
              className="flex items-center gap-3 p-3 rounded-2xl relative overflow-hidden transition-all"
              style={{
                background: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                border: isMe ? '1.5px solid rgba(37,99,235,0.3)' : '1px solid transparent',
              }}
            >
              {/* Left color bar for top 3 */}
              {(isFirst || isSecond || isThird) && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: leftAccentColor }}
                />
              )}

              {/* Rank */}
              <div className="w-8 flex items-center justify-center shrink-0 pl-1">
                {isFirst ? (
                  <Trophy className="w-4 h-4 text-[#e8003d]" />
                ) : (
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem',
                      color: isSecond ? '#9ca3af' : isThird ? '#d97706' : '#6b7280',
                    }}
                  >
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                style={
                  isMe
                    ? { background: '#2563eb', color: '#fff' }
                    : { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }
                }
              >
                {entry.user.name[0].toUpperCase()}
              </div>

              {/* Name & stats */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold text-sm truncate"
                  style={{ color: isMe ? '#2563eb' : '#374151' }}
                >
                  {entry.user.name}{isMe ? ' (Tú)' : ''}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-gray-500 font-medium">
                    <span className="text-green-600 font-bold">{entry.correctScores}</span> exactos
                  </span>
                  <span className="text-[10px] text-gray-300">·</span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    <span className="text-gray-700 font-bold">{entry.correctResults}</span> correctos
                  </span>
                </div>
              </div>

              {/* Points */}
              <div className="flex items-baseline gap-1 shrink-0">
                <span
                  className="font-bold"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.4rem',
                    color: isMe ? '#2563eb' : '#111827',
                  }}
                >
                  {entry.points}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">pts</span>
              </div>
            </div>
          )
        })}

        {entries.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20">
            <Target className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 text-sm text-center font-medium">
              La tabla estará disponible cuando haya predicciones.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function PodiumColumn({ entry, position, height, userId }: {
  entry: { rank: number; user: { id: string; name: string }; points: number }
  position: 1 | 2 | 3
  height: string
  userId?: string
}) {
  const isMe = entry.user.id === userId

  const podiumBg =
    position === 1
      ? 'linear-gradient(180deg, #e8003d 0%, #a1002a 100%)'
      : position === 2
      ? 'linear-gradient(180deg, #e5e7eb 0%, #9ca3af 100%)'
      : 'linear-gradient(180deg, #fef3c7 0%, #d97706 100%)'

  const textColor = position === 1 ? '#fff' : '#111827'
  const medalEmoji = position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xl leading-none">{medalEmoji}</span>

      <div
        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
        style={{
          background: isMe ? '#2563eb' : '#f3f4f6', 
          color: isMe ? '#fff' : '#374151',
          border: isMe ? 'none' : '1px solid #e5e7eb',
        }}
      >
        {entry.user.name[0].toUpperCase()}
      </div>

      <p className="text-[10px] text-gray-700 font-bold text-center max-w-[60px] truncate">
        {entry.user.name.split(' ')[0]}
      </p>

      <div
        className={`${height} w-14 rounded-t-xl flex flex-col items-center justify-end pb-2`}
        style={{ background: podiumBg }}
      >
        <span
          className="font-bold leading-none"
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: textColor }}
        >
          {entry.points}
        </span>
        <span className="text-[9px] font-bold tracking-wider uppercase mt-1" style={{ color: textColor, opacity: 0.8 }}>pts</span>
      </div>
    </div>
  )
}
