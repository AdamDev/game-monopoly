'use client'

import { useState, useEffect, useCallback, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { getPlayerId } from '@/lib/player'
import { getSocket, disconnectSocket } from '@/lib/socket'
import type { GameState } from '@/types/game'
import type { Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket-events'
import GameBoard from '@/components/GameBoard'
import PlayersBar from '@/components/PlayersBar'
import ActionPanel from '@/components/ActionPanel'
import DiceRoll from '@/components/DiceRoll'
import GameLog from '@/components/GameLog'

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const PLAYER_COLOR_MAP: Record<string, string> = {
  red: 'bg-player-red',
  blue: 'bg-player-blue',
  green: 'bg-player-green',
  yellow: 'bg-player-yellow',
  purple: 'bg-player-purple',
  orange: 'bg-player-orange',
}

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [game, setGame] = useState<GameState | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [dice, setDice] = useState<[number, number] | null>(null)
  const [rolling, setRolling] = useState(false)
  const [logEntries, setLogEntries] = useState<Array<{ message: string; timestamp: number }>>([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<GameSocket | null>(null)
  const playerId = typeof window !== 'undefined' ? getPlayerId() : ''

  // Connect socket when game is loaded and status is waiting/playing
  const connectSocket = useCallback(() => {
    if (!playerId || !id || socketRef.current?.connected) return

    const socket = getSocket(id, playerId) as GameSocket
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('game:state', (state) => {
      setGame(state)
    })

    socket.on('game:started', (state) => {
      setGame(state)
    })

    socket.on('game:player-joined', () => {
      // State will be refreshed via game:state
    })

    socket.on('game:dice-rolled', (data) => {
      setDice(data.dice)
      setRolling(true)
      setTimeout(() => setRolling(false), 500)
    })

    socket.on('log:entry', (entry) => {
      setLogEntries(prev => [...prev.slice(-50), entry])
    })

    socket.on('error', (data) => {
      console.error('Socket error:', data.message)
    })
  }, [id, playerId])

  // Initial load via REST, then connect socket
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/games/${id}`)
        if (!res.ok) throw new Error('Game not found')
        const data = await res.json()
        setGame(data)
      } catch {
        setError('Failed to load game')
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (game) connectSocket()
    return () => { disconnectSocket() }
  }, [game?.status, connectSocket])

  const handleStartGame = () => {
    socketRef.current?.emit('game:start')
  }

  const handleRollDice = () => {
    socketRef.current?.emit('game:roll-dice')
  }

  const handleBuyProperty = () => {
    socketRef.current?.emit('game:buy-property')
  }

  const handleDeclineProperty = () => {
    socketRef.current?.emit('game:decline-property')
  }

  const handleEndTurn = () => {
    socketRef.current?.emit('game:end-turn')
  }

  const copyInviteLink = () => {
    if (!game) return
    const link = `${window.location.origin}/join/${game.code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isHost = game?.hostPlayerId === playerId
  const isPlayer = game?.players.some(p => p.playerId === playerId)

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <button onClick={() => router.push('/')} className="rounded-xl bg-mono-card border border-mono-border px-6 py-3 text-white hover:bg-mono-card-hover">
          Back to Home
        </button>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    )
  }

  // ─── WAITING ROOM ───
  if (game.status === 'waiting') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">Waiting Room</h1>
            <p className="mt-1 text-zinc-400">{game.players.length}/{game.maxPlayers} players</p>
            {!connected && <p className="text-xs text-yellow-400 mt-1">Connecting...</p>}
          </div>

          {/* Invite link */}
          <div className="rounded-2xl bg-mono-card border border-mono-border p-5">
            <p className="text-sm text-zinc-400 mb-2">Share this link:</p>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl bg-mono-bg border border-mono-border px-4 py-2.5 text-emerald-400 font-mono text-sm truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/join/${game.code}` : `/join/${game.code}`}
              </div>
              <button onClick={copyInviteLink} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 shrink-0">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">Code: <span className="font-mono text-zinc-400">{game.code}</span></p>
          </div>

          {/* Players */}
          <div className="rounded-2xl bg-mono-card border border-mono-border p-5">
            <h2 className="text-lg font-semibold text-white mb-3">Players</h2>
            <div className="space-y-2">
              {game.players.map(player => (
                <div key={player.playerId} className="flex items-center gap-3 rounded-xl bg-mono-bg px-4 py-3">
                  <div className={`h-4 w-4 rounded-full ${PLAYER_COLOR_MAP[player.color] || 'bg-zinc-500'}`} />
                  <span className="text-white font-medium">{player.name}</span>
                  {player.playerId === game.hostPlayerId && <span className="ml-auto text-xs text-emerald-400 font-medium">HOST</span>}
                  {player.playerId === playerId && player.playerId !== game.hostPlayerId && <span className="ml-auto text-xs text-zinc-500">You</span>}
                </div>
              ))}
            </div>
          </div>

          {isHost && game.players.length >= 2 && (
            <button onClick={handleStartGame} className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-500">
              Start Game
            </button>
          )}
          {isHost && game.players.length < 2 && (
            <p className="text-center text-sm text-zinc-500">Need at least 2 players to start</p>
          )}
          {!isPlayer && (
            <p className="text-center text-sm text-red-400">You are not in this game</p>
          )}
        </div>
      </div>
    )
  }

  // ─── GAME IN PROGRESS ───
  return (
    <div className="flex flex-1 flex-col gap-3 p-2 sm:p-4 max-w-5xl mx-auto w-full">
      {/* Connection status */}
      {!connected && (
        <p className="text-center text-xs text-yellow-400">Reconnecting...</p>
      )}

      {/* Players bar */}
      <PlayersBar
        players={game.players}
        currentPlayerIndex={game.currentPlayerIndex}
        myPlayerId={playerId}
      />

      {/* Board + center content */}
      <GameBoard properties={game.properties} players={game.players}>
        <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            MONOPOLY
          </h2>

          <DiceRoll dice={dice} rolling={rolling} />

          <ActionPanel
            game={game}
            myPlayerId={playerId}
            onRollDice={handleRollDice}
            onBuyProperty={handleBuyProperty}
            onDeclineProperty={handleDeclineProperty}
            onEndTurn={handleEndTurn}
            rolling={rolling}
          />

          <GameLog entries={logEntries} />
        </div>
      </GameBoard>
    </div>
  )
}
