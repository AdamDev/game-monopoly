'use client'

import { useState } from 'react'

interface NamePromptProps {
  onSubmit: (name: string) => void
  title?: string
  subtitle?: string
}

export default function NamePrompt({
  onSubmit,
  title = 'הזינו את שמכם',
  subtitle = 'בחרו שם תצוגה למשחק',
}: NamePromptProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length >= 2 && trimmed.length <= 20) {
      onSubmit(trimmed)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-mono-card border border-mono-border p-8">
        <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
        <p className="text-sm text-zinc-400 mb-6">{subtitle}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="השם שלכם..."
            maxLength={20}
            autoFocus
            className="w-full rounded-xl bg-mono-bg border border-mono-border px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={name.trim().length < 2}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            המשך
          </button>
        </form>
      </div>
    </div>
  )
}
