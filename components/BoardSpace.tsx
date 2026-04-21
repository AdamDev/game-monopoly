'use client'

import { BOARD } from '@/lib/board-data'
import type { GameProperty, GamePlayer, PropertyColor } from '@/types/game'

const COLOR_MAP: Record<PropertyColor, string> = {
  'brown': 'bg-prop-brown',
  'light-blue': 'bg-prop-light-blue',
  'pink': 'bg-prop-pink',
  'orange': 'bg-prop-orange',
  'red': 'bg-prop-red',
  'yellow': 'bg-prop-yellow',
  'green': 'bg-prop-green',
  'dark-blue': 'bg-prop-dark-blue',
}

const PLAYER_RING: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
}

const HEBREW_NAMES: Record<number, string> = {
  0: 'התחלה',
  1: 'שד׳ ים תיכון',
  2: 'קופת קהילה',
  3: 'שד׳ הבלטי',
  4: 'מס הכנסה',
  5: 'רכבת רידינג',
  6: 'שד׳ המזרח',
  7: 'הזדמנות',
  8: 'שד׳ ורמונט',
  9: 'שד׳ קונטיקט',
  10: 'כלא / ביקור',
  11: 'כיכר סנט צ׳רלס',
  12: 'חברת חשמל',
  13: 'שד׳ סטייטס',
  14: 'שד׳ וירג׳יניה',
  15: 'רכבת פנסילבניה',
  16: 'כיכר סנט ג׳יימס',
  17: 'קופת קהילה',
  18: 'שד׳ טנסי',
  19: 'שד׳ ניו יורק',
  20: 'חניה חופשית',
  21: 'שד׳ קנטאקי',
  22: 'הזדמנות',
  23: 'שד׳ אינדיאנה',
  24: 'שד׳ אילינוי',
  25: 'רכבת B&O',
  26: 'שד׳ אטלנטיק',
  27: 'שד׳ ונטנור',
  28: 'מפעל המים',
  29: 'גני מרווין',
  30: 'לכלא!',
  31: 'שד׳ הפסיפיק',
  32: 'שד׳ צפון קרוליינה',
  33: 'קופת קהילה',
  34: 'שד׳ פנסילבניה',
  35: 'הקו הקצר',
  36: 'הזדמנות',
  37: 'פארק פלייס',
  38: 'מס מותרות',
  39: 'בורדווק',
}

interface BoardSpaceProps {
  index: number
  properties: GameProperty[]
  players: GamePlayer[]
  side: 'bottom' | 'left' | 'top' | 'right' | 'corner'
}

function SpaceIcon({ index }: { index: number }) {
  const space = BOARD[index]
  // Chance
  if (space.type === 'chance') return <span className="text-[var(--color-chance-orange)] text-2xl leading-none font-bold">?</span>
  // Community Chest
  if (space.type === 'community-chest') return <span className="text-[var(--color-chest-blue)] text-xl leading-none">💰</span>
  // Railroad
  if (space.type === 'railroad') return <span className="text-black text-lg leading-none">🚂</span>
  // Utilities
  if (index === 12) return <span className="text-yellow-500 text-lg leading-none">💡</span>
  if (index === 28) return <span className="text-blue-500 text-lg leading-none">🚰</span>
  // Tax
  if (space.type === 'tax') return <span className="text-lg leading-none">{index === 4 ? '◆' : '💍'}</span>
  return null
}

function CornerContent({ index }: { index: number }) {
  if (index === 0) {
    // GO
    return (
      <div className="flex flex-col items-center justify-center gap-0.5 h-full w-full" dir="rtl">
        <span className="text-[7px] sm:text-[8px] text-[var(--color-board-ink)] text-center leading-tight px-0.5">
          אספו ₪200<br />בכל מעבר
        </span>
        <span className="text-3xl sm:text-4xl font-black text-[var(--color-monopoly-red)] leading-none" style={{ fontFamily: 'var(--font-bebas)' }}>GO</span>
        <span className="text-xl leading-none text-[var(--color-monopoly-red)]">←</span>
      </div>
    )
  }
  if (index === 10) {
    // Jail
    return (
      <div className="relative flex flex-col items-center justify-center h-full w-full">
        <div className="absolute inset-1 bg-[var(--color-prop-orange)] rounded-sm flex flex-col items-center justify-center">
          <span className="text-[8px] sm:text-[9px] text-white font-bold">כלא</span>
          <span className="text-xl sm:text-2xl">👮‍♂️</span>
        </div>
        <span className="absolute bottom-0.5 text-[7px] sm:text-[8px] text-[var(--color-board-ink)] font-semibold bg-[var(--color-board-cell)] px-1">ביקור</span>
      </div>
    )
  }
  if (index === 20) {
    // Free Parking
    return (
      <div className="flex flex-col items-center justify-center gap-0.5 h-full w-full">
        <span className="text-[7px] sm:text-[8px] text-[var(--color-monopoly-red)] font-bold uppercase">חניה</span>
        <span className="text-2xl sm:text-3xl">🚗</span>
        <span className="text-[7px] sm:text-[8px] text-[var(--color-monopoly-red)] font-bold">חופשית</span>
      </div>
    )
  }
  if (index === 30) {
    // Go To Jail
    return (
      <div className="flex flex-col items-center justify-center gap-0.5 h-full w-full">
        <span className="text-[7px] sm:text-[8px] text-[var(--color-board-ink)] font-bold">לכלא!</span>
        <span className="text-2xl sm:text-3xl">👉</span>
      </div>
    )
  }
  return null
}

export default function BoardSpace({ index, properties, players, side }: BoardSpaceProps) {
  const space = BOARD[index]
  const prop = properties.find(p => p.boardPosition === index)

  const owner = prop?.ownerPlayerId
    ? players.find(p => p.playerId === prop.ownerPlayerId)
    : null

  const isCorner = side === 'corner'
  const displayName = HEBREW_NAMES[index] || space.name

  // Orient text: bottom=normal, top=180°, left=90°, right=-90°
  const textRotation =
    side === 'top' ? 'rotate-180' :
    side === 'left' ? '-rotate-90' :
    side === 'right' ? 'rotate-90' :
    ''

  return (
    <div
      className={`
        relative flex flex-col items-stretch
        border border-black/70 bg-[var(--color-board-cell)]
        overflow-hidden select-none
      `}
    >
      {isCorner ? (
        <CornerContent index={index} />
      ) : (
        <>
          {/* Color band at inner edge */}
          {space.color && (
            <div
              className={`${COLOR_MAP[space.color]} ${
                side === 'bottom' ? 'h-[22%] w-full border-b border-black/70' :
                side === 'top' ? 'h-[22%] w-full order-last border-t border-black/70' :
                side === 'left' ? 'w-[22%] h-full absolute right-0 top-0 bottom-0 border-l border-black/70' :
                'w-[22%] h-full absolute left-0 top-0 bottom-0 border-r border-black/70'
              }`}
            />
          )}

          <div
            className={`
              flex-1 flex flex-col items-center justify-center px-0.5 py-0.5 gap-0.5
              ${side === 'left' ? 'mr-[22%]' : side === 'right' ? 'ml-[22%]' : ''}
            `}
          >
            <div className={`${textRotation} flex flex-col items-center justify-center gap-0.5 w-full`}>
              <span className="text-[7px] sm:text-[8px] text-[var(--color-board-ink)] text-center font-bold leading-[1.05] px-0.5 uppercase tracking-tight">
                {displayName}
              </span>

              <SpaceIcon index={index} />

              {space.price && !prop?.ownerPlayerId && (
                <span className="text-[7px] text-[var(--color-board-ink)] font-semibold" dir="ltr">₪{space.price}</span>
              )}

              {space.taxAmount && (
                <span className="text-[7px] text-[var(--color-board-ink)] font-semibold" dir="ltr">שלם ₪{space.taxAmount}</span>
              )}
            </div>
          </div>

          {/* Houses */}
          {prop && prop.houses > 0 && prop.houses < 5 && (
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 flex gap-px z-10">
              {Array.from({ length: prop.houses }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-green-600 border border-black rounded-[1px]" />
              ))}
            </div>
          )}
          {prop && prop.houses === 5 && (
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-3 h-2 bg-red-600 border border-black rounded-[1px] z-10" />
          )}

          {/* Owner indicator */}
          {owner && (
            <div className={`absolute bottom-0.5 left-0.5 w-2 h-2 rounded-full ${PLAYER_RING[owner.color] || 'bg-zinc-500'} ring-1 ring-black/40 z-10`} />
          )}
        </>
      )}
    </div>
  )
}
