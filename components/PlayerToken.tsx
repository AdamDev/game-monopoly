'use client'

import type { GamePlayer } from '@/types/game'

const PLAYER_GRADIENTS: Record<string, string> = {
  red: 'from-red-400 to-red-600',
  blue: 'from-blue-400 to-blue-600',
  green: 'from-green-400 to-green-600',
  yellow: 'from-yellow-300 to-yellow-500',
  purple: 'from-purple-400 to-purple-600',
  orange: 'from-orange-400 to-orange-600',
}

const PLAYER_RING: Record<string, string> = {
  red: 'ring-red-300',
  blue: 'ring-blue-300',
  green: 'ring-green-300',
  yellow: 'ring-yellow-200',
  purple: 'ring-purple-300',
  orange: 'ring-orange-300',
}

interface PlayerTokenProps {
  player: GamePlayer
  isCurrentTurn: boolean
  isMe: boolean
  /** percent x within board (0-100) */
  x: number
  /** percent y within board (0-100) */
  y: number
  /** stable bobbing offset to differentiate stacked tokens */
  stackIndex: number
}

export default function PlayerToken({ player, isCurrentTurn, isMe, x, y, stackIndex }: PlayerTokenProps) {
  const gradient = PLAYER_GRADIENTS[player.color] || 'from-zinc-400 to-zinc-600'
  const ring = PLAYER_RING[player.color] || 'ring-zinc-300'
  const initial = player.name?.charAt(0).toUpperCase() || '?'

  // Tiny offset within a cell so multiple tokens on same space don't perfectly overlap
  const angle = (stackIndex * 70) * (Math.PI / 180)
  const radius = stackIndex === 0 ? 0 : 1.6 // % of board
  const dx = Math.cos(angle) * radius
  const dy = Math.sin(angle) * radius

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x + dx}%`,
        top: `${y + dy}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'left 600ms cubic-bezier(0.34, 1.56, 0.64, 1), top 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: isCurrentTurn ? 30 : 20,
      }}
    >
      <div
        className={`
          relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden
          ring-2 ${ring} ring-offset-1 ring-offset-mono-bg
          shadow-[0_4px_8px_rgba(0,0,0,0.5)]
          ${isCurrentTurn ? 'animate-bounce-soft scale-110' : ''}
          ${player.isBankrupt ? 'opacity-30 grayscale' : ''}
        `}
        title={`${player.name}${isMe ? ' (אני)' : ''}`}
      >
        {player.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.avatarUrl}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm`}>
            {initial}
          </div>
        )}
      </div>
      {isCurrentTurn && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
      )}
    </div>
  )
}
