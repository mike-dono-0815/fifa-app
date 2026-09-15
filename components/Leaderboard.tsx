import type { Player } from '@/lib/tournament/types'
import { flagSrc, playerById } from '@/lib/tournament/helpers'

type Row = { key: string; label: React.ReactNode; value: number; display: string }

function LeaderboardShell({ title, rows, showBar = true }: { title: string; rows: Row[]; showBar?: boolean }) {
  if (!rows.length) return null
  const max = rows[0].value || 1
  return (
    <div className="print-avoid-break overflow-hidden rounded-fifa border border-border-subtle bg-surface">
      <div className="font-headline border-b border-border-subtle bg-raised px-3.5 py-2.5 text-sm font-bold uppercase tracking-wide text-text-secondary">
        {title}
      </div>
      {rows.map((row, i) => {
        const pct = Math.max(0, Math.round((row.value / max) * 100))
        return (
          <div
            key={row.key}
            className={`flex items-center gap-2.5 px-3.5 py-2 ${i < rows.length - 1 ? 'border-b border-border-subtle' : ''}`}
          >
            <span className={`font-headline w-[22px] shrink-0 text-lg font-extrabold ${i === 0 ? 'text-gold' : 'text-text-muted'}`}>
              {i + 1}
            </span>
            {row.label}
            <span className="font-headline ml-auto shrink-0 text-lg font-extrabold text-text-primary">{row.display}</span>
            {showBar && (
              <div className="h-1 w-20 shrink-0 overflow-hidden rounded-sm bg-input">
                <div className="h-full rounded-sm bg-[linear-gradient(90deg,var(--color-blue-neon),var(--color-purple))]" style={{ width: `${pct}%` }} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function PlayerFlag({ countryCode }: { countryCode: string | null | undefined }) {
  return (
    <img
      src={flagSrc(countryCode)}
      alt=""
      className="h-[15px] w-[22px] shrink-0 rounded-sm object-cover"
      onError={(e) => {
        e.currentTarget.style.opacity = '0'
      }}
    />
  )
}

export function Leaderboard<T extends { id: string }>({
  title,
  data,
  players,
  valFn,
  fmtFn,
  showBar = true,
}: {
  title: string
  data: T[]
  players: Player[]
  valFn: (t: T) => number
  fmtFn?: (t: T, v: number) => string
  showBar?: boolean
}) {
  const rows: Row[] = [...data]
    .sort((a, b) => valFn(b) - valFn(a))
    .map((item) => {
      const p = playerById(players, item.id)
      const value = valFn(item)
      return {
        key: item.id,
        value,
        display: fmtFn ? fmtFn(item, value) : String(value),
        label: (
          <>
            <PlayerFlag countryCode={p?.countryCode} />
            <span className="font-headline flex-1 truncate text-sm font-bold uppercase text-text-primary">{p?.name ?? '?'}</span>
          </>
        ),
      }
    })
  return <LeaderboardShell title={title} rows={rows} showBar={showBar} />
}

export function PartnerLeaderboard<T extends { key: string }>({
  title,
  data,
  players,
  valFn,
  fmtFn,
}: {
  title: string
  data: T[]
  players: Player[]
  valFn: (t: T) => number
  fmtFn?: (t: T, v: number) => string
}) {
  const rows: Row[] = [...data]
    .sort((a, b) => valFn(b) - valFn(a))
    .map((item) => {
      const [idA, idB] = item.key.split('|')
      const pA = playerById(players, idA)
      const pB = playerById(players, idB)
      const value = valFn(item)
      return {
        key: item.key,
        value,
        display: fmtFn ? fmtFn(item, value) : String(value),
        label: (
          <>
            <span className="flex shrink-0 gap-0.5">
              <PlayerFlag countryCode={pA?.countryCode} />
              <PlayerFlag countryCode={pB?.countryCode} />
            </span>
            <span
              className="font-headline min-w-0 flex-1 truncate text-sm font-bold uppercase text-text-primary"
              title={`${pA?.name ?? '?'} & ${pB?.name ?? '?'}`}
            >
              {pA?.name ?? '?'} &amp; {pB?.name ?? '?'}
            </span>
          </>
        ),
      }
    })
  return <LeaderboardShell title={title} rows={rows} />
}

function matrixCellClass(kind: 'winrate', value: number): string
function matrixCellClass(kind: 'h2h', value: { w: number; l: number }): string
function matrixCellClass(kind: 'winrate' | 'h2h', value: number | { w: number; l: number }) {
  if (kind === 'winrate') {
    const wr = value as number
    if (wr >= 70) return 'bg-[rgba(0,230,118,.2)] text-green-bright'
    if (wr >= 55) return 'bg-[rgba(0,230,118,.1)] text-[#6ee7b7]'
    if (wr >= 45) return 'text-text-secondary'
    if (wr >= 30) return 'bg-[rgba(255,77,77,.1)] text-[#fca5a5]'
    return 'bg-[rgba(255,77,77,.2)] text-loss'
  }
  const { w, l } = value as { w: number; l: number }
  if (w > l) return 'bg-[rgba(0,230,118,.15)] text-green-bright'
  if (l > w) return 'bg-[rgba(255,77,77,.15)] text-loss'
  return 'text-text-secondary'
}

const thClass = 'font-headline whitespace-nowrap border border-border-subtle bg-raised px-2.5 py-1.5 font-bold uppercase text-text-secondary'
const tdClass = 'whitespace-nowrap border border-border-subtle px-2.5 py-1.5 text-center'

export function WinRateMatrix({ players, partners, pairKey }: { players: Player[]; partners: Record<string, { gp: number; w: number }>; pairKey: (a: string, b: string) => string }) {
  return (
    <div className="print-avoid-break overflow-x-auto">
      <table className="border-collapse text-[0.85rem]">
        <thead>
          <tr>
            <th className={thClass} />
            {players.map((p) => (
              <th key={p.id} className={thClass}>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((pa) => (
            <tr key={pa.id}>
              <th className={thClass}>{pa.name}</th>
              {players.map((pb) => {
                if (pa.id === pb.id) return <td key={pb.id} className={`${tdClass} bg-void text-text-muted`}>—</td>
                const rec = partners[pairKey(pa.id, pb.id)]
                if (!rec || rec.gp === 0) return <td key={pb.id} className={tdClass}>—</td>
                const wr = Math.round((rec.w / rec.gp) * 100)
                return (
                  <td key={pb.id} className={tdClass}>
                    <span className={`inline-block rounded px-1.5 py-0.5 font-semibold ${matrixCellClass('winrate', wr)}`}>{wr}%</span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function H2HMatrix({
  players,
  h2h,
  pairKey,
}: {
  players: Player[]
  h2h: Record<string, Record<string, { w: number; d: number; l: number }>>
  pairKey: (a: string, b: string) => string
}) {
  return (
    <div className="print-avoid-break overflow-x-auto">
      <table className="border-collapse text-[0.85rem]">
        <thead>
          <tr>
            <th className={thClass} />
            {players.map((p) => (
              <th key={p.id} className={thClass}>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((pa) => (
            <tr key={pa.id}>
              <th className={thClass}>{pa.name}</th>
              {players.map((pb) => {
                if (pa.id === pb.id) return <td key={pb.id} className={`${tdClass} bg-void text-text-muted`}>—</td>
                const rec = h2h[pairKey(pa.id, pb.id)]?.[`${pa.id}_vs_${pb.id}`]
                if (!rec) return <td key={pb.id} className={tdClass}>—</td>
                return (
                  <td key={pb.id} className={tdClass}>
                    <span className={`inline-block rounded px-1.5 py-0.5 font-semibold ${matrixCellClass('h2h', rec)}`}>
                      {rec.w}–{rec.d}–{rec.l}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
