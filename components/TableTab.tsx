import type { Game, Player } from '@/lib/tournament/types'
import { computeStandings } from '@/lib/tournament/standings'
import { computeStats } from '@/lib/tournament/stats'
import { flagSrc, playerById } from '@/lib/tournament/helpers'
import { AwardsGrid } from './AwardCard'

function Flag({ countryCode }: { countryCode: string | null | undefined }) {
  return (
    <img
      src={flagSrc(countryCode)}
      alt=""
      className="h-4 w-5.5 rounded-sm object-cover"
      onError={(e) => {
        e.currentTarget.style.opacity = '0'
      }}
    />
  )
}

function Podium({ players, standings }: { players: Player[]; standings: ReturnType<typeof computeStandings> }) {
  const [r1, r2, r3] = standings
  const [p1, p2, p3] = [r1, r2, r3].map((r) => playerById(players, r.id))
  const slot = (rank: 1 | 2 | 3, r: (typeof standings)[number], p: Player | undefined, colorClass: string, blockH: string) => (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className="flex flex-col items-center gap-1">
        {rank === 1 && <img src="/trophy_fa.png" alt="" className="h-8 w-8" />}
        <Flag countryCode={p?.countryCode} />
        <span className={`headline text-sm ${colorClass}`}>{p?.name ?? '?'}</span>
        <span className="text-xs text-text-muted">{r.pts} pts</span>
      </div>
      <div className={`flex w-full items-end justify-center rounded-t-fifa-sm ${blockH} ${colorClass === 'text-gold' ? 'bg-gold/20' : colorClass === 'text-silver' ? 'bg-silver/20' : 'bg-bronze/20'}`}>
        <span className={`headline pb-1 text-2xl ${colorClass}`}>{rank}</span>
      </div>
    </div>
  )
  return (
    <div className="flex items-end gap-2 rounded-fifa border border-border-subtle bg-surface p-4">
      {slot(2, r2, p2, 'text-silver', 'h-12')}
      {slot(1, r1, p1, 'text-gold', 'h-16')}
      {slot(3, r3, p3, 'text-bronze', 'h-10')}
    </div>
  )
}

function LeaderCard({ players, games, standings }: { players: Player[]; games: Game[]; standings: ReturnType<typeof computeStandings> }) {
  const r = standings[0]
  const p = playerById(players, r.id)
  const gd = r.gf - r.ga
  const gdStr = gd > 0 ? `+${gd}` : String(gd)
  const playerGames = games.filter((g) => g.confirmed && (g.teamA.includes(r.id) || g.teamB.includes(r.id)))
  let streak = 0
  for (let i = playerGames.length - 1; i >= 0; i--) {
    const g = playerGames[i]
    const inA = g.teamA.includes(r.id)
    const mine = inA ? g.scoreA : g.scoreB
    const theirs = inA ? g.scoreB : g.scoreA
    if (mine < theirs) break
    streak++
  }
  const streakStr = streak > 1 ? ` · ${streak}-game unbeaten` : ''
  return (
    <div className="flex items-center gap-3 rounded-fifa border border-border-subtle bg-surface p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-input">
        <Flag countryCode={p?.countryCode} />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-xs uppercase tracking-wide text-text-muted">Current Leader</span>
        <span className="text-sm font-semibold text-text-primary">{p?.name ?? '?'}</span>
        <span className="text-xs text-text-secondary">
          {r.w}W · {r.d}D · {r.l}L · {gdStr} GD{streakStr}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="headline text-xl text-green-bright">{r.pts}</span>
        <span className="text-[10px] uppercase text-text-muted">Points</span>
      </div>
    </div>
  )
}

export function TableTab({ players, games, finished }: { players: Player[]; games: Game[]; finished: boolean }) {
  const standings = computeStandings(players, games)
  const confirmed = games.filter((g) => g.confirmed)
  const roundDone = games.length > 0 && games.every((g) => g.confirmed)
  const stats = confirmed.length > 0 ? computeStats(players, games) : null

  return (
    <div className="flex flex-col gap-4">
      {roundDone && standings.length >= 3 ? (
        <Podium players={players} standings={standings} />
      ) : (
        <LeaderCard players={players} games={games} standings={standings} />
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-subtle text-left text-xs uppercase text-text-muted">
              <th className="py-2 pr-2">#</th>
              <th className="pr-2" />
              <th className="pr-2">Player</th>
              <th className="px-1 text-center">GP</th>
              <th className="px-1 text-center">W</th>
              <th className="px-1 text-center">D</th>
              <th className="px-1 text-center">L</th>
              <th className="px-1 text-center">GF</th>
              <th className="px-1 text-center">GA</th>
              <th className="px-1 text-center">GD</th>
              <th className="pl-1 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((r, i) => {
              const p = playerById(players, r.id)
              const gd = r.gf - r.ga
              return (
                <tr key={r.id} className={`border-b border-border-subtle/50 ${i < 3 ? 'bg-raised/40' : ''}`}>
                  <td className="py-2 pr-2 text-text-muted">{i + 1}</td>
                  <td className="pr-2">
                    <Flag countryCode={p?.countryCode} />
                  </td>
                  <td className="pr-2 font-medium text-text-primary">{p?.name ?? '?'}</td>
                  <td className="px-1 text-center text-text-secondary">{r.gp}</td>
                  <td className="px-1 text-center text-text-secondary">{r.w}</td>
                  <td className="px-1 text-center text-text-secondary">{r.d}</td>
                  <td className="px-1 text-center text-text-secondary">{r.l}</td>
                  <td className="px-1 text-center text-text-secondary">{r.gf}</td>
                  <td className="px-1 text-center text-text-secondary">{r.ga}</td>
                  <td className={`px-1 text-center ${gd > 0 ? 'text-win' : gd < 0 ? 'text-loss' : 'text-text-secondary'}`}>{gd > 0 ? `+${gd}` : gd}</td>
                  <td className="pl-1 text-center font-semibold text-text-primary">{r.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {stats && (
        <>
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{finished ? 'Game Log' : 'Current Form'}</div>
            {standings.map((r) => {
              const p = playerById(players, r.id)
              const results = stats.ps[r.id]?.gameResults ?? []
              const shown = finished ? results : results.slice(-10)
              const st = stats.streaks[r.id]
              let color = 'var(--color-draw)'
              let streakStr = ''
              if (finished) {
                color = 'var(--color-win)'
                streakStr = st?.longestW ? `${st.longestW} W streak (best)` : ''
              } else {
                color = st?.type === 'W' ? 'var(--color-win)' : st?.type === 'L' ? 'var(--color-loss)' : 'var(--color-draw)'
                const label = st?.type === 'W' ? 'W streak' : st?.type === 'L' ? 'L streak' : 'game unbeaten'
                streakStr = st?.current ? `${st.current} ${label}` : ''
              }
              return (
                <div key={r.id} className="flex items-center gap-2 text-sm">
                  <Flag countryCode={p?.countryCode} />
                  <span className="w-20 shrink-0 truncate text-text-primary">{p?.name ?? '?'}</span>
                  <div className="flex gap-0.5">
                    {shown.map((res, i) => (
                      <span
                        key={i}
                        className={`flex h-4 w-4 items-center justify-center rounded-[3px] text-[9px] font-bold ${
                          res === 'W' ? 'bg-win/20 text-win' : res === 'L' ? 'bg-loss/20 text-loss' : 'bg-draw/20 text-draw'
                        }`}
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                  {streakStr && (
                    <span className="ml-auto text-xs" style={{ color }}>
                      {streakStr}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Awards</div>
            <AwardsGrid awards={stats.awards} streaks={stats.streaks} otGamesCount={stats.otGames.length} players={players} />
          </div>
        </>
      )}
    </div>
  )
}
