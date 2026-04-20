'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getPlayerId, getPlayerName, setPlayerName } from '@/lib/player'
import NamePrompt from '@/components/NamePrompt'

export default function Home() {
  const router = useRouter()
  const [playerName, setName] = useState<string | null>(null)
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState<'create' | 'join' | null>(null)

  useEffect(() => {
    getPlayerId() // ensure playerId exists
    setName(getPlayerName())
  }, [])

  const ensureName = (action: 'create' | 'join') => {
    if (!playerName) {
      setPendingAction(action)
      setShowNamePrompt(true)
      return false
    }
    return true
  }

  const handleNameSubmit = (name: string) => {
    setPlayerName(name)
    setName(name)
    setShowNamePrompt(false)
    if (pendingAction === 'create') handleCreate(name)
    else if (pendingAction === 'join') handleJoin(name)
    setPendingAction(null)
  }

  const handleCreate = async (name?: string) => {
    const displayName = name || playerName
    if (!displayName) return ensureName('create')

    setError('')
    setCreating(true)
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: getPlayerId(),
          playerName: displayName,
          maxPlayers: 6,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create game')
      }
      const game = await res.json()
      router.push(`/game/${game._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game')
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (name?: string) => {
    const displayName = name || playerName
    if (!displayName) return ensureName('join')

    const code = joinCode.trim().toUpperCase()
    if (code.length !== 6) {
      setError('Enter a 6-character game code')
      return
    }

    setError('')
    setJoining(true)
    try {
      const res = await fetch('/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          playerId: getPlayerId(),
          playerName: displayName,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to join game')
      }
      const game = await res.json()
      router.push(`/game/${game._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      {showNamePrompt && <NamePrompt onSubmit={handleNameSubmit} />}

      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Monopoly
            </span>
          </h1>
          <p className="mt-2 text-zinc-400">Play with friends online</p>
          {playerName && (
            <p className="mt-1 text-sm text-zinc-500">
              Playing as{' '}
              <button
                onClick={() => setShowNamePrompt(true)}
                className="text-emerald-400 hover:underline"
              >
                {playerName}
              </button>
            </p>
          )}
        </div>

        {/* Create Game */}
        <div className="rounded-2xl bg-mono-card border border-mono-border p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create a Game</h2>
          <button
            onClick={() => handleCreate()}
            disabled={creating}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'New Game'}
          </button>
        </div>

        {/* Join Game */}
        <div className="rounded-2xl bg-mono-card border border-mono-border p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Join a Game</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter code..."
              maxLength={6}
              className="flex-1 rounded-xl bg-mono-bg border border-mono-border px-4 py-3 text-white uppercase tracking-widest text-center placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleJoin()}
              disabled={joining || joinCode.trim().length !== 6}
              className="rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-teal-500 disabled:opacity-50"
            >
              {joining ? '...' : 'Join'}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  )
}
