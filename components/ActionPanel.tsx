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

const goldGradientBtn: React.CSSProperties = {
  padding: '10px',
  fontFamily: 'var(--font-heebo), sans-serif',
  fontSize: '0.88rem',
  fontWeight: 800,
  background: 'linear-gradient(135deg, var(--color-gold-d), var(--color-gold-l), var(--color-gold-d))',
  color: 'var(--color-navy)',
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 16px rgba(201,168,76,0.3)',
  width: '100%',
  transition: 'transform .15s, box-shadow .15s',
}

const ghostBtn: React.CSSProperties = {
  padding: '8px 13px',
  fontFamily: 'var(--font-heebo), sans-serif',
  fontSize: '0.78rem',
  fontWeight: 700,
  border: '1px solid rgba(201,168,76,0.25)',
  background: 'rgba(201,168,76,0.06)',
  color: 'var(--color-gold)',
  cursor: 'pointer',
  textAlign: 'center',
  width: '100%',
  transition: 'all .15s',
}

const dangerBtn: React.CSSProperties = {
  ...ghostBtn,
  borderColor: 'rgba(204,41,54,0.3)',
  background: 'rgba(204,41,54,0.05)',
  color: '#e04050',
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
      <div className="text-center text-xs w-full" style={{ color: 'var(--color-muted)' }}>
        ממתינים ש-<span style={{ color: 'var(--color-cream)', fontWeight: 600 }}>{currentPlayer?.name}</span> ישחק...
      </div>
    )
  }

  const space = BOARD[currentPlayer.position]
  const isUnownedProperty =
    game.turnPhase === 'action' &&
    BUYABLE_POSITIONS.includes(currentPlayer.position) &&
    !game.properties.find(
      p => p.boardPosition === currentPlayer.position && p.ownerPlayerId
    )
  const canAfford = currentPlayer.money >= (space?.price || Infinity)

  return (
    <div className="flex flex-col items-stretch gap-2 w-full">
      {game.turnPhase === 'roll' && (
        <button
          onClick={onRollDice}
          disabled={rolling}
          style={{ ...goldGradientBtn, opacity: rolling ? 0.5 : 1 }}
        >
          🎲 &nbsp;{rolling ? 'מטיל...' : currentPlayer.isInJail ? 'הטל לכפולות' : 'הטל קוביות'}
        </button>
      )}

      {game.turnPhase === 'action' && isUnownedProperty && (
        <>
          <div
            className="text-center text-[0.78rem] mb-1"
            style={{ color: 'var(--color-cream)' }}
          >
            <div className="font-bold" style={{ color: 'var(--color-gold-l)' }}>
              {space?.name}
            </div>
            <div className="text-[0.7rem]" style={{ color: 'var(--color-muted)' }} dir="ltr">
              ₪{space?.price}
            </div>
          </div>
          <button
            onClick={onBuyProperty}
            disabled={!canAfford}
            style={{ ...goldGradientBtn, opacity: canAfford ? 1 : 0.4, cursor: canAfford ? 'pointer' : 'not-allowed' }}
          >
            רכוש ₪{space?.price}
          </button>
          <button onClick={onDeclineProperty} style={ghostBtn}>
            דלג
          </button>
        </>
      )}

      {game.turnPhase === 'end-turn' && (
        <button onClick={onEndTurn} style={goldGradientBtn}>
          סיים תור ▶
        </button>
      )}

      {/* Bankruptcy fallback (always available on your turn) */}
      {game.turnPhase !== 'roll' && (
        <button
          onClick={() => {
            if (window.confirm('בטוח? פשיטת רגל תסיר אותך מהמשחק!')) {
              // Note: bankruptcy not yet wired to a socket event; placeholder
            }
          }}
          style={dangerBtn}
        >
          ☠️ פשיטת רגל
        </button>
      )}
    </div>
  )
}
