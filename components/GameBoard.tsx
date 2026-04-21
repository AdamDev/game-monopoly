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

  const playersByPosition = new Map<number, GamePlayer[]>()
  players.filter(p => !p.isBankrupt).forEach(p => {
    const arr = playersByPosition.get(p.position) || []
    arr.push(p)
    playersByPosition.set(p.position, arr)
  })

  return (
    <div className="aspect-square w-full max-w-[min(90vh,90vw)] mx-auto" dir="ltr">
      <div className="relative w-full h-full rounded-lg p-2 bg-[var(--color-board-felt)] shadow-[0_20px_50px_rgba(0,0,0,0.45)] ring-2 ring-black/80">
        <div className="relative grid grid-cols-11 grid-rows-11 w-full h-full gap-0 border-2 border-black rounded-sm overflow-hidden bg-[var(--color-board-felt)]">
          {/* Corners */}
          <div style={{ gridColumn: 1, gridRow: 1 }}>
            <BoardSpace index={20} properties={properties} players={players} side="corner" />
          </div>
          <div style={{ gridColumn: 11, gridRow: 1 }}>
            <BoardSpace index={30} properties={properties} players={players} side="corner" />
          </div>
          <div style={{ gridColumn: 1, gridRow: 11 }}>
            <BoardSpace index={10} properties={properties} players={players} side="corner" />
          </div>
          <div style={{ gridColumn: 11, gridRow: 11 }}>
            <BoardSpace index={0} properties={properties} players={players} side="corner" />
          </div>

          {/* Top row: 21-29 */}
          {[21, 22, 23, 24, 25, 26, 27, 28, 29].map((idx, i) => (
            <div key={idx} style={{ gridColumn: i + 2, gridRow: 1 }}>
              <BoardSpace index={idx} properties={properties} players={players} side="top" />
            </div>
          ))}

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

          {/* Bottom row: 9-1 */}
          {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((idx, i) => (
            <div key={idx} style={{ gridColumn: i + 2, gridRow: 11 }}>
              <BoardSpace index={idx} properties={properties} players={players} side="bottom" />
            </div>
          ))}

          {/* Center area */}
          <div
            className="relative flex flex-col items-center justify-center bg-[var(--color-board-felt)] overflow-hidden"
            style={{ gridColumn: '2 / 11', gridRow: '2 / 11' }}
            dir="rtl"
          >
            {/* Community Chest diamond (top-left) */}
            <div className="absolute top-[6%] left-[8%] w-[26%] aspect-square flex items-center justify-center transform rotate-45 bg-[var(--color-chest-blue)]/80 border-2 border-dashed border-white/60 rounded-md shadow">
              <div className="-rotate-45 flex flex-col items-center gap-1 text-white">
                <span className="text-2xl sm:text-3xl">💰</span>
                <span className="text-[8px] sm:text-[10px] font-bold text-center leading-tight" style={{ fontFamily: 'var(--font-heebo)' }}>
                  קופת<br />קהילה
                </span>
              </div>
            </div>

            {/* Chance diamond (bottom-right) */}
            <div className="absolute bottom-[6%] right-[8%] w-[26%] aspect-square flex items-center justify-center transform rotate-45 bg-[var(--color-chance-orange)]/90 border-2 border-dashed border-white/60 rounded-md shadow">
              <div className="-rotate-45 flex flex-col items-center gap-1 text-white">
                <span className="text-3xl sm:text-4xl font-black leading-none">?</span>
                <span className="text-[8px] sm:text-[10px] font-bold" style={{ fontFamily: 'var(--font-heebo)' }}>
                  הזדמנות
                </span>
              </div>
            </div>

            {/* Diagonal MONOPOLY banner */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="bg-[var(--color-monopoly-red)] px-6 sm:px-10 py-2 sm:py-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)] border-2 border-white/30"
                style={{
                  transform: 'rotate(-45deg)',
                  width: '78%',
                  textAlign: 'center',
                }}
              >
                <div className="text-white text-2xl sm:text-4xl md:text-5xl font-black tracking-[0.1em] leading-none" style={{ fontFamily: 'var(--font-bebas)' }}>
                  MONOPOLY
                </div>
                <div className="text-white/90 text-[8px] sm:text-[10px] font-semibold mt-0.5">
                  משחק הנדל״ן הקלאסי
                </div>
              </div>
            </div>

            {/* Action panel slot — above the banner */}
            <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
              <div className="bg-[var(--color-board-cell)]/95 backdrop-blur-sm border-2 border-black/70 rounded-lg px-3 py-2 shadow-lg max-w-[65%]">
                {children}
              </div>
            </div>
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
