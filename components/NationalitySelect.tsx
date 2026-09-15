'use client'

import { useEffect, useRef, useState } from 'react'
import { ALL_NATIONS, PINNED_NATIONS, TOP_NATIONS, type Country } from '@/lib/countries'
import { flagSrc } from '@/lib/tournament/helpers'

function restOfTop(): Country[] {
  return TOP_NATIONS.filter((t) => !PINNED_NATIONS.some((p) => p.code === t.code))
}
function restOfAll(): Country[] {
  return ALL_NATIONS.filter(
    (a) => !TOP_NATIONS.some((t) => t.code === a.code) && !PINNED_NATIONS.some((p) => p.code === a.code)
  )
}

const GROUPS: { label: string; items: Country[] }[] = [
  { label: 'Pinned', items: PINNED_NATIONS },
  { label: 'Top nations', items: restOfTop() },
  { label: 'All nations', items: restOfAll() },
]
const ALL_LOOKUP = [...PINNED_NATIONS, ...TOP_NATIONS, ...ALL_NATIONS]

export function NationalitySelect({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: (code: string, name: string) => void
  error?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = ALL_LOOKUP.find((c) => c.code === value)

  return (
    <div ref={ref} className="relative w-36 flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-1.5 rounded-fifa-sm bg-input px-2 py-1.5 text-sm text-text-primary outline-none border ${
          error ? 'border-loss' : 'border-transparent'
        }`}
      >
        {selected ? (
          <>
            <img src={flagSrc(selected.code)} alt="" className="h-3.5 w-5 flex-shrink-0 rounded-sm object-cover" />
            <span className="truncate">{selected.name}</span>
          </>
        ) : (
          <span className="text-text-muted">Nationality…</span>
        )}
        <span className="ml-auto flex-shrink-0 text-text-muted">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-56 overflow-y-auto rounded-fifa-sm border border-border-mid bg-raised py-1 shadow-lg">
          {GROUPS.map((g) => (
            <div key={g.label}>
              <div className="px-2 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                {g.label}
              </div>
              {g.items.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onChange(c.code, c.name)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-surface ${
                    c.code === value ? 'text-green-bright' : 'text-text-primary'
                  }`}
                >
                  <img src={flagSrc(c.code)} alt="" className="h-3.5 w-5 flex-shrink-0 rounded-sm object-cover" />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
