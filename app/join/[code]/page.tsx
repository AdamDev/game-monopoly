'use client'

import { useState, useEffect, useSyncExternalStore, use } from 'react'
import { useRouter } from 'next/navigation'
import { getPlayerId, getPlayerName, setPlayerName, subscribePlayerName } from '@/lib/player'
import NamePrompt from '@/components/NamePrompt'

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-1 items-center justify-center px-4">
      <div className="bg-grid-overlay" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default function JoinByLink({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const router = useRouter()
  const savedName = useSyncExternalStore(
    subscribePlayerName,
    () => getPlayerName(),
    () => null
  )
  const loaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    getPlayerId()
  }, [])

  const joinGame = async (name: string) => {
    setPlayerName(name)
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

  if (joining) {
    return (
      <Frame>
        <div className="gold-panel px-10 py-8 text-center">
          <p style={{ color: 'var(--color-gold-l)' }} className="font-semibold tracking-wider">
            מצטרף למשחק...
          </p>
        </div>
      </Frame>
    )
  }

  if (error) {
    return (
      <Frame>
        <div className="gold-panel px-10 py-8 text-center max-w-sm">
          <p className="text-red-300 mb-5">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-skew px-7 py-3 font-bold tracking-wider transition-transform hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-l) 55%, var(--color-gold) 100%)',
              color: 'var(--color-navy)',
              boxShadow: '0 4px 24px rgba(201,168,76,0.35)',
            }}
          >
            חזרה לדף הבית
          </button>
        </div>
      </Frame>
    )
  }

  if (!loaded) {
    return (
      <Frame>
        <p style={{ color: 'var(--color-muted)' }}>טוען...</p>
      </Frame>
    )
  }

  return (
    <Frame>
      <NamePrompt
        onSubmit={joinGame}
        defaultValue={savedName || ''}
        title="הצטרפות למשחק"
        subtitle={`הזינו את שמכם כדי להצטרף למשחק ${code.toUpperCase()}`}
        submitLabel="הצטרף"
      />
    </Frame>
  )
}
