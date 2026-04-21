'use client'

import type { GamePlayer } from '@/types/game'

const PLAYER_DOT_COLORS: Record<string, string> = {
  red: 'bg-player-red',
  blue: 'bg-player-blue',
  green: 'bg-player-green',
  yellow: 'bg-player-yellow',
  purple: 'bg-player-purple',
  orange: 'bg-player-orange',
}

interface PlayersBarProps {
  players: GamePlayer[]
  currentPlayerIndex: number
  myPlayerId: string
}

export default function PlayersBar({ players, currentPlayerIndex, myPlayerId }: PlayersBarProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {players.map((player, i) => {
        const isCurrentTurn = i === currentPlayerIndex
        const isMe = player.playerId === myPlayerId

        return (
          <div
            key={player.playerId}
            className={`
              flex items-center gap-2 rounded-xl px-3 py-2 text-sm
              ${isCurrentTurn ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-mono-card border border-mono-border'}
              ${player.isBankrupt ? 'opacity-40' : ''}
              ${!player.connected ? 'opacity-60' : ''}
            `}
          >
            <div className={`w-3 h-3 rounded-full ${PLAYER_DOT_COLORS[player.color] || 'bg-zinc-500'}`} />
            <span className={`font-medium ${isCurrentTurn ? 'text-emerald-400' : 'text-white'}`}>
              {player.name}
              {isMe && ' (אני)'}
            </span>
            <span className="text-zinc-400 font-mono text-xs" dir="ltr">${player.money}</span>
            {player.isInJail && <span className="text-xs">🔒</span>}
            {!player.connected && <span className="text-xs text-zinc-500">לא מחובר</span>}
            {player.isBankrupt && <span className="text-xs text-red-400">פשט רגל</span>}
          </div>
        )
      })}
    </div>
  )
}
