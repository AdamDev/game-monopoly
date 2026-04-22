'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { getPlayerId, getPlayerName, setPlayerName, subscribePlayerName } from '@/lib/player'
import NamePrompt from '@/components/NamePrompt'

const BOARD_STRIP_COLORS = [
  '#8b1a1a', '#c9a84c', '#4fc3f7', '#cc2936', '#ff8c00',
  '#ffd700', '#f48fb1', '#00aa00', '#1a2f8a',
]

const FLOAT_TOKENS = ['🎩', '🚂', '🚢', '👞', '🐕', '🎲', '🏎️', '✈️']

// Deterministic float-token positions (avoids Math.random during render)
const FLOAT_PLACEMENTS = Array.from({ length: 18 }).map((_, i) => {
  // Simple PRNG based on index for stable, reasonably-distributed values
  const r = (n: number) => ((Math.sin(i * 12.9898 + n) * 43758.5453) % 1 + 1) % 1
  return {
    token: FLOAT_TOKENS[i % FLOAT_TOKENS.length],
    left: r(0) * 100,
    duration: 16 + r(1) * 16,
    delay: -r(2) * 24,
    size: 1 + r(3) * 2,
  }
})

export default function Home() {
  const router = useRouter()
  const playerName = useSyncExternalStore(
    subscribePlayerName,
    () => getPlayerName(),
    () => null
  )
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [pendingAction, setPendingAction] = useState<'create' | 'join' | null>(null)

  useEffect(() => {
    getPlayerId()
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
        throw new Error(data.error || 'יצירת המשחק נכשלה')
      }
      const game = await res.json()
      router.push(`/game/${game._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'יצירת המשחק נכשלה')
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async (name?: string) => {
    const displayName = name || playerName
    if (!displayName) return ensureName('join')

    const code = joinCode.trim().toUpperCase()
    if (code.length !== 6) {
      setError('הזינו קוד משחק בן 6 תווים')
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
        throw new Error(data.error || 'ההצטרפות למשחק נכשלה')
      }
      const game = await res.json()
      router.push(`/game/${game._id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ההצטרפות למשחק נכשלה')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background grid */}
      <div className="bg-grid-overlay" />

      {/* Floating tokens */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {FLOAT_PLACEMENTS.map((t, i) => (
          <span
            key={i}
            className="absolute opacity-0"
            style={{
              left: `${t.left}vw`,
              fontSize: `${t.size}rem`,
              animation: `float-up ${t.duration}s linear infinite`,
              animationDelay: `${t.delay}s`,
            }}
          >
            {t.token}
          </span>
        ))}
      </div>

      {showNamePrompt && (
        <NamePrompt
          onSubmit={handleNameSubmit}
          onCancel={playerName ? () => { setShowNamePrompt(false); setPendingAction(null) } : undefined}
          defaultValue={playerName || ''}
          title={playerName ? 'שינוי שם' : 'הזינו את שמכם'}
          subtitle={playerName ? 'השם יופיע לכל השחקנים במשחק' : 'בחרו שם תצוגה למשחק'}
          submitLabel={playerName ? 'שמור' : 'המשך'}
        />
      )}

      <div className="relative z-10 flex flex-col items-center w-full max-w-xl">

        {/* Eyebrow */}
        <div
          className="text-[0.72rem] font-semibold tracking-[0.35em] uppercase text-gold/85 mb-7 animate-fade-up"
          style={{ animationDelay: '0.1s', color: 'var(--color-gold)' }}
        >
          משחק הלוח הקלאסי · גרסה אונליין
        </div>

        {/* Logo block — red plate, gold corners, Bebas Neue */}
        <div
          className="relative w-[min(520px,90vw)] h-[170px] flex items-center justify-center animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          {/* Red skewed plate */}
          <div
            className="absolute inset-0"
            style={{
              background: 'var(--color-mono-red)',
              transform: 'skewX(-2deg)',
              boxShadow: '6px 6px 0 var(--color-gold-d), 0 30px 100px rgba(204,41,54,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            {/* Top shine */}
            <div
              className="absolute top-0 left-0 right-0"
              style={{
                height: '40%',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
              }}
            />
          </div>
          {/* Gold corner brackets */}
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-[3px] border-r-[3px]" style={{ borderColor: 'var(--color-gold)' }} />
          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-[3px] border-l-[3px]" style={{ borderColor: 'var(--color-gold)' }} />
          <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-[3px] border-r-[3px]" style={{ borderColor: 'var(--color-gold)' }} />
          <span className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-[3px] border-l-[3px]" style={{ borderColor: 'var(--color-gold)' }} />
          {/* Logo text */}
          <div
            className="relative z-10 text-white leading-none"
            style={{
              fontFamily: 'var(--font-bebas), sans-serif',
              fontSize: 'clamp(4rem, 14vw, 8.5rem)',
              letterSpacing: '0.07em',
              textShadow: '3px 5px 0 rgba(0,0,0,0.35), 0 0 60px rgba(255,255,255,0.1)',
            }}
          >
            MONOPOLY
          </div>
        </div>

        {/* Ribbon */}
        <div
          className="relative z-10 mt-1 mb-9 px-6 py-1 text-[0.72rem] font-extrabold tracking-[0.45em] uppercase animate-fade-up"
          style={{
            color: 'var(--color-gold-l)',
            background: 'rgba(0,0,0,0.3)',
            animationDelay: '0.3s',
          }}
        >
          שחק · בנה · שלוט
        </div>

        {/* Decorative board color strip */}
        <div
          className="flex w-[min(520px,90vw)] h-2.5 mb-10 overflow-hidden animate-fade-up"
          style={{ animationDelay: '0.35s' }}
        >
          {BOARD_STRIP_COLORS.map((c, i) => (
            <div key={i} className="flex-1 h-full" style={{ background: c }} />
          ))}
        </div>

        {/* Player name pill */}
        {playerName && (
          <button
            onClick={() => setShowNamePrompt(true)}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors animate-fade-up"
            style={{
              background: 'rgba(201,168,76,0.04)',
              border: '1px solid rgba(201,168,76,0.2)',
              color: 'var(--color-cream)',
              animationDelay: '0.4s',
            }}
          >
            משחקים בשם <span className="font-semibold" style={{ color: 'var(--color-gold)' }}>{playerName}</span>
            <span className="text-xs opacity-50">· שנה</span>
          </button>
        )}

        {/* Main CTA */}
        <div
          className="flex flex-col items-center gap-3 animate-fade-up"
          style={{ animationDelay: '0.45s' }}
        >
          <button
            onClick={() => handleCreate()}
            disabled={creating}
            className="btn-skew relative overflow-hidden font-bold tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-50"
            style={{
              padding: '18px 64px',
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-l) 55%, var(--color-gold) 100%)',
              color: 'var(--color-navy)',
              boxShadow: '0 4px 28px rgba(201,168,76,0.45)',
            }}
          >
            ▶ &nbsp; {creating ? 'יוצר...' : 'צור משחק חדש'}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3.5 w-[min(360px,90vw)] my-5 animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.18)' }} />
          <div className="text-[0.72rem] tracking-[0.18em] whitespace-nowrap" style={{ color: 'var(--color-muted)' }}>
            או הצטרף עם קוד
          </div>
          <div className="flex-1 h-px" style={{ background: 'rgba(201,168,76,0.18)' }} />
        </div>

        {/* Join row */}
        <div
          className="flex w-[min(360px,90vw)] animate-fade-up"
          style={{ animationDelay: '0.55s' }}
          dir="ltr"
        >
          <button
            onClick={() => handleJoin()}
            disabled={joining || joinCode.trim().length !== 6}
            className="px-6 font-bold text-white text-sm transition-colors disabled:opacity-50"
            style={{
              background: 'var(--color-mono-red)',
              boxShadow: '0 4px 24px rgba(204,41,54,0.35)',
            }}
          >
            {joining ? '...' : 'הצטרף'}
          </button>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="הזן קוד"
            maxLength={6}
            className="flex-1 px-5 py-3.5 text-center uppercase tracking-[0.2em] outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderLeft: 'none',
              color: 'var(--color-cream)',
              fontFamily: 'var(--font-mono), monospace',
            }}
          />
        </div>

        {/* Feature pills */}
        <div
          className="flex flex-wrap gap-2.5 justify-center mt-5 animate-fade-up"
          style={{ animationDelay: '0.6s' }}
        >
          {['עד 6 שחקנים', 'מצב מהיר', 'שיתוף בקליק', 'בלי הרשמה'].map((label) => (
            <div
              key={label}
              className="text-[0.7rem] font-semibold tracking-wider px-3.5 py-1"
              style={{
                background: 'rgba(201,168,76,0.04)',
                border: '1px solid rgba(201,168,76,0.2)',
                color: 'var(--color-muted)',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-5 text-center text-sm" style={{ color: '#e84d5a' }}>{error}</p>
        )}
      </div>
    </div>
  )
}
