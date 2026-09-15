import type { Game, Player } from '@/lib/tournament/types'
import { computeStandings } from '@/lib/tournament/standings'
import { computeStats } from '@/lib/tournament/stats'
import { flagSrc, playerById } from '@/lib/tournament/helpers'
import { AwardsGrid } from './AwardCard'

function Flag({ countryCode, className }: { countryCode: string | null | undefined; className: string }) {
  return (
    <img
      src={flagSrc(countryCode)}
      alt=""
      className={`rounded-sm object-cover ${className}`}
      onError={(e) => {
        e.currentTarget.style.opacity = '0'
      }}
    />
  )
}

const podiumBlock: Record<1 | 2 | 3, { h: string; fontSize: string; color: string; bg: string; borderTop: string; shadow?: string }> = {
  1: { h: 'h-20', fontSize: 'text-4xl', color: 'text-gold', bg: 'bg-[linear-gradient(180deg,#1e1600,#0e0a00)]', borderTop: 'border-t-2 border-gold-dim', shadow: 'shadow-[0_-6px_24px_rgba(255,215,0,.2)]' },
  2: { h: 'h-14', fontSize: 'text-3xl', color: 'text-silver', bg: 'bg-[linear-gradient(180deg,#181820,#0d0d14)]', borderTop: 'border-t-2 border-[#777]' },
  3: { h: 'h-10', fontSize: 'text-2xl', color: 'text-bronze', bg: 'bg-[linear-gradient(180deg,#1a1008,#0e0804)]', borderTop: 'border-t-2 border-[#8b5e3c]' },
}
const podiumName: Record<1 | 2 | 3, string> = { 1: 'text-gold', 2: 'text-silver', 3: 'text-bronze' }

function Podium({ players, standings }: { players: Player[]; standings: ReturnType<typeof computeStandings> }) {
  const [r1, r2, r3] = standings
  const [p1, p2, p3] = [r1, r2, r3].map((r) => playerById(players, r.id))
  const slot = (rank: 1 | 2 | 3, r: (typeof standings)[number], p: Player | undefined) => {
    const b = podiumBlock[rank]
    return (
      <div className="flex max-w-[160px] flex-1 flex-col items-center">
        <div className="flex w-full flex-col items-center gap-1.5 pb-2.5">
          {rank === 1 && (
            <img
              src="/trophy_fa.png"
              alt=""
              className="mb-0.5 h-[52px] w-auto [filter:brightness(2)_sepia(.35)_saturate(3)_hue-rotate(-10deg)_drop-shadow(0_0_18px_rgba(255,215,0,.55))]"
            />
          )}
          <Flag countryCode={p?.countryCode} className="h-[22px] w-8" />
          <span className={`font-headline text-center text-lg font-extrabold uppercase leading-none tracking-wide ${podiumName[rank]}`}>
            {p?.name ?? '?'}
          </span>
          <span className="font-mono text-xs leading-none text-text-secondary">{r.pts} pts</span>
        </div>
        <div className={`flex w-full items-center justify-center rounded-t ${b.h} ${b.bg} ${b.borderTop} ${b.shadow ?? ''}`}>
          <span className={`font-headline italic leading-none ${b.fontSize} ${b.color}`}>{rank}</span>
        </div>
      </div>
    )
  }
  return (
    <div className="print-avoid-break mb-4 flex items-end justify-center gap-1 pt-1">
      {slot(2, r2, p2)}
      {slot(1, r1, p1)}
      {slot(3, r3, p3)}
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
    <div className="print-avoid-break mb-3 flex items-center gap-4.5 rounded-fifa border border-border-subtle bg-surface p-3.5 sm:p-5">
      <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-full border-[2.5px] border-green-bright shadow-[0_0_10px_rgba(0,230,118,.35)]">
        <img
          src={flagSrc(p?.countryCode)}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.opacity = '0'
          }}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="font-headline text-xs font-bold uppercase tracking-[.16em] text-green-bright">Current Leader</span>
        <span className="font-headline truncate text-2xl font-black italic uppercase leading-tight text-text-primary sm:text-3xl">
          {p?.name ?? '?'}
        </span>
        <span className="mt-1 whitespace-nowrap font-mono text-xs text-text-secondary">
          {r.w}W · {r.d}D · {r.l}L · {gdStr} GD{streakStr}
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-center">
        <span className="font-headline text-4xl font-black italic leading-none text-green-bright sm:text-5xl">{r.pts}</span>
        <span className="font-headline text-[0.7rem] font-bold uppercase tracking-[.16em] text-text-muted">Points</span>
      </div>
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-headline mb-3.5 border-b border-border-subtle pb-2 text-xl font-extrabold uppercase tracking-wide text-text-secondary">
      {children}
    </div>
  )
}

export function TableTab({ players, games, finished }: { players: Player[]; games: Game[]; finished: boolean }) {
  const standings = computeStandings(players, games)
  const confirmed = games.filter((g) => g.confirmed)
  const roundDone = games.length > 0 && games.every((g) => g.confirmed)
  const stats = confirmed.length > 0 ? computeStats(players, games) : null

  return (
    <div className="flex flex-col">
      {roundDone && standings.length >= 3 ? (
        <Podium players={players} standings={standings} />
      ) : (
        <LeaderCard players={players} games={games} standings={standings} />
      )}

      <div className="print-avoid-break overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              {['#', '', 'Player', 'GP', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map((h, i) => (
                <th
                  key={i}
                  className={`font-headline border-b border-border-subtle bg-[rgba(8,10,15,.9)] px-3 py-2.5 text-[0.82rem] font-bold uppercase tracking-[.1em] text-text-secondary backdrop-blur-sm ${
                    i < 3 ? 'text-left' : 'text-right'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((r, i) => {
              const p = playerById(players, r.id)
              const gd = r.gf - r.ga
              const rank = i + 1
              return (
                <tr
                  key={r.id}
                  className={`border-b border-border-subtle transition hover:bg-raised ${
                    i % 2 === 1 ? 'bg-white/[0.02]' : ''
                  } ${rank === 1 ? 'shadow-[inset_4px_0_16px_rgba(255,215,0,.2)]' : ''}`}
                >
                  <td
                    className={`font-headline px-3 py-2.5 text-left text-2xl font-black ${
                      rank === 1 ? 'text-gold' : rank === 2 ? 'text-silver' : rank === 3 ? 'text-bronze' : 'text-text-muted'
                    }`}
                  >
                    {rank}
                  </td>
                  <td className="px-3 py-2.5 text-left">
                    <Flag countryCode={p?.countryCode} className="h-4 w-6" />
                  </td>
                  <td className="font-headline px-3 py-2.5 text-left text-base font-bold uppercase tracking-wide text-text-primary">
                    {p?.name ?? '?'}
                  </td>
                  <td className="px-3 py-2.5 text-right text-text-secondary">{r.gp}</td>
                  <td className="px-3 py-2.5 text-right text-text-secondary">{r.w}</td>
                  <td className="px-3 py-2.5 text-right text-text-secondary">{r.d}</td>
                  <td className="px-3 py-2.5 text-right text-text-secondary">{r.l}</td>
                  <td className="px-3 py-2.5 text-right text-text-secondary">{r.gf}</td>
                  <td className="px-3 py-2.5 text-right text-text-secondary">{r.ga}</td>
                  <td className={`px-3 py-2.5 text-right ${gd > 0 ? 'text-win' : gd < 0 ? 'text-loss' : 'text-text-secondary'}`}>
                    {gd > 0 ? `+${gd}` : gd}
                  </td>
                  <td className="font-headline px-3 py-2.5 text-right text-lg font-extrabold text-green-bright">{r.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {stats && (
        <>
          <div className="mt-6 flex flex-col">
            <SectionTitle>{finished ? 'Game Log' : 'Current Form'}</SectionTitle>
            {standings.map((r) => {
              const p = playerById(players, r.id)
              const results = stats.ps[r.id]?.gameResults ?? []
              const shown = finished ? results : results.slice(-10)
              const padded = finished ? shown : [...Array(Math.max(0, 10 - shown.length)).fill('empty'), ...shown]
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
                <div key={r.id} className="flex items-center gap-2 border-b border-border-subtle py-1.5">
                  <Flag countryCode={p?.countryCode} className="h-[18px] w-[26px] shrink-0" />
                  <span className="font-headline min-w-[70px] shrink-0 truncate text-base font-bold uppercase tracking-wide text-text-primary">
                    {p?.name ?? '?'}
                  </span>
                  <div className="flex flex-1 flex-wrap gap-[3px]">
                    {padded.map((res, i) => (
                      <span
                        key={i}
                        className={`font-headline flex h-5 w-5 items-center justify-center rounded text-xs font-extrabold ${
                          res === 'W'
                            ? 'bg-[rgba(0,230,118,.2)] text-win'
                            : res === 'L'
                              ? 'bg-[rgba(255,77,77,.2)] text-loss'
                              : res === 'D'
                                ? 'bg-[rgba(0,180,255,.15)] text-draw'
                                : 'bg-raised'
                        }`}
                      >
                        {res === 'empty' ? '' : res}
                      </span>
                    ))}
                  </div>
                  <span className="font-headline min-w-[76px] shrink-0 whitespace-nowrap text-right text-sm font-bold" style={{ color }}>
                    {streakStr}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-6 flex flex-col">
            <SectionTitle>Awards</SectionTitle>
            <AwardsGrid awards={stats.awards} streaks={stats.streaks} otGamesCount={stats.otGames.length} players={players} />
          </div>
        </>
      )}
    </div>
  )
}
