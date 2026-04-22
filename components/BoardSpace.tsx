'use client'

import { BOARD } from '@/lib/board-data'
import type { GameProperty, GamePlayer, PropertyColor } from '@/types/game'

const COLOR_HEX: Record<PropertyColor, string> = {
  'brown': '#8b1a1a',
  'light-blue': '#4fc3f7',
  'pink': '#f48fb1',
  'orange': '#ff8c00',
  'red': '#cc0000',
  'yellow': '#ffd700',
  'green': '#00aa00',
  'dark-blue': '#1a2f8a',
}

const PLAYER_DOT_HEX: Record<string, string> = {
  red: '#cc2936',
  blue: '#1d6bbf',
  green: '#2e8b57',
  yellow: '#c9a84c',
  purple: '#9b59b6',
  orange: '#e67e22',
}

const HEBREW_NAMES: Record<number, string> = {
  0: 'עבור',
  1: 'ים תיכוני',
  2: 'קופה ציבורית',
  3: 'בלטיק',
  4: 'מס הכנסה',
  5: 'רכבת קלה',
  6: 'מזרחי',
  7: 'הזדמנות',
  8: 'ורמונט',
  9: 'קונטיקט',
  10: 'כלא / ביקור',
  11: "סנט צ'רלס",
  12: 'חברת חשמל',
  13: 'מדינות',
  14: "וירג'יניה",
  15: 'רכבת מרכז',
  16: "ג'יימס",
  17: 'קופה ציבורית',
  18: 'טנסי',
  19: 'ניו יורק',
  20: 'חניה חינם',
  21: 'קנטקי',
  22: 'הזדמנות',
  23: 'אינדיאנה',
  24: 'אילינוי',
  25: 'B&O רכבת',
  26: 'אטלנטיק',
  27: 'ונטנור',
  28: 'חברת מים',
  29: 'מרווין',
  30: 'לכלא!',
  31: 'פסיפיק',
  32: 'קרוליינה',
  33: 'קופה ציבורית',
  34: 'פנסילבניה',
  35: 'קו קצר',
  36: 'הזדמנות',
  37: 'פארק פלייס',
  38: 'מס יוקרה',
  39: 'בורדוואלק',
}

const TYPE_BG: Record<string, string> = {
  tax: '#ece8d8',
  'community-chest': '#eef5e8',
  chance: '#fdf5e0',
  railroad: '#e8e8e8',
  utility: '#f0eae8',
}

const TYPE_ICON: Record<number, string> = {
  2: '📦', 17: '📦', 33: '📦',  // chests
  7: '❓', 22: '❓', 36: '❓',   // chances
  4: '💸', 38: '💰',              // taxes
  5: '🚂', 15: '🚃', 25: '🚄', 35: '🚞', // railroads
  12: '💡', 28: '💧',             // utilities
}

const CORNER_DATA: Record<number, { icon: string; lines: string[] }> = {
  0: { icon: '🚦', lines: ['עבור', 'GO'] },
  10: { icon: '🏛️', lines: ['כלא', 'ביקור'] },
  20: { icon: '🅿️', lines: ['חניה', 'חינם'] },
  30: { icon: '👮', lines: ['לכלא!'] },
}

interface BoardSpaceProps {
  index: number
  properties: GameProperty[]
  players: GamePlayer[]
  side: 'bottom' | 'left' | 'top' | 'right' | 'corner'
}

export default function BoardSpace({ index, properties, players, side }: BoardSpaceProps) {
  const space = BOARD[index]
  const prop = properties.find(p => p.boardPosition === index)
  const owner = prop?.ownerPlayerId
    ? players.find(p => p.playerId === prop.ownerPlayerId)
    : null

  const isCorner = side === 'corner'
  const displayName = HEBREW_NAMES[index] || space.name

  if (isCorner) {
    const c = CORNER_DATA[index]
    return (
      <div
        className="relative w-full h-full flex flex-col items-center justify-center gap-0.5"
        style={{
          background: '#e8e0cc',
          border: '1px solid var(--color-board-line)',
        }}
      >
        <div className="text-[clamp(1.1rem,2.2vw,1.8rem)] leading-none">{c.icon}</div>
        <div
          className="font-extrabold text-center leading-tight whitespace-pre-line"
          style={{
            fontSize: 'clamp(0.38rem, 0.78vw, 0.6rem)',
            color: 'var(--color-board-line)',
            letterSpacing: '0.03em',
          }}
        >
          {c.lines.join('\n')}
        </div>
      </div>
    )
  }

  // Strip orientation per design:
  // top row    → strip at top of cell
  // bottom row → strip at bottom of cell (no text rotation)
  // left col   → strip on left side
  // right col  → strip on right side
  const stripStyle: React.CSSProperties = (() => {
    if (side === 'top') return { width: '100%', height: '22%', borderBottom: '1px solid var(--color-board-line)', order: 0 }
    if (side === 'bottom') return { width: '100%', height: '22%', borderTop: '1px solid var(--color-board-line)', order: 2 }
    if (side === 'left') return {
      position: 'absolute', top: 0, left: 0,
      width: '22%', height: '100%',
      borderRight: '1px solid var(--color-board-line)',
    }
    return {
      position: 'absolute', top: 0, right: 0,
      width: '22%', height: '100%',
      borderLeft: '1px solid var(--color-board-line)',
    }
  })()

  const innerPad: React.CSSProperties =
    side === 'left' ? { paddingLeft: '26%' } :
    side === 'right' ? { paddingRight: '26%' } :
    {}

  const textRotation =
    side === 'left' ? 'rotate-90' :
    side === 'right' ? '-rotate-90' :
    ''

  const typeBg = TYPE_BG[space.type] || 'var(--color-board-cell)'
  const cellIcon = TYPE_ICON[index]

  return (
    <div
      className="relative flex flex-col cursor-pointer overflow-hidden hover:brightness-90 transition-[filter] duration-150"
      style={{
        border: '1px solid var(--color-board-line)',
        background: typeBg,
      }}
    >
      {/* Color strip — only for properties */}
      {space.color && (
        <div style={{ ...stripStyle, background: COLOR_HEX[space.color] }} />
      )}

      {/* Inner content */}
      <div
        className="flex-1 flex flex-col items-center justify-center gap-px text-center px-0.5 py-0.5"
        style={innerPad}
      >
        <div
          className={`flex flex-col items-center justify-center gap-px ${textRotation}`}
          style={{ width: '100%' }}
        >
          {cellIcon && (
            <div
              className="leading-none"
              style={{ fontSize: 'clamp(0.55rem, 1.3vw, 1rem)' }}
            >
              {cellIcon}
            </div>
          )}
          <div
            className="font-bold leading-tight"
            style={{
              fontSize: 'clamp(0.35rem, 0.85vw, 0.58rem)',
              color: 'var(--color-board-line)',
              fontFamily: 'var(--font-heebo), sans-serif',
            }}
          >
            {displayName}
          </div>
          {space.price && (
            <div
              dir="ltr"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 'clamp(0.28rem, 0.65vw, 0.48rem)',
                color: '#555',
              }}
            >
              ₪{space.price}
            </div>
          )}
          {space.taxAmount && (
            <div
              dir="ltr"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: 'clamp(0.28rem, 0.65vw, 0.48rem)',
                color: '#555',
              }}
            >
              שלם ₪{space.taxAmount}
            </div>
          )}
        </div>
      </div>

      {/* Houses / hotel */}
      {prop && prop.houses > 0 && prop.houses < 5 && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5 z-10">
          {Array.from({ length: prop.houses }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5"
              style={{ background: 'var(--color-mono-green)', border: '0.5px solid rgba(0,0,0,0.3)' }}
            />
          ))}
        </div>
      )}
      {prop && prop.houses === 5 && (
        <div
          className="absolute bottom-0.5 left-1/2 -translate-x-1/2 z-10"
          style={{
            width: '10px', height: '6px',
            background: 'var(--color-mono-red)',
            border: '0.5px solid rgba(0,0,0,0.3)',
          }}
        />
      )}

      {/* Owner indicator */}
      {owner && (
        <div
          className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full ring-1 ring-black/40 z-10"
          style={{ background: PLAYER_DOT_HEX[owner.color] || '#888' }}
        />
      )}
    </div>
  )
}
