'use client'

import type { GamePlayer, PlayerColor } from '@/types/game'

const TOKEN_BY_COLOR: Record<PlayerColor, string> = {
  red: '🎩',
  blue: '🚗',
  green: '🐕',
  yellow: '👢',
  purple: '🚢',
  orange: '🪡',
}

const PLAYER_HEX: Record<string, string> = {
  red: '#cc2936',
  blue: '#1d6bbf',
  green: '#2e8b57',
  yellow: '#c9a84c',
  purple: '#9b59b6',
  orange: '#e67e22',
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
  const token = TOKEN_BY_COLOR[player.color] || '🎩'
  const colorHex = PLAYER_HEX[player.color] || '#888'

  // Stagger tokens in a 3-column micro-grid (matches design)
  const dx = (stackIndex % 3 - 1) * 1.4
  const dy = (Math.floor(stackIndex / 3)) * 1.4

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
        className={`relative flex items-center justify-center rounded-full ${isCurrentTurn ? 'animate-bounce-soft' : ''} ${player.isBankrupt ? 'opacity-30 grayscale' : ''}`}
        style={{
          width: '22px',
          height: '22px',
          background: colorHex,
          border: '2px solid #fff',
          boxShadow: isCurrentTurn
            ? `0 0 0 2px ${colorHex}66, 0 2px 8px rgba(0,0,0,0.5)`
            : '0 2px 8px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
        title={`${player.name}${isMe ? ' (אני)' : ''}`}
      >
        {player.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.avatarUrl}
            alt={player.name}
            className="absolute inset-0 w-full h-full object-cover rounded-full"
          />
        ) : (
          <span className="text-[0.7rem] leading-none select-none">{token}</span>
        )}
      </div>
    </div>
  )
}
