'use client'

interface DiceRollProps {
  dice: [number, number] | null
  rolling: boolean
}

// 3x3 grid pip indices
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  const pips = PIPS[value] || []
  return (
    <div
      className={`grid grid-cols-3 grid-rows-3 ${rolling ? 'animate-dice-roll' : ''}`}
      style={{
        width: '48px',
        height: '48px',
        background: '#fff',
        borderRadius: '7px',
        boxShadow: '3px 3px 0 rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.2)',
        padding: '6px',
        gap: '3px',
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: pips.includes(i) ? 'var(--color-navy)' : 'transparent',
          }}
        />
      ))}
    </div>
  )
}

export default function DiceRoll({ dice, rolling }: DiceRollProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2.5">
        <Die value={dice?.[0] ?? 1} rolling={rolling} />
        <Die value={dice?.[1] ?? 1} rolling={rolling} />
      </div>
      <div
        className="text-base min-h-[1.5em]"
        style={{
          fontFamily: 'var(--font-mono), monospace',
          color: 'var(--color-gold-l)',
        }}
      >
        {dice ? `סה"כ: ${dice[0] + dice[1]}` : '—'}
      </div>
    </div>
  )
}
