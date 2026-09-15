import { getCombinedTournament } from '@/lib/tournament/combined'
import { computeStandings } from '@/lib/tournament/standings'
import { TournamentTabs } from '@/components/TournamentTabs'
import { PrintButton } from '@/components/PrintButton'

export const dynamic = 'force-dynamic'

export default async function CombinedTournamentPage() {
  const { players, games } = await getCombinedTournament()
  const standings = computeStandings(players, games)
  const winnerName = players.find((p) => p.id === standings[0]?.id)?.name

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="headline text-2xl text-gold">All Tournaments Combined</h1>
          {winnerName && <p className="text-sm text-gold">🏆 {winnerName}</p>}
          <p className="mt-1 max-w-md text-xs text-text-muted">
            Every match the group has played, merged into one table — the same five people every
            time, sometimes under a different name or flag.
          </p>
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

      <TournamentTabs tournamentId="all" status="finished" players={players} games={games} />
    </main>
  )
}
