'use client'

import { useState, useEffect, useCallback, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { getPlayerId } from '@/lib/player'
import { getSocket, disconnectSocket } from '@/lib/socket'
import type { GameState } from '@/types/game'
import type { Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket-events'
import GameBoard from '@/components/GameBoard'
import ActionPanel from '@/components/ActionPanel'
import DiceRoll from '@/components/DiceRoll'
import GameLog from '@/components/GameLog'
import { BOARD } from '@/lib/board-data'

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>

const PLAYER_COLOR_HEX: Record<string, string> = {
  red: '#cc2936',
  blue: '#1d6bbf',
  green: '#2e8b57',
  yellow: '#c9a84c',
  purple: '#9b59b6',
  orange: '#e67e22',
}

const TOKEN_BY_COLOR: Record<string, string> = {
  red: '🎩', blue: '🚗', green: '🐕', yellow: '👢', purple: '🚢', orange: '🪡',
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

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/games/${id}`)
        if (!res.ok) throw new Error('Game not found')
        const data = await res.json()
        setGame(data)
      } catch {
        setError('טעינת המשחק נכשלה')
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (game) connectSocket()
    return () => { disconnectSocket() }
  }, [game?.status, connectSocket])

  const handleStartGame = () => socketRef.current?.emit('game:start')
  const handleRollDice = () => socketRef.current?.emit('game:roll-dice')
  const handleBuyProperty = () => socketRef.current?.emit('game:buy-property')
  const handleDeclineProperty = () => socketRef.current?.emit('game:decline-property')
  const handleEndTurn = () => socketRef.current?.emit('game:end-turn')

  const copyInviteLink = () => {
    if (!game) return
    const link = `${window.location.origin}/join/${game.code}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyCode = () => {
    if (!game) return
    navigator.clipboard.writeText(game.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isHost = game?.hostPlayerId === playerId
  const isPlayer = game?.players.some(p => p.playerId === playerId)

  if (error) {
    return (
      <div className="relative flex flex-1 flex-col items-center justify-center gap-4">
        <div className="bg-grid-overlay" />
        <div className="gold-panel relative z-10 px-10 py-8 text-center">
          <p className="text-red-300 mb-5">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-skew px-7 py-3 font-bold tracking-wider"
            style={{
              background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-l) 55%, var(--color-gold) 100%)',
              color: 'var(--color-navy)',
            }}
          >
            חזרה לדף הבית
          </button>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p style={{ color: 'var(--color-muted)' }}>טוען...</p>
      </div>
    )
  }

  // ─── WAITING ROOM (LOBBY) ───
  if (game.status === 'waiting') {
    return (
      <div className="relative flex flex-1 flex-col items-start overflow-y-auto px-4 sm:px-8 py-8">
        <div className="bg-grid-overlay" />
        <div className="relative z-10 w-full max-w-3xl mx-auto animate-fade-up">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div
              className="text-2xl tracking-wider"
              style={{ fontFamily: 'var(--font-bebas), sans-serif', color: 'var(--color-gold)' }}
            >
              <span style={{ color: 'var(--color-mono-red)' }}>מ</span>ונופולי <span className="text-sm font-light" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-heebo), sans-serif' }}>אונליין</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/')}
                className="text-xs font-semibold tracking-wider uppercase px-3 py-1.5 transition-colors"
                style={{
                  border: '1px solid transparent',
                  color: 'var(--color-muted)',
                }}
              >
                ← יציאה
              </button>
            </div>
          </div>

          {/* Status pill */}
          {!connected && (
            <p className="text-xs text-yellow-400 mb-3 text-center">מתחבר...</p>
          )}

          {/* Map panel (only classic) */}
          <div className="gold-panel p-6 mb-5">
            <div
              className="text-[0.78rem] font-bold tracking-[0.18em] uppercase mb-4 flex items-center gap-2.5"
              style={{ color: 'var(--color-gold)' }}
            >
              <span className="block w-[3px] h-3.5" style={{ background: 'var(--color-gold)' }} />
              מהדורת לוח
            </div>
            <div
              className="p-3 text-center"
              style={{
                border: '2px solid var(--color-gold)',
                background: 'rgba(201,168,76,0.07)',
              }}
            >
              <div className="text-2xl mb-1.5">🏙️</div>
              <div
                className="tracking-wider text-base"
                style={{ fontFamily: 'var(--font-bebas), sans-serif', color: 'var(--color-gold)' }}
              >
                קלאסי
              </div>
              <div className="text-[0.62rem] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Atlantic City
              </div>
            </div>
          </div>

          {/* Players panel */}
          <div className="gold-panel p-6 mb-5">
            <div
              className="text-[0.78rem] font-bold tracking-[0.18em] uppercase mb-5 flex items-center gap-2.5"
              style={{ color: 'var(--color-gold)' }}
            >
              <span className="block w-[3px] h-3.5" style={{ background: 'var(--color-gold)' }} />
              שחקנים
              <span
                className="ms-auto font-normal text-[0.72rem] tracking-normal normal-case"
                style={{ color: 'var(--color-muted)' }}
              >
                {game.players.length} / {game.maxPlayers}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {Array.from({ length: game.maxPlayers }).map((_, i) => {
                const p = game.players[i]
                if (!p) {
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1.5 px-2 py-3.5"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px dashed rgba(201,168,76,0.2)',
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-base"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '2px solid rgba(255,255,255,0.08)',
                          color: 'var(--color-muted)',
                        }}
                      >
                        +
                      </div>
                      <div className="text-xs italic" style={{ color: 'var(--color-muted)' }}>ממתין...</div>
                      <div className="text-[0.62rem]" style={{ color: 'rgba(201,168,76,0.5)' }}>הזמן</div>
                    </div>
                  )
                }
                const colorHex = PLAYER_COLOR_HEX[p.color] || '#888'
                const isMe = p.playerId === playerId
                const isHostPlayer = p.playerId === game.hostPlayerId
                return (
                  <div
                    key={p.playerId}
                    className="flex flex-col items-center gap-1.5 px-2 py-3.5 transition-colors"
                    style={{
                      background: 'rgba(201,168,76,0.04)',
                      border: '1px solid rgba(201,168,76,0.35)',
                      borderColor: colorHex + '66',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl relative overflow-hidden"
                      style={{
                        background: colorHex + '22',
                        border: '2px solid ' + colorHex + '99',
                      }}
                    >
                      {p.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.avatarUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <span>{TOKEN_BY_COLOR[p.color] || '🎩'}</span>
                      )}
                    </div>
                    <div className="text-[0.78rem] font-semibold text-center truncate max-w-full" style={{ color: 'var(--color-cream)' }}>
                      {p.name}{isMe && ' (אני)'}
                    </div>
                    <div
                      className="text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5"
                      style={{
                        background: isHostPlayer ? 'rgba(201,168,76,0.18)' : 'rgba(46,139,87,0.2)',
                        color: isHostPlayer ? 'var(--color-gold)' : '#5ecf8c',
                      }}
                    >
                      {isHostPlayer ? 'מארח' : 'מוכן'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Room code */}
            <div className="flex items-center gap-3.5">
              <div>
                <div className="text-[0.65rem] tracking-[0.2em] uppercase mb-0.5" style={{ color: 'var(--color-muted)' }}>
                  קוד חדר
                </div>
                <div
                  className="text-2xl tracking-[0.3em]"
                  style={{
                    fontFamily: 'var(--font-mono), monospace',
                    color: 'var(--color-gold-l)',
                    textShadow: '0 0 20px rgba(232,201,110,0.3)',
                  }}
                >
                  {game.code}
                </div>
              </div>
              <button
                onClick={copyCode}
                className="px-3.5 py-1.5 text-[0.7rem] font-semibold tracking-wider uppercase transition-colors"
                style={{
                  background: 'rgba(201,168,76,0.08)',
                  color: 'var(--color-gold)',
                  border: '1px solid rgba(201,168,76,0.3)',
                }}
              >
                {copied ? 'הועתק!' : 'העתק'}
              </button>
              <button
                onClick={copyInviteLink}
                className="px-4 py-2 text-[0.82rem] transition-colors"
                style={{
                  background: 'transparent',
                  color: 'var(--color-gold)',
                  border: '1px solid rgba(201,168,76,0.3)',
                }}
              >
                🔗 שתף קישור
              </button>
            </div>

            {/* Start */}
            <div className="flex gap-2.5">
              {isHost && game.players.length >= 2 && (
                <button
                  onClick={handleStartGame}
                  className="btn-skew px-10 py-3 font-bold tracking-wider transition-transform hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-l) 55%, var(--color-gold) 100%)',
                    color: 'var(--color-navy)',
                    boxShadow: '0 4px 28px rgba(201,168,76,0.45)',
                  }}
                >
                  התחל משחק ▶
                </button>
              )}
              {isHost && game.players.length < 2 && (
                <p className="self-center text-sm" style={{ color: 'var(--color-muted)' }}>
                  צריך לפחות 2 שחקנים כדי להתחיל
                </p>
              )}
              {!isHost && (
                <p className="self-center text-sm" style={{ color: 'var(--color-muted)' }}>
                  ממתין שהמארח יתחיל...
                </p>
              )}
            </div>
          </div>

          {!isPlayer && (
            <p className="mt-5 text-center text-sm text-red-400">אתה לא משתתף במשחק זה</p>
          )}

        </div>
      </div>
    )
  }

  // ─── GAME IN PROGRESS ───
  const currentPlayer = game.players[game.currentPlayerIndex]
  const myProps = game.properties.filter(p => p.ownerPlayerId === playerId)
  const round = Math.floor((game.players.reduce((acc, p) => acc + (p.position || 0), 0) / 40) / Math.max(1, game.players.length)) + 1

  return (
    <div className="relative flex flex-1 flex-col h-screen overflow-hidden">
      <div className="bg-grid-overlay" />

      {/* Top bar */}
      <div
        className="relative z-20 h-11 flex items-center px-5 gap-3.5 backdrop-blur"
        style={{
          background: 'rgba(11,22,34,0.96)',
          borderBottom: '1px solid rgba(201,168,76,0.15)',
        }}
      >
        <div
          className="text-xl tracking-wider"
          style={{ fontFamily: 'var(--font-bebas), sans-serif', color: 'var(--color-gold)' }}
        >
          <span style={{ color: 'var(--color-mono-red)' }}>מ</span>ונופולי
        </div>
        <div
          className="text-[0.7rem] font-semibold tracking-wider px-3 py-1"
          style={{
            background: 'rgba(201,168,76,0.1)',
            color: 'var(--color-gold)',
            border: '1px solid rgba(201,168,76,0.25)',
          }}
        >
          {TOKEN_BY_COLOR[currentPlayer?.color || 'red']} תור: {currentPlayer?.name}
        </div>
        <div
          className="text-[0.7rem] font-semibold tracking-wider px-3 py-1"
          style={{
            background: 'rgba(201,168,76,0.1)',
            color: 'var(--color-gold)',
            border: '1px solid rgba(201,168,76,0.25)',
          }}
        >
          סיבוב {round}
        </div>
        <div className="flex-1" />
        {!connected && (
          <span className="text-xs text-yellow-400">מתחבר מחדש...</span>
        )}
        <button
          onClick={() => router.push('/')}
          className="text-[0.72rem] font-bold tracking-wider uppercase px-3 py-1 transition-colors"
          style={{
            border: '1px solid rgba(201,168,76,0.25)',
            color: 'var(--color-muted)',
            background: 'transparent',
          }}
        >
          ← יציאה
        </button>
      </div>

      {/* Layout */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-stretch lg:items-center justify-center gap-3 p-3 overflow-hidden">

        {/* LEFT PANEL — players + my props (desktop) */}
        <div className="hidden lg:flex flex-col gap-2.5 w-[210px] flex-shrink-0 max-h-[680px]">
          <div className="gold-panel p-3.5">
            <div
              className="text-[0.63rem] font-extrabold tracking-[0.2em] uppercase mb-2.5 flex items-center gap-1.5"
              style={{ color: 'var(--color-gold)' }}
            >
              <span className="block w-[3px] h-2.5" style={{ background: 'var(--color-gold)' }} />
              שחקנים
            </div>
            {game.players.map((p, i) => {
              const colorHex = PLAYER_COLOR_HEX[p.color] || '#888'
              const isTurn = i === game.currentPlayerIndex
              return (
                <div
                  key={p.playerId}
                  className="flex items-center gap-2 py-1.5 transition-colors"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: isTurn ? 'rgba(201,168,76,0.08)' : 'transparent',
                    margin: isTurn ? '0 -14px' : '0',
                    padding: isTurn ? '6px 14px' : '6px 0',
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-base relative overflow-hidden flex-shrink-0"
                    style={{
                      background: colorHex + '33',
                      border: isTurn ? '2px solid var(--color-gold)' : '2px solid ' + colorHex,
                      boxShadow: isTurn ? '0 0 10px rgba(201,168,76,0.35)' : 'none',
                    }}
                  >
                    {p.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatarUrl} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <span>{TOKEN_BY_COLOR[p.color] || '🎩'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.78rem] font-bold truncate" style={{ color: 'var(--color-cream)' }}>
                      {p.name}{p.playerId === playerId && ' (אני)'}
                    </div>
                    <div className="text-[0.7rem]" style={{ color: 'var(--color-gold-l)', fontFamily: 'var(--font-mono), monospace' }}>
                      ₪{p.money.toLocaleString()}
                    </div>
                  </div>
                  {isTurn && (
                    <div className="text-[0.7rem]" style={{ color: 'var(--color-gold)' }}>◀</div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="gold-panel p-3.5 flex-1 flex flex-col overflow-hidden">
            <div
              className="text-[0.63rem] font-extrabold tracking-[0.2em] uppercase mb-2.5 flex items-center gap-1.5"
              style={{ color: 'var(--color-gold)' }}
            >
              <span className="block w-[3px] h-2.5" style={{ background: 'var(--color-gold)' }} />
              הנכסים שלי
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto flex-1">
              {myProps.length === 0 && (
                <div className="text-[0.7rem] py-1" style={{ color: 'var(--color-muted)' }}>
                  עדיין אין לך נכסים
                </div>
              )}
              {myProps.map(prop => {
                const sq = BOARD[prop.boardPosition]
                if (!sq) return null
                const colorClass = sq.color
                  ? `bg-prop-${sq.color}`
                  : sq.type === 'railroad'
                    ? 'bg-zinc-700'
                    : 'bg-blue-400'
                return (
                  <div
                    key={prop.boardPosition}
                    className="flex items-center gap-1.5 px-2 py-1 text-[0.7rem]"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      color: 'var(--color-cream)',
                    }}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${colorClass} flex-shrink-0`} />
                    <div className="flex-1 truncate">{sq.name}</div>
                    {prop.houses > 0 && prop.houses < 5 && <span>🏠×{prop.houses}</span>}
                    {prop.houses === 5 && <span>🏨</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* BOARD */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <GameBoard
            properties={game.properties}
            players={game.players}
            currentPlayerIndex={game.currentPlayerIndex}
            myPlayerId={playerId}
          />
        </div>

        {/* RIGHT PANEL — dice + actions + log */}
        <div className="flex flex-col gap-2.5 lg:w-[210px] w-full flex-shrink-0 lg:max-h-[680px]">
          {/* Dice */}
          <div className="gold-panel p-3.5">
            <div
              className="text-[0.63rem] font-extrabold tracking-[0.2em] uppercase mb-2.5 flex items-center gap-1.5"
              style={{ color: 'var(--color-gold)' }}
            >
              <span className="block w-[3px] h-2.5" style={{ background: 'var(--color-gold)' }} />
              קוביות
            </div>
            <div className="flex flex-col items-center gap-2.5">
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
            </div>
          </div>

          {/* Log */}
          <div className="gold-panel p-3.5 flex-1 flex flex-col overflow-hidden hidden lg:flex">
            <div
              className="text-[0.63rem] font-extrabold tracking-[0.2em] uppercase mb-2.5 flex items-center gap-1.5"
              style={{ color: 'var(--color-gold)' }}
            >
              <span className="block w-[3px] h-2.5" style={{ background: 'var(--color-gold)' }} />
              יומן
            </div>
            <div className="flex-1 overflow-hidden">
              <GameLog entries={logEntries} />
            </div>
          </div>

          {/* Mobile log (collapsible) */}
          <details className="lg:hidden gold-panel p-3.5">
            <summary className="cursor-pointer text-[0.7rem] font-bold tracking-wider uppercase" style={{ color: 'var(--color-gold)' }}>
              יומן המשחק
            </summary>
            <div className="mt-2">
              <GameLog entries={logEntries} />
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
