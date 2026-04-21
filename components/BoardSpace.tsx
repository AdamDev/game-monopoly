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

const PLAYER_DOT_COLORS: Record<string, string> = {
  red: 'bg-player-red',
  blue: 'bg-player-blue',
  green: 'bg-player-green',
  yellow: 'bg-player-yellow',
  purple: 'bg-player-purple',
  orange: 'bg-player-orange',
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

export default function BoardSpace({ index, properties, players, side }: BoardSpaceProps) {
  const space = BOARD[index]
  const prop = properties.find(p => p.boardPosition === index)

  const owner = prop?.ownerPlayerId
    ? players.find(p => p.playerId === prop.ownerPlayerId)
    : null

  const isCorner = side === 'corner'
  const displayName = HEBREW_NAMES[index] || space.name

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        border border-mono-border/60 bg-gradient-to-br from-mono-card to-mono-card/70
        text-[8px] sm:text-[9px] leading-tight
        overflow-hidden select-none
        ${isCorner ? 'p-1' : 'p-0.5'}
      `}
    >
      {/* Color band for properties */}
      {space.color && (
        <div
          className={`absolute ${
            side === 'bottom' ? 'top-0 left-0 right-0 h-2.5' :
            side === 'top' ? 'bottom-0 left-0 right-0 h-2.5' :
            side === 'left' ? 'right-0 top-0 bottom-0 w-2.5' :
            side === 'right' ? 'left-0 top-0 bottom-0 w-2.5' :
            'top-0 left-0 right-0 h-2.5'
          } ${COLOR_MAP[space.color] || ''} shadow-[0_0_8px_rgba(255,255,255,0.15)_inset]`}
        />
      )}

      {/* Space name */}
      <span className="text-zinc-200 text-center font-semibold z-10 px-0.5 leading-[1.15]">
        {displayName}
      </span>

      {/* Price */}
      {space.price && !prop?.ownerPlayerId && (
        <span className="text-zinc-500 text-[7px] mt-0.5" dir="ltr">${space.price}</span>
      )}

      {/* Houses */}
      {prop && prop.houses > 0 && prop.houses < 5 && (
        <div className="flex gap-px mt-0.5">
          {Array.from({ length: prop.houses }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-green-500 rounded-sm" />
          ))}
        </div>
      )}
      {prop && prop.houses === 5 && (
        <div className="w-2.5 h-2 bg-red-500 rounded-sm mt-0.5" />
      )}

      {/* Owner indicator */}
      {owner && (
        <div className={`w-2 h-2 rounded-full mt-0.5 ${PLAYER_DOT_COLORS[owner.color] || 'bg-zinc-500'} ring-1 ring-white/20`} />
      )}
    </div>
  )
}
