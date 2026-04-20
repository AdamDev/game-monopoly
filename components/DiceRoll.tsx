'use client'

interface DiceRollProps {
  dice: [number, number] | null
  rolling: boolean
}

const DOT_POSITIONS: Record<number, string[]> = {
  1: ['top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'],
  2: ['top-1 right-1', 'bottom-1 left-1'],
  3: ['top-1 right-1', 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', 'bottom-1 left-1'],
  4: ['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'],
  5: ['top-1 left-1', 'top-1 right-1', 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2', 'bottom-1 left-1', 'bottom-1 right-1'],
  6: ['top-1 left-1', 'top-1 right-1', 'top-1/2 left-1 -translate-y-1/2', 'top-1/2 right-1 -translate-y-1/2', 'bottom-1 left-1', 'bottom-1 right-1'],
}

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  const dots = DOT_POSITIONS[value] || []

  return (
    <div
      className={`
        relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white shadow-lg
        ${rolling ? 'animate-dice-roll' : ''}
      `}
    >
      {dots.map((pos, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-zinc-900 ${pos}`}
        />
      ))}
    </div>
  )
}

export default function DiceRoll({ dice, rolling }: DiceRollProps) {
  if (!dice) return null

  return (
    <div className="flex gap-3 items-center justify-center">
      <Die value={dice[0]} rolling={rolling} />
      <Die value={dice[1]} rolling={rolling} />
    </div>
  )
}
