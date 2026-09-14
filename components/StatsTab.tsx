import type { Game, Player } from '@/lib/tournament/types'
import { computeStats } from '@/lib/tournament/stats'
import { flagSrc, pairKey, playerName } from '@/lib/tournament/helpers'
import { AwardsGrid } from './AwardCard'
import { H2HMatrix, Leaderboard, PartnerLeaderboard, WinRateMatrix } from './Leaderboard'

function StatCard({ value, label, sub, color, wide }: { value: React.ReactNode; label: string; sub?: string; color?: string; wide?: boolean }) {
  return (
    <div className={`rounded-fifa border border-border-subtle bg-surface p-3 ${wide ? 'col-span-2' : ''}`}>
      <div className={`text-lg font-semibold ${wide ? 'text-base' : ''}`} style={color ? { color } : undefined}>
        {value}
      </div>
      <div className="text-xs text-text-muted">{label}</div>
      {sub && <div className="text-xs text-text-secondary">{sub}</div>}
    </div>
  )
}

function Section({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{title}</div>
      {note && <div className="text-xs text-text-secondary">{note}</div>}
      {children}
    </div>
  )
}

export function StatsTab({ players, games }: { players: Player[]; games: Game[] }) {
  const confirmed = games.filter((g) => g.confirmed)
  if (confirmed.length === 0) {
    return <div className="py-8 text-center text-sm text-text-muted">Play some games first — stats will appear here.</div>
  }

  const { overview, ps, streaks, partners, h2h, awards, otGames } = computeStats(players, games)
  const pList = Object.values(ps).filter((p) => p.gp > 0)
  const pStats = Object.entries(partners)
    .filter(([, v]) => v.gp > 0)
    .map(([key, v]) => ({ key, ...v }))
  const n = (ids: [string, string]) => ids.map((id) => playerName(players, id)).join(' & ')

  const highestGameDesc = overview.highestGame
    ? `${n(overview.highestGame.teamA)} ${overview.highestGame.scoreA}–${overview.highestGame.scoreB} ${n(overview.highestGame.teamB)} (${overview.highestGame.scoreA + overview.highestGame.scoreB} goals)`
    : '—'

  let biggestWinDesc = '—'
  if (overview.biggestWin) {
    const g = overview.biggestWin
    const aWins = g.scoreA >= g.scoreB
    const winner = aWins ? g.teamA : g.teamB
    const loser = aWins ? g.teamB : g.teamA
    const ws = aWins ? g.scoreA : g.scoreB
    const ls = aWins ? g.scoreB : g.scoreA
    biggestWinDesc = `${n(winner)} ${ws}–${ls} ${n(loser)} (+${ws - ls})`
  }

  const streakData = players.map((p) => ({ id: p.id, ...streaks[p.id] }))
  const fmtPct = (_: unknown, v: number) => `${Math.round(v * 100)}%`
  const fmtDec = (_: unknown, v: number) => v.toFixed(2)
  const fmtSigned = (_: unknown, v: number) => (v > 0 ? `+${v}` : String(v))

  return (
    <div className="flex flex-col gap-6">
      <Section title="Tournament Overview">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard value={overview.totalGoals} label="Total Goals" />
          <StatCard value={overview.avgGoals} label="Goals / Game" />
          <StatCard value={overview.N} label="Games Played" />
          <StatCard value={overview.draws} label="Draws" />
          <StatCard value={otGames.length} label="Total Overtimes" color="var(--color-purple)" />
          <StatCard value={`${overview.topScorelineCount}×`} label="Most Common Score" sub={overview.topScoreline} />
          <StatCard value={highestGameDesc} label="Highest Scoring Game" wide />
          <StatCard value={biggestWinDesc} label="Biggest Win" wide />
        </div>
      </Section>

      <Section title="Attacking">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          <Leaderboard title="Total Goals Scored" data={pList} players={players} valFn={(p) => p.gf} />
          <Leaderboard title="Goals per Game (min 3 games)" data={pList.filter((p) => p.gp >= 3)} players={players} valFn={(p) => +(p.gf / p.gp).toFixed(2)} fmtFn={fmtDec} />
          <Leaderboard title="Most Goals in One Game" data={pList} players={players} valFn={(p) => p.bestSingleGF} />
        </div>
      </Section>

      <Section title="Defensive">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          <Leaderboard title="Most Goals Conceded" data={pList} players={players} valFn={(p) => p.ga} />
          <Leaderboard
            title="Fewest GA per Game (min 3 games)"
            data={pList.filter((p) => p.gp >= 3)}
            players={players}
            valFn={(p) => -(p.ga / p.gp)}
            fmtFn={(p) => (p.ga / p.gp).toFixed(2)}
            showBar={false}
          />
          <Leaderboard title="Most Clean Sheets" data={pList} players={players} valFn={(p) => p.cleanSheets} />
          <Leaderboard title="Most Goals Conceded in One Game" data={pList} players={players} valFn={(p) => p.bestSingleGA} />
        </div>
      </Section>

      <Section title="Performance">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          <Leaderboard title="Win Rate" data={pList.filter((p) => p.gp >= 3)} players={players} valFn={(p) => (p.gp ? p.w / p.gp : 0)} fmtFn={fmtPct} />
          <Leaderboard title="Most Wins" data={pList} players={players} valFn={(p) => p.w} />
          <Leaderboard title="Best Goal Difference" data={pList} players={players} valFn={(p) => p.gf - p.ga} fmtFn={fmtSigned} />
          <Leaderboard title="Most Points" data={pList} players={players} valFn={(p) => p.pts} />
          <Leaderboard title="Points per Game (min 3 games)" data={pList.filter((p) => p.gp >= 3)} players={players} valFn={(p) => +(p.pts / p.gp).toFixed(2)} fmtFn={fmtDec} />
          <Leaderboard title="Biggest Single Win" data={pList} players={players} valFn={(p) => p.bestWinDiff} fmtFn={(p) => `+${p.bestWinDiff}`} />
          <Leaderboard title="Worst Single Defeat" data={pList} players={players} valFn={(p) => p.worstLossDiff} fmtFn={(p) => `-${p.worstLossDiff}`} />
          <Leaderboard title="Most Narrow Wins (1-goal margin)" data={pList} players={players} valFn={(p) => p.narrowWins} />
          <Leaderboard title="Most Draws" data={pList} players={players} valFn={(p) => p.d} />
          <Leaderboard title="Most Games Played" data={pList} players={players} valFn={(p) => p.gp} />
        </div>
      </Section>

      <Section title="Streaks & Form">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <Leaderboard title="Longest Winning Streak Ever" data={streakData} players={players} valFn={(p) => p.longestW ?? 0} />
          <Leaderboard title="Longest Losing Streak Ever" data={streakData} players={players} valFn={(p) => p.longestL ?? 0} />
          <Leaderboard title="Longest Unbeaten Streak Ever" data={streakData} players={players} valFn={(p) => p.longestUnbeaten ?? 0} />
        </div>
        <div className="rounded-fifa border border-border-subtle bg-surface p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Current Form</div>
          <div className="flex flex-col gap-1.5">
            {players.map((p) => {
              const st = streaks[p.id]
              if (!st || !st.current) return null
              const color = st.type === 'W' ? 'var(--color-win)' : st.type === 'L' ? 'var(--color-loss)' : 'var(--color-draw)'
              const label = st.type === 'W' ? 'W streak' : st.type === 'L' ? 'L streak' : 'game unbeaten'
              return (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <img
                    src={flagSrc(p.countryCode)}
                    alt=""
                    className="h-3 w-4 rounded-sm object-cover"
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0'
                    }}
                  />
                  <span className="text-text-primary">{p.name}</span>
                  <span className="ml-auto text-xs font-semibold" style={{ color }}>
                    {st.current} {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </Section>

      <Section title="Partnerships — Who Plays Well Together?">
        {pStats.length ? (
          <>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              <PartnerLeaderboard title="Best Win Rate (min 2 games)" data={pStats.filter((p) => p.gp >= 2)} players={players} valFn={(p) => (p.gp ? p.w / p.gp : 0)} fmtFn={fmtPct} />
              <PartnerLeaderboard title="Most Goals Together" data={pStats} players={players} valFn={(p) => p.gf} />
              <PartnerLeaderboard title="Best Goal Difference" data={pStats} players={players} valFn={(p) => p.gf - p.ga} fmtFn={fmtSigned} />
              <PartnerLeaderboard title="Tightest Defense (GA/Game)" data={pStats.filter((p) => p.gp >= 2)} players={players} valFn={(p) => -(p.ga / p.gp)} fmtFn={(p) => (p.ga / p.gp).toFixed(2)} />
              <PartnerLeaderboard title="Most Games Together" data={pStats} players={players} valFn={(p) => p.gp} />
            </div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Partnership Win Rate Matrix</div>
            <WinRateMatrix players={players} partners={partners} pairKey={pairKey} />
          </>
        ) : (
          <div className="text-sm text-text-secondary">No partnership data yet.</div>
        )}
      </Section>

      <Section title="Head-to-Head — Who Beats Who?" note="W–D–L when facing each other (regardless of partners)">
        {overview.rivalry && (
          <div className="grid grid-cols-1">
            <StatCard
              value={`${playerName(players, overview.rivalry.idA)} vs ${playerName(players, overview.rivalry.idB)} (${overview.rivalry.w}-${overview.rivalry.d}-${overview.rivalry.l})`}
              label={`Biggest Rivalry — ${overview.rivalryTotal} meetings`}
            />
          </div>
        )}
        <H2HMatrix players={players} h2h={h2h} pairKey={pairKey} />
      </Section>

      {otGames.length > 0 && (
        <Section title="Overtime">
          <div className="grid grid-cols-2 gap-2">
            <StatCard value={otGames.length} label="OT Games" color="var(--color-purple)" />
            <StatCard value={`${Math.round((otGames.length / overview.N) * 100)}%`} label="% went to OT" color="var(--color-purple)" />
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <Leaderboard title="Most OT Games" data={pList.filter((p) => p.otGP > 0)} players={players} valFn={(p) => p.otGP} />
            <Leaderboard title="OT Win Rate (min 1 OT game)" data={pList.filter((p) => p.otGP >= 1)} players={players} valFn={(p) => (p.otGP ? p.otW / p.otGP : 0)} fmtFn={fmtPct} />
            {pStats.filter((p) => p.otGP > 0).length > 0 && (
              <PartnerLeaderboard title="Best OT Partnership" data={pStats.filter((p) => p.otGP > 0)} players={players} valFn={(p) => (p.otGP ? p.otW / p.otGP : 0)} fmtFn={fmtPct} />
            )}
          </div>
        </Section>
      )}

      <Section title="Awards">
        <AwardsGrid awards={awards} streaks={streaks} otGamesCount={otGames.length} players={players} />
      </Section>
    </div>
  )
}
