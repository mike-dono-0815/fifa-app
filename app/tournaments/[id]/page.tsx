import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { games as gamesTable, players as playersTable, tournaments } from '@/lib/db/schema'
import { toGames, toPlayers } from '@/lib/tournament/toState'
import { TournamentTabs } from '@/components/TournamentTabs'
import { LiveRefresher } from '@/components/LiveRefresher'
import { PrintButton } from '@/components/PrintButton'

export default async function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1)
  if (!tournament) notFound()

  const [playerRows, gameRows] = await Promise.all([
    db.select().from(playersTable).where(eq(playersTable.tournamentId, id)),
    db.select().from(gamesTable).where(eq(gamesTable.tournamentId, id)),
  ])
  const players = toPlayers(playerRows)
  const games = toGames(gameRows)

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="headline text-2xl text-text-primary">{tournament.title || 'FC Tournament'}</h1>
          {tournament.status === 'finished' && tournament.winnerName && (
            <p className="text-sm text-gold">🏆 {tournament.winnerName}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <PrintButton />
          <a
            href="/tournaments"
            className="print:hidden headline inline-flex items-center gap-1.5 rounded-fifa-sm border border-blue-neon px-3.5 py-1.5 text-xs text-blue-neon transition hover:bg-blue-neon/15"
          >
            📋 All Tournaments →
          </a>
        </div>
      </div>

      <LiveRefresher active={tournament.status === 'live'} />
      <TournamentTabs tournamentId={id} status={tournament.status} players={players} games={games} />
    </main>
  )
}
