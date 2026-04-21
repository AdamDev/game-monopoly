'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { getPlayerId, getPlayerName, setPlayerName } from '@/lib/player'
import NamePrompt from '@/components/NamePrompt'

export default function JoinByLink({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const router = useRouter()
  const [needsName, setNeedsName] = useState(false)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const name = getPlayerName()
    if (name) {
      joinGame(name)
    } else {
      setNeedsName(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const joinGame = async (name: string) => {
    setJoining(true)
    setError('')
    try {
      const res = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase(),
          playerId: getPlayerId(),
          playerName: name,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'ההצטרפות למשחק נכשלה')
      }
      const game = await res.json()
      router.push(`/game/${game._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ההצטרפות למשחק נכשלה')
      setJoining(false)
    }
  }

  const handleNameSubmit = (name: string) => {
    setPlayerName(name)
    setNeedsName(false)
    joinGame(name)
  }

  if (needsName) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <NamePrompt
          onSubmit={handleNameSubmit}
          title="הצטרפות למשחק"
          subtitle={`הזינו את שמכם כדי להצטרף למשחק ${code.toUpperCase()}`}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      {joining && <p className="text-zinc-400">מצטרף למשחק...</p>}
      {error && (
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-xl bg-mono-card border border-mono-border px-6 py-3 text-white hover:bg-mono-card-hover"
          >
            חזרה לדף הבית
          </button>
        </div>
      )}
    </div>
  )
}
