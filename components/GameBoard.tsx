'use client'

import BoardSpace from './BoardSpace'
import PlayerToken from './PlayerToken'
import type { GameProperty, GamePlayer } from '@/types/game'

interface GameBoardProps {
  properties: GameProperty[]
  players: GamePlayer[]
  currentPlayerIndex: number
  myPlayerId: string
}

// GO at top-right (col:11, row:1). Then top row right→left, left col top→bottom,
// bottom row left→right, right col bottom→top.
function getSpaceCell(position: number): { col: number; row: number } {
  if (position === 0) return { col: 11, row: 1 }
  if (position >= 1 && position <= 9) return { col: 11 - position, row: 1 }
  if (position === 10) return { col: 1, row: 1 }
  if (position >= 11 && position <= 19) return { col: 1, row: position - 9 }
  if (position === 20) return { col: 1, row: 11 }
  if (position >= 21 && position <= 29) return { col: position - 19, row: 11 }
  if (position === 30) return { col: 11, row: 11 }
  if (position >= 31 && position <= 39) return { col: 11, row: 41 - position }
  return { col: 11, row: 1 }
}

function cellToPercent(cell: { col: number; row: number }): { x: number; y: number } {
  return {
    x: ((cell.col - 0.5) / 11) * 100,
    y: ((cell.row - 0.5) / 11) * 100,
  }
}

export default function GameBoard({
  properties,
  players,
  currentPlayerIndex,
  myPlayerId,
}: GameBoardProps) {
  const currentPlayer = players[currentPlayerIndex]

  const playersByPosition = new Map<number, GamePlayer[]>()
  players.filter(p => !p.isBankrupt).forEach(p => {
    const arr = playersByPosition.get(p.position) || []
    arr.push(p)
    playersByPosition.set(p.position, arr)
  })

  return (
    <div
      className="relative aspect-square"
      style={{ width: 'min(78vh, 78vw, 720px)' }}
      dir="ltr"
    >
      <div
        className="relative w-full h-full grid grid-cols-11 grid-rows-11 gap-0"
        style={{
          background: 'var(--color-board-cell)',
          border: '2px solid var(--color-board-line)',
          boxShadow: '0 0 0 5px rgba(201,168,76,0.3), 0 40px 120px rgba(0,0,0,0.8)',
        }}
      >
        {/* Center logo */}
        <div
          className="flex flex-col items-center justify-center"
          style={{
            gridColumn: '2 / 11',
            gridRow: '2 / 11',
            background: 'var(--color-board-cell)',
            border: '1px solid rgba(42,42,42,0.15)',
          }}
        >
          <div className="text-[clamp(1.5rem,2.8vw,2.8rem)] mb-1.5">🎩</div>
          <div
            className="leading-none"
            style={{
              fontFamily: 'var(--font-bebas), sans-serif',
              fontSize: 'clamp(2rem,4.5vw,4rem)',
              letterSpacing: '0.08em',
              color: 'var(--color-mono-red)',
            }}
          >
            MONOPOLY
          </div>
          <div
            className="font-bold uppercase mt-1"
            style={{
              fontSize: 'clamp(0.45rem,0.9vw,0.7rem)',
              letterSpacing: '0.3em',
              color: 'var(--color-board-line)',
            }}
          >
            שחק · בנה · שלוט
          </div>
        </div>

        {/* Corners */}
        <div style={{ gridColumn: 11, gridRow: 1 }}>
          <BoardSpace index={0} properties={properties} players={players} side="corner" />
        </div>
        <div style={{ gridColumn: 1, gridRow: 1 }}>
          <BoardSpace index={10} properties={properties} players={players} side="corner" />
        </div>
        <div style={{ gridColumn: 1, gridRow: 11 }}>
          <BoardSpace index={20} properties={properties} players={players} side="corner" />
        </div>
        <div style={{ gridColumn: 11, gridRow: 11 }}>
          <BoardSpace index={30} properties={properties} players={players} side="corner" />
        </div>

        {/* Top row (row:1): 1..9, going right→left in cols 10..2 */}
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
          <div key={idx} style={{ gridColumn: 11 - idx, gridRow: 1 }}>
            <BoardSpace index={idx} properties={properties} players={players} side="top" />
          </div>
        ))}

        {/* Left col (col:1): 11..19, top→bottom in rows 2..10 */}
        {[11, 12, 13, 14, 15, 16, 17, 18, 19].map((idx) => (
          <div key={idx} style={{ gridColumn: 1, gridRow: idx - 9 }}>
            <BoardSpace index={idx} properties={properties} players={players} side="left" />
          </div>
        ))}

        {/* Bottom row (row:11): 21..29, left→right in cols 2..10 */}
        {[21, 22, 23, 24, 25, 26, 27, 28, 29].map((idx) => (
          <div key={idx} style={{ gridColumn: idx - 19, gridRow: 11 }}>
            <BoardSpace index={idx} properties={properties} players={players} side="bottom" />
          </div>
        ))}

        {/* Right col (col:11): 31..39, bottom→top in rows 10..2 */}
        {[31, 32, 33, 34, 35, 36, 37, 38, 39].map((idx) => (
          <div key={idx} style={{ gridColumn: 11, gridRow: 41 - idx }}>
            <BoardSpace index={idx} properties={properties} players={players} side="right" />
          </div>
        ))}

        {/* Animated player tokens overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {players.filter(p => !p.isBankrupt).map(player => {
            const cell = getSpaceCell(player.position)
            const { x, y } = cellToPercent(cell)
            const stackArr = playersByPosition.get(player.position) || []
            const stackIndex = stackArr.findIndex(p => p.playerId === player.playerId)
            return (
              <PlayerToken
                key={player.playerId}
                player={player}
                isCurrentTurn={currentPlayer?.playerId === player.playerId}
                isMe={player.playerId === myPlayerId}
                x={x}
                y={y}
                stackIndex={stackIndex}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
