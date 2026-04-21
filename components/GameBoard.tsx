'use client'

import BoardSpace from './BoardSpace'
import PlayerToken from './PlayerToken'
import type { GameProperty, GamePlayer } from '@/types/game'

interface GameBoardProps {
  properties: GameProperty[]
  players: GamePlayer[]
  currentPlayerIndex: number
  myPlayerId: string
  children?: React.ReactNode
}

/** Returns 1-indexed (col, row) within the 11x11 board grid for a board position. */
function getSpaceCell(position: number): { col: number; row: number } {
  if (position === 0) return { col: 11, row: 11 }
  if (position >= 1 && position <= 9) return { col: 11 - position, row: 11 }
  if (position === 10) return { col: 1, row: 11 }
  if (position >= 11 && position <= 19) return { col: 1, row: 21 - position }
  if (position === 20) return { col: 1, row: 1 }
  if (position >= 21 && position <= 29) return { col: position - 19, row: 1 }
  if (position === 30) return { col: 11, row: 1 }
  if (position >= 31 && position <= 39) return { col: 11, row: position - 29 }
  return { col: 11, row: 11 }
}

/** Convert grid cell (1..11) to percent center within board. */
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
  children,
}: GameBoardProps) {
  const currentPlayer = players[currentPlayerIndex]

  // Group players by board position so we can stagger stacked tokens
  const playersByPosition = new Map<number, GamePlayer[]>()
  players.filter(p => !p.isBankrupt).forEach(p => {
    const arr = playersByPosition.get(p.position) || []
    arr.push(p)
    playersByPosition.set(p.position, arr)
  })

  return (
    <div className="aspect-square w-full max-w-[min(90vh,90vw)] mx-auto" dir="ltr">
      <div className="relative w-full h-full rounded-2xl p-2 bg-gradient-to-br from-emerald-950/40 via-mono-bg to-cyan-950/40 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(16,185,129,0.15)]">
        <div className="relative grid grid-cols-11 grid-rows-11 w-full h-full gap-0 border border-emerald-500/20 rounded-xl overflow-hidden bg-mono-bg">
          {/* Top-left corner: Free Parking (20) */}
          <div style={{ gridColumn: 1, gridRow: 1 }}>
            <BoardSpace index={20} properties={properties} players={players} side="corner" />
          </div>

          {/* Top row: 21-29 */}
          {[21, 22, 23, 24, 25, 26, 27, 28, 29].map((idx, i) => (
            <div key={idx} style={{ gridColumn: i + 2, gridRow: 1 }}>
              <BoardSpace index={idx} properties={properties} players={players} side="top" />
            </div>
          ))}

          {/* Top-right corner: Go To Jail (30) */}
          <div style={{ gridColumn: 11, gridRow: 1 }}>
            <BoardSpace index={30} properties={properties} players={players} side="corner" />
          </div>

          {/* Left column: 19-11 */}
          {[19, 18, 17, 16, 15, 14, 13, 12, 11].map((idx, i) => (
            <div key={idx} style={{ gridColumn: 1, gridRow: i + 2 }}>
              <BoardSpace index={idx} properties={properties} players={players} side="left" />
            </div>
          ))}

          {/* Right column: 31-39 */}
          {[31, 32, 33, 34, 35, 36, 37, 38, 39].map((idx, i) => (
            <div key={idx} style={{ gridColumn: 11, gridRow: i + 2 }}>
              <BoardSpace index={idx} properties={properties} players={players} side="right" />
            </div>
          ))}

          {/* Bottom-left corner: Jail (10) */}
          <div style={{ gridColumn: 1, gridRow: 11 }}>
            <BoardSpace index={10} properties={properties} players={players} side="corner" />
          </div>

          {/* Bottom row: 9-1 */}
          {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((idx, i) => (
            <div key={idx} style={{ gridColumn: i + 2, gridRow: 11 }}>
              <BoardSpace index={idx} properties={properties} players={players} side="bottom" />
            </div>
          ))}

          {/* Bottom-right corner: GO (0) */}
          <div style={{ gridColumn: 11, gridRow: 11 }}>
            <BoardSpace index={0} properties={properties} players={players} side="corner" />
          </div>

          {/* Center area */}
          <div
            className="flex flex-col items-center justify-center p-2 bg-gradient-to-br from-emerald-900/20 via-transparent to-cyan-900/20"
            style={{ gridColumn: '2 / 11', gridRow: '2 / 11' }}
            dir="rtl"
          >
            {children}
          </div>

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
    </div>
  )
}
