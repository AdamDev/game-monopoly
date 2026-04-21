'use client'

import type { GamePlayer, PlayerColor } from '@/types/game'

// Classic Monopoly tokens — one per player color
const TOKENS: Record<PlayerColor, { icon: string; label: string }> = {
  red: { icon: '🎩', label: 'מגבעת' },
  blue: { icon: '🚗', label: 'מכונית' },
  green: { icon: '🐕', label: 'כלב' },
  yellow: { icon: '👢', label: 'מגף' },
  purple: { icon: '🚢', label: 'אונייה' },
  orange: { icon: '🪡', label: 'אצבעון' },
}

const PLAYER_RING: Record<string, string> = {
  red: 'ring-red-500',
  blue: 'ring-blue-500',
  green: 'ring-green-500',
  yellow: 'ring-yellow-400',
  purple: 'ring-purple-500',
  orange: 'ring-orange-500',
}

interface PlayerTokenProps {
  player: GamePlayer
  isCurrentTurn: boolean
  isMe: boolean
  x: number
  y: number
  stackIndex: number
}

export default function PlayerToken({ player, isCurrentTurn, isMe, x, y, stackIndex }: PlayerTokenProps) {
  const token = TOKENS[player.color] || TOKENS.red
  const ring = PLAYER_RING[player.color] || 'ring-zinc-400'

  // Stagger tokens sharing a cell (offset in a small circle)
  const angle = (stackIndex * 60) * (Math.PI / 180)
  const radius = stackIndex === 0 ? 0 : 1.6
  const dx = Math.cos(angle) * radius
  const dy = Math.sin(angle) * radius

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${x + dx}%`,
        top: `${y + dy}%`,
        transform: 'translate(-50%, -50%)',
        transition: 'left 700ms cubic-bezier(0.34, 1.56, 0.64, 1), top 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: isCurrentTurn ? 30 : 20,
      }}
    >
      <div
        className={`
          relative flex items-center justify-center
          w-8 h-8 sm:w-9 sm:h-9 rounded-full
          bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-600
          ring-2 ${ring} ring-offset-1 ring-offset-[var(--color-board-felt)]
          shadow-[0_3px_6px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.7)]
          ${isCurrentTurn ? 'animate-bounce-soft scale-110' : ''}
          ${player.isBankrupt ? 'opacity-30 grayscale' : ''}
        `}
        title={`${player.name} — ${token.label}${isMe ? ' (אני)' : ''}`}
      >
        {player.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.avatarUrl}
            alt={player.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <span
            className="text-lg sm:text-xl leading-none select-none"
            style={{
              filter: 'grayscale(0.6) contrast(1.1) drop-shadow(0 1px 1px rgba(0,0,0,0.4))',
            }}
          >
            {token.icon}
          </span>
        )}
      </div>

      {isCurrentTurn && (
        <>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)] animate-pulse" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
            {player.name}
          </div>
        </>
      )}
    </div>
  )
}
