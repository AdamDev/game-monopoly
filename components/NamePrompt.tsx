'use client'

import { useState } from 'react'

interface NamePromptProps {
  onSubmit: (name: string) => void
  onCancel?: () => void
  title?: string
  subtitle?: string
  defaultValue?: string
  submitLabel?: string
}

export default function NamePrompt({
  onSubmit,
  onCancel,
  title = 'הזינו את שמכם',
  subtitle = 'בחרו שם תצוגה למשחק',
  defaultValue = '',
  submitLabel = 'המשך',
}: NamePromptProps) {
  const [name, setName] = useState(defaultValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length >= 2 && trimmed.length <= 20) {
      onSubmit(trimmed)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur"
      style={{ background: 'rgba(5,12,22,0.88)' }}
    >
      <div
        className="w-full max-w-sm p-7 mx-4 animate-fade-up"
        style={{
          background: 'var(--color-navy2)',
          border: '1px solid rgba(201,168,76,0.22)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(201,168,76,0.06)',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
            opacity: 0.5,
          }}
        />
        <h2
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--color-gold)' }}
        >
          {title}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="השם שלכם..."
            maxLength={20}
            autoFocus
            className="w-full px-4 py-3 outline-none transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(201,168,76,0.25)',
              color: 'var(--color-cream)',
              fontFamily: 'var(--font-heebo), sans-serif',
              fontSize: '1.05rem',
              fontWeight: 600,
            }}
          />
          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 text-sm font-medium transition-colors"
                style={{
                  background: 'transparent',
                  color: 'var(--color-cream)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                ביטול
              </button>
            )}
            <button
              type="submit"
              disabled={name.trim().length < 2}
              className="btn-skew flex-1 py-3 font-bold tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-l) 55%, var(--color-gold) 100%)',
                color: 'var(--color-navy)',
                boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
              }}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
