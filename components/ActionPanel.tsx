'use client'

import { BOARD, BUYABLE_POSITIONS } from '@/lib/board-data'
import type { GameState } from '@/types/game'

interface ActionPanelProps {
  game: GameState
  myPlayerId: string
  onRollDice: () => void
  onBuyProperty: () => void
  onDeclineProperty: () => void
  onEndTurn: () => void
  rolling: boolean
}

export default function ActionPanel({
  game,
  myPlayerId,
  onRollDice,
  onBuyProperty,
  onDeclineProperty,
  onEndTurn,
  rolling,
}: ActionPanelProps) {
  const currentPlayer = game.players[game.currentPlayerIndex]
  const isMyTurn = currentPlayer?.playerId === myPlayerId

  if (!isMyTurn) {
    return (
      <div className="text-center text-zinc-400 text-sm">
        ממתינים ש-<span className="text-white font-medium">{currentPlayer?.name}</span> ישחק...
      </div>
    )
  }

  const space = BOARD[currentPlayer.position]
  const canBuy =
    game.turnPhase === 'action' &&
    BUYABLE_POSITIONS.includes(currentPlayer.position) &&
    !game.properties.find(
      p => p.boardPosition === currentPlayer.position && p.ownerPlayerId
    ) &&
    currentPlayer.money >= (space?.price || Infinity)

  const isUnownedProperty =
    game.turnPhase === 'action' &&
    BUYABLE_POSITIONS.includes(currentPlayer.position) &&
    !game.properties.find(
      p => p.boardPosition === currentPlayer.position && p.ownerPlayerId
    )

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-emerald-400 font-medium">התור שלך!</p>

      {game.turnPhase === 'roll' && (
        <button
          onClick={onRollDice}
          disabled={rolling}
          className="rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          {rolling ? 'מטיל...' : currentPlayer.isInJail ? 'הטל לכפולות' : 'הטל קוביות'}
        </button>
      )}

      {game.turnPhase === 'action' && isUnownedProperty && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-zinc-300">
            <span className="font-medium text-white">{space?.name}</span> — <span dir="ltr">${space?.price}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={onBuyProperty}
              disabled={!canBuy}
              className="rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            >
              קנה ב-<span dir="ltr">${space?.price}</span>
            </button>
            <button
              onClick={onDeclineProperty}
              className="rounded-xl bg-zinc-700 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-zinc-600"
            >
              דלג
            </button>
          </div>
        </div>
      )}

      {game.turnPhase === 'end-turn' && (
        <button
          onClick={onEndTurn}
          className="rounded-xl bg-zinc-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-zinc-600"
        >
          סיים תור
        </button>
      )}
    </div>
  )
}
