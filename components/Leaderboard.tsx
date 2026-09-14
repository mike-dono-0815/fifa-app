import type { Player } from '@/lib/tournament/types'
import { flagSrc, playerById } from '@/lib/tournament/helpers'

type Row = { key: string; label: React.ReactNode; value: number; display: string }

function LeaderboardShell({ title, rows, showBar = true }: { title: string; rows: Row[]; showBar?: boolean }) {
  if (!rows.length) return null
  const max = rows[0].value || 1
  return (
    <div className="rounded-fifa border border-border-subtle bg-surface p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">{title}</div>
      <div className="flex flex-col gap-1.5">
        {rows.map((row, i) => {
          const pct = Math.max(0, Math.round((row.value / max) * 100))
          return (
            <div key={row.key} className="flex items-center gap-2 text-sm">
              <span className="w-4 shrink-0 text-xs text-text-muted">{i + 1}</span>
              {row.label}
              <span className="ml-auto shrink-0 font-semibold text-text-primary">{row.display}</span>
              {showBar && (
                <div className="h-1 w-14 shrink-0 overflow-hidden rounded-full bg-input">
                  <div className="h-full bg-green-bright" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PlayerFlag({ countryCode }: { countryCode: string | null | undefined }) {
  return (
    <img
      src={flagSrc(countryCode)}
      alt=""
      className="h-3 w-4 shrink-0 rounded-sm object-cover"
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
            <span className="flex-1 truncate text-text-primary">{p?.name ?? '?'}</span>
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
            <span className="flex shrink-0 -space-x-1">
              <PlayerFlag countryCode={pA?.countryCode} />
              <PlayerFlag countryCode={pB?.countryCode} />
            </span>
            <span className="min-w-0 flex-1 truncate text-text-primary" title={`${pA?.name ?? '?'} & ${pB?.name ?? '?'}`}>
              {pA?.name ?? '?'} &amp; {pB?.name ?? '?'}
            </span>
          </>
        ),
      }
    })
  return <LeaderboardShell title={title} rows={rows} />
}

function matrixCellClass(kind: 'winrate' | 'h2h', value: number | { w: number; l: number }) {
  if (kind === 'winrate') {
    const wr = value as number
    if (wr >= 70) return 'bg-green-bright/20 text-green-bright'
    if (wr >= 55) return 'bg-green-mid/30 text-win'
    if (wr >= 45) return 'bg-input text-text-secondary'
    if (wr >= 30) return 'bg-loss/10 text-loss'
    return 'bg-loss/20 text-loss'
  }
  const { w, l } = value as { w: number; l: number }
  if (w > l) return 'bg-green-mid/30 text-win'
  if (l > w) return 'bg-loss/20 text-loss'
  return 'bg-input text-text-secondary'
}

export function WinRateMatrix({ players, partners, pairKey }: { players: Player[]; partners: Record<string, { gp: number; w: number }>; pairKey: (a: string, b: string) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-1 text-center text-xs">
        <thead>
          <tr>
            <th />
            {players.map((p) => (
              <th key={p.id} className="whitespace-nowrap px-1 text-text-secondary">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((pa) => (
            <tr key={pa.id}>
              <th className="whitespace-nowrap px-1 text-right text-text-secondary">{pa.name}</th>
              {players.map((pb) => {
                if (pa.id === pb.id) return <td key={pb.id} className="text-text-muted">—</td>
                const rec = partners[pairKey(pa.id, pb.id)]
                if (!rec || rec.gp === 0) return <td key={pb.id} className="text-text-muted">—</td>
                const wr = Math.round((rec.w / rec.gp) * 100)
                return (
                  <td key={pb.id}>
                    <span className={`inline-block rounded px-1.5 py-0.5 ${matrixCellClass('winrate', wr)}`}>{wr}%</span>
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
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-1 text-center text-xs">
        <thead>
          <tr>
            <th />
            {players.map((p) => (
              <th key={p.id} className="whitespace-nowrap px-1 text-text-secondary">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((pa) => (
            <tr key={pa.id}>
              <th className="whitespace-nowrap px-1 text-right text-text-secondary">{pa.name}</th>
              {players.map((pb) => {
                if (pa.id === pb.id) return <td key={pb.id} className="text-text-muted">—</td>
                const rec = h2h[pairKey(pa.id, pb.id)]?.[`${pa.id}_vs_${pb.id}`]
                if (!rec) return <td key={pb.id} className="text-text-muted">—</td>
                return (
                  <td key={pb.id}>
                    <span className={`inline-block rounded px-1.5 py-0.5 ${matrixCellClass('h2h', rec)}`}>
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
