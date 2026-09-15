import { desc, eq, inArray } from 'drizzle-orm'
import Link from 'next/link'
import { db } from '@/lib/db'
import { games as gamesTable, players as playersTable, tournaments } from '@/lib/db/schema'
import { toGames, toPlayers } from '@/lib/tournament/toState'
import { computeStandings } from '@/lib/tournament/standings'
import { flagSrc } from '@/lib/tournament/helpers'
import { getCombinedTournament } from '@/lib/tournament/combined'
import type { Player, Standing } from '@/lib/tournament/types'

export const dynamic = 'force-dynamic'

const MEDALS = ['🥇', '🥈', '🥉']

function buildCard(players: Player[], games: ReturnType<typeof toGames>) {
  const standings = computeStandings(players, games)
  const podium = standings.slice(0, 3).map((s: Standing) => ({
    standing: s,
    player: players.find((p) => p.id === s.id)!,
  }))
  const gamesPlayed = games.filter((g) => g.confirmed).length
  return { players, podium, gamesPlayed }
}

export default async function TournamentsOverviewPage() {
  const finished = await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.status, 'finished'))
    .orderBy(desc(tournaments.savedAt))

  const ids = finished.map((t) => t.id)
  const [playerRows, gameRows] = ids.length
    ? await Promise.all([
        db.select().from(playersTable).where(inArray(playersTable.tournamentId, ids)),
        db.select().from(gamesTable).where(inArray(gamesTable.tournamentId, ids)),
      ])
    : [[], []]

  const cards = finished.map((t) => {
    const players = toPlayers(playerRows.filter((p) => p.tournamentId === t.id))
    const games = toGames(gameRows.filter((g) => g.tournamentId === t.id))
    const dateLabel = (t.savedAt ?? t.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    return { id: t.id, dateLabel, ...buildCard(players, games) }
  })

  const combined = await getCombinedTournament()
  const combinedCard = combined.games.length ? buildCard(combined.players, combined.games) : null

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:py-16">
      <div className="text-center">
        <h1 className="headline bg-gradient-to-br from-white via-blue-neon to-green-bright bg-clip-text text-4xl text-transparent sm:text-5xl">
          All Tournaments
        </h1>
        <p className="mt-2 text-sm uppercase tracking-widest text-text-secondary">FC 2v2 · WC Edition</p>
        <Link
          href="/"
          className="headline mt-4 inline-block rounded-fifa-sm border border-blue-neon px-4 py-2 text-sm text-blue-neon transition hover:bg-blue-neon/15"
        >
          ← Back to the app
        </Link>
      </div>

      {cards.length === 0 && !combinedCard ? (
        <p className="text-center text-text-secondary">No finished tournaments yet.</p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {combinedCard && (
            <Link
              href="/tournaments/all"
              className="block rounded-fifa border border-gold/40 bg-gradient-to-br from-[#14120a] to-surface px-5 py-4.5 transition hover:border-gold hover:shadow-[0_0_22px_rgba(255,215,0,.18)]"
            >
              <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3">
                <span className="headline text-2xl text-gold">All Tournaments Combined</span>
                <span className="text-sm text-text-secondary">
                  {combinedCard.players.length} players · {combinedCard.gamesPlayed} games · every match combined
                </span>
              </div>
              <div className="mb-3.5 flex gap-1.5">
                {combinedCard.players.map((p) => (
                  <img
                    key={p.id}
                    src={flagSrc(p.countryCode)}
                    alt={p.name}
                    title={p.name}
                    className="h-[18px] w-[26px] rounded-sm object-cover opacity-90"
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {combinedCard.podium.map(({ standing, player }, i) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-1.5 rounded-fifa-sm border border-border-subtle bg-raised py-1.5 pr-2.5 pl-2 ${
                      i === 0 ? 'border-gold/35 shadow-[inset_3px_0_12px_rgba(255,215,0,.12)]' : ''
                    }`}
                  >
                    <span className="text-sm">{MEDALS[i]}</span>
                    <img src={flagSrc(player.countryCode)} alt="" className="h-[15px] w-[22px] rounded-sm object-cover" />
                    <span
                      className={`headline text-base ${
                        i === 0 ? 'text-gold' : i === 1 ? 'text-silver' : 'text-bronze'
                      }`}
                    >
                      {player.name}
                    </span>
                    <span className="headline text-sm text-text-secondary">{standing.pts} pts</span>
                  </div>
                ))}
              </div>
            </Link>
          )}
          {cards.length > 0 && (
            <p className="mt-1 px-1 text-xs font-semibold uppercase tracking-widest text-text-secondary">
              Individual tournaments
            </p>
          )}
          {cards.map((c) => (
            <Link
              key={c.id}
              href={`/tournaments/${c.id}`}
              className="block rounded-fifa border border-border-subtle bg-surface px-5 py-4.5 transition hover:border-blue-neon hover:shadow-[0_0_22px_rgba(0,180,255,.15)]"
            >
              <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-3">
                <span className="headline text-2xl">{c.dateLabel}</span>
                <span className="text-sm text-text-secondary">
                  {c.players.length} players · {c.gamesPlayed} games
                </span>
              </div>
              <div className="mb-3.5 flex gap-1.5">
                {c.players.map((p) => (
                  <img
                    key={p.id}
                    src={flagSrc(p.countryCode)}
                    alt={p.name}
                    title={p.name}
                    className="h-[18px] w-[26px] rounded-sm object-cover opacity-90"
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {c.podium.map(({ standing, player }, i) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-1.5 rounded-fifa-sm border border-border-subtle bg-raised py-1.5 pr-2.5 pl-2 ${
                      i === 0 ? 'border-gold/35 shadow-[inset_3px_0_12px_rgba(255,215,0,.12)]' : ''
                    }`}
                  >
                    <span className="text-sm">{MEDALS[i]}</span>
                    <img src={flagSrc(player.countryCode)} alt="" className="h-[15px] w-[22px] rounded-sm object-cover" />
                    <span
                      className={`headline text-base ${
                        i === 0 ? 'text-gold' : i === 1 ? 'text-silver' : 'text-bronze'
                      }`}
                    >
                      {player.name}
                    </span>
                    <span className="headline text-sm text-text-secondary">{standing.pts} pts</span>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-center text-sm text-text-secondary">
        Every result is a frozen snapshot — open a tournament for the full schedule, table and stats.
      </p>
    </main>
  )
}
