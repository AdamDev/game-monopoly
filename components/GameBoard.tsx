'use client'

import BoardSpace from './BoardSpace'
import type { GameProperty, GamePlayer } from '@/types/game'

interface GameBoardProps {
  properties: GameProperty[]
  players: GamePlayer[]
  children?: React.ReactNode // Center content
}

/**
 * Classic Monopoly board — 11x11 CSS grid.
 * Spaces run clockwise: bottom row (right→left), left col (bottom→top),
 * top row (left→right), right col (top→bottom).
 */
export default function GameBoard({ properties, players, children }: GameBoardProps) {
  return (
    <div className="aspect-square w-full max-w-[min(90vh,90vw)] mx-auto">
      <div className="grid grid-cols-11 grid-rows-11 w-full h-full gap-0 border border-mono-border rounded-lg overflow-hidden bg-mono-bg">
        {/* Top-left corner: Free Parking (20) */}
        <div className="col-start-1 row-start-1">
          <BoardSpace index={20} properties={properties} players={players} side="corner" />
        </div>

        {/* Top row: 21-29 (left to right) */}
        {[21, 22, 23, 24, 25, 26, 27, 28, 29].map((idx, i) => (
          <div key={idx} className={`col-start-${i + 2} row-start-1`} style={{ gridColumn: i + 2, gridRow: 1 }}>
            <BoardSpace index={idx} properties={properties} players={players} side="top" />
          </div>
        ))}

        {/* Top-right corner: Go To Jail (30) */}
        <div className="col-start-11 row-start-1">
          <BoardSpace index={30} properties={properties} players={players} side="corner" />
        </div>

        {/* Left column: 19-11 (top to bottom) */}
        {[19, 18, 17, 16, 15, 14, 13, 12, 11].map((idx, i) => (
          <div key={idx} style={{ gridColumn: 1, gridRow: i + 2 }}>
            <BoardSpace index={idx} properties={properties} players={players} side="left" />
          </div>
        ))}

        {/* Right column: 31-39 (top to bottom) */}
        {[31, 32, 33, 34, 35, 36, 37, 38, 39].map((idx, i) => (
          <div key={idx} style={{ gridColumn: 11, gridRow: i + 2 }}>
            <BoardSpace index={idx} properties={properties} players={players} side="right" />
          </div>
        ))}

        {/* Bottom-left corner: Jail (10) */}
        <div style={{ gridColumn: 1, gridRow: 11 }}>
          <BoardSpace index={10} properties={properties} players={players} side="corner" />
        </div>

        {/* Bottom row: 9-1 (right to left, so display left to right as 9,8,7...1) */}
        {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((idx, i) => (
          <div key={idx} style={{ gridColumn: i + 2, gridRow: 11 }}>
            <BoardSpace index={idx} properties={properties} players={players} side="bottom" />
          </div>
        ))}

        {/* Bottom-right corner: GO (0) */}
        <div style={{ gridColumn: 11, gridRow: 11 }}>
          <BoardSpace index={0} properties={properties} players={players} side="corner" />
        </div>

        {/* Center area: game info */}
        <div
          className="flex flex-col items-center justify-center p-2"
          style={{ gridColumn: '2 / 11', gridRow: '2 / 11' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
