import { inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { games as gamesTable, players as playersTable } from '@/lib/db/schema'
import { toGames } from './toState'
import type { Player, Game } from './types'

export const REAL_TOURNAMENT_IDS = ['04_05_2026', '06_05_2026', '09_05_2026', '09_05_2026_02']

export const CANONICAL_PLAYERS: Player[] = [
  { id: 'combined_ricky', name: 'Ricky', countryCode: 'de', countryName: 'Germany' },
  { id: 'combined_erhan', name: 'Erhan', countryCode: 'tr', countryName: 'Turkey' },
  { id: 'combined_alldad', name: 'Alldad', countryCode: 'co', countryName: 'Colombia' },
  { id: 'combined_nontas', name: 'Nontas', countryCode: 'gr', countryName: 'Greece' },
  { id: 'combined_michael', name: 'Michael', countryCode: 'at', countryName: 'Austria' },
]

// The same five people played every tournament, sometimes under a different
// name (and, for Ricky, a different flag — India, then Germany from
// 09_05_2026 on). Maps each tournament's migrated player id to one of the
// five canonical identities above.
const IDENTITY: Record<string, string> = {
  '04_05_2026_ricky': 'combined_ricky',
  '04_05_2026_alldad': 'combined_alldad',
  '04_05_2026_michaeld': 'combined_michael',
  '04_05_2026_nontas': 'combined_nontas',
  '04_05_2026_erhan': 'combined_erhan',

  '06_05_2026_michaeld': 'combined_michael',
  '06_05_2026_nontas': 'combined_nontas',
  '06_05_2026_rakshith': 'combined_ricky',
  '06_05_2026_erhan': 'combined_erhan',
  '06_05_2026_garcia': 'combined_alldad',

  '09_05_2026_erhan': 'combined_erhan',
  '09_05_2026_ricky': 'combined_ricky',
  '09_05_2026_aldad': 'combined_alldad',
  '09_05_2026_nontas': 'combined_nontas',
  '09_05_2026_doni': 'combined_michael',

  '09_05_2026_02_ricky': 'combined_ricky',
  '09_05_2026_02_erhan': 'combined_erhan',
  '09_05_2026_02_alldad': 'combined_alldad',
  '09_05_2026_02_nontas': 'combined_nontas',
  '09_05_2026_02_michael': 'combined_michael',
}

export async function getCombinedTournament(): Promise<{ players: Player[]; games: Game[] }> {
  const gameRows = await db.select().from(gamesTable).where(inArray(gamesTable.tournamentId, REAL_TOURNAMENT_IDS))

  const remap = (id: string) => IDENTITY[id] ?? id
  let counter = 0
  const games: Game[] = REAL_TOURNAMENT_IDS.flatMap((tid) => {
    const tGames = toGames(gameRows.filter((g) => g.tournamentId === tid))
    return tGames.map((g) => ({
      ...g,
      id: `combined_${counter++}`,
      round: 1,
      teamA: [remap(g.teamA[0]), remap(g.teamA[1])] as [string, string],
      teamB: [remap(g.teamB[0]), remap(g.teamB[1])] as [string, string],
    }))
  })

  return { players: CANONICAL_PLAYERS, games }
}
