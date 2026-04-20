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

  return (
    <div className="w-full max-h-32 overflow-y-auto rounded-xl bg-mono-bg/50 border border-mono-border/30 p-2 text-xs">
      {entries.length === 0 && (
        <p className="text-zinc-500 text-center">Game starting...</p>
      )}
      {entries.map((entry, i) => (
        <p key={i} className="text-zinc-400 py-0.5 leading-snug">
          {entry.message}
        </p>
      ))}
      <div ref={endRef} />
    </div>
  )
}
