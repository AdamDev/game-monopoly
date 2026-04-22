'use client'

import { useRef, useEffect } from 'react'

interface GameLogProps {
  entries: Array<{ message: string; timestamp: number }>
}

export default function GameLog({ entries }: GameLogProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  // Reverse for newest-first feel like the design (entries added at top)
  const reversed = [...entries].reverse()

  return (
    <div className="h-full overflow-y-auto flex flex-col gap-1">
      {entries.length === 0 && (
        <p className="text-center text-[0.7rem]" style={{ color: 'var(--color-muted)' }}>
          המשחק מתחיל...
        </p>
      )}
      {reversed.map((entry, i) => (
        <p
          key={`${entry.timestamp}-${i}`}
          className="text-[0.7rem] py-1 leading-snug"
          style={{
            color: 'var(--color-muted)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <span style={{ color: 'var(--color-cream)', fontWeight: 600 }}>{entry.message}</span>
        </p>
      ))}
      <div ref={endRef} />
    </div>
  )
}
