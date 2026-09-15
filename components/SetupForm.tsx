'use client'

import { useState, useTransition } from 'react'
import { flagSrc } from '@/lib/tournament/helpers'
import { createTournament, type NewPlayerInput } from '@/lib/tournament/actions'
import { NationalitySelect } from './NationalitySelect'

type DraftPlayer = { id: string; name: string; countryCode: string; countryName: string }

const MIN_PLAYERS = 4
const MAX_PLAYERS = 8
const DEFAULT_PLAYERS = 5

function comb(n: number, k: number): number {
  if (k > n) return 0
  let r = 1
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1)
  return Math.round(r)
}

function makeDraftId() {
  return Math.random().toString(36).slice(2, 10)
}

export function SetupForm() {
  const [draftPlayers, setDraftPlayers] = useState<DraftPlayer[]>(() =>
    Array.from({ length: DEFAULT_PLAYERS }, () => ({ id: makeDraftId(), name: '', countryCode: '', countryName: '' }))
  )
  const [errors, setErrors] = useState<Record<string, { name?: boolean; country?: boolean }>>({})
  const [isPending, startTransition] = useTransition()

  const n = draftPlayers.length
  const gamesPerRound = n >= 4 ? 3 * comb(n, 4) : 0
  const note =
    n < MIN_PLAYERS
      ? `Need at least ${MIN_PLAYERS} players for 2v2.`
      : `${n} players → ${gamesPerRound} games${n >= 7 ? ' (long session!)' : ''}`

  function addPlayer() {
    if (draftPlayers.length >= MAX_PLAYERS) return
    setDraftPlayers((ps) => [...ps, { id: makeDraftId(), name: '', countryCode: '', countryName: '' }])
  }

  function removePlayer(id: string) {
    if (draftPlayers.length <= MIN_PLAYERS) return
    setDraftPlayers((ps) => ps.filter((p) => p.id !== id))
  }

  function updateName(id: string, raw: string) {
    const cleaned = raw.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 10)
    setDraftPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, name: cleaned } : p)))
  }

  function updateCountry(id: string, code: string, name: string) {
    setDraftPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, countryCode: code, countryName: name } : p)))
  }

  function handleGenerate() {
    const nextErrors: typeof errors = {}
    let valid = true
    for (const p of draftPlayers) {
      const e: { name?: boolean; country?: boolean } = {}
      if (!p.name.trim()) {
        e.name = true
        valid = false
      }
      if (!p.countryCode) {
        e.country = true
        valid = false
      }
      if (e.name || e.country) nextErrors[p.id] = e
    }
    setErrors(nextErrors)
    if (!valid) return

    const input: NewPlayerInput[] = draftPlayers.map((p) => ({
      name: p.name.trim(),
      countryCode: p.countryCode,
      countryName: p.countryName,
    }))
    startTransition(() => {
      createTournament(input)
    })
  }

  return (
    <div className="w-full max-w-xl rounded-fifa border border-border-subtle bg-surface p-4 sm:p-6">
      <p className="text-xs uppercase tracking-wide text-text-muted mb-3">Players</p>
      <div className="flex flex-col gap-2">
        {draftPlayers.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-fifa-sm bg-raised p-2">
            <img
              src={flagSrc(p.countryCode || null)}
              alt=""
              className="h-6 w-8 flex-shrink-0 rounded-sm object-cover"
              onError={(e) => {
                e.currentTarget.style.opacity = '0'
              }}
            />
            <input
              value={p.name}
              onChange={(e) => updateName(p.id, e.target.value)}
              placeholder="Name"
              className={`min-w-0 flex-1 rounded-fifa-sm bg-input px-2 py-1.5 text-sm text-text-primary outline-none border ${
                errors[p.id]?.name ? 'border-loss' : 'border-transparent'
              }`}
            />
            <NationalitySelect
              value={p.countryCode}
              onChange={(code, name) => updateCountry(p.id, code, name)}
              error={errors[p.id]?.country}
            />
            <button
              type="button"
              onClick={() => removePlayer(p.id)}
              disabled={draftPlayers.length <= MIN_PLAYERS}
              className="flex-shrink-0 rounded-fifa-sm px-2 py-1.5 text-text-muted disabled:opacity-30 hover:text-loss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={addPlayer}
          disabled={draftPlayers.length >= MAX_PLAYERS}
          className="rounded-fifa-sm border border-border-mid px-3 py-2 text-sm text-text-primary disabled:opacity-30"
        >
          + Add Player
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="flex-1 rounded-fifa-sm bg-green-bright px-3 py-2 text-sm font-semibold text-void disabled:opacity-60"
        >
          {isPending ? 'Generating…' : 'Generate Tournament'}
        </button>
      </div>
      <p className={`mt-2 text-xs ${n >= 7 ? 'text-[#ffb74d]' : 'text-text-muted'}`}>{note}</p>
    </div>
  )
}
