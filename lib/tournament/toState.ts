import type { games as gamesTable, players as playersTable, tournaments as tournamentsTable } from '@/lib/db/schema'
import type { Game, Player } from './types'

type DbPlayer = typeof playersTable.$inferSelect
type DbGame = typeof gamesTable.$inferSelect
type DbTournament = typeof tournamentsTable.$inferSelect

export function toPlayer(row: DbPlayer): Player {
  return {
    id: row.id,
    name: row.name,
    countryCode: row.countryCode,
    countryName: row.countryName,
  }
}

export function toGame(row: DbGame): Game {
  return {
    id: row.id,
    round: row.round,
    teamA: [row.teamAPlayer1, row.teamAPlayer2],
    teamB: [row.teamBPlayer1, row.teamBPlayer2],
    scoreA: row.scoreA,
    scoreB: row.scoreB,
    confirmed: row.confirmed,
    overtime: row.overtime,
    touched: row.touched,
  }
}

export function toPlayers(rows: DbPlayer[]): Player[] {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder).map(toPlayer)
}

export function toGames(rows: DbGame[]): Game[] {
  return [...rows].sort((a, b) => a.sortOrder - b.sortOrder).map(toGame)
}

export function fromGame(game: Game, tournamentId: string, sortOrder: number): typeof gamesTable.$inferInsert {
  return {
    id: game.id,
    tournamentId,
    round: game.round,
    teamAPlayer1: game.teamA[0],
    teamAPlayer2: game.teamA[1],
    teamBPlayer1: game.teamB[0],
    teamBPlayer2: game.teamB[1],
    scoreA: game.scoreA,
    scoreB: game.scoreB,
    confirmed: game.confirmed,
    overtime: game.overtime,
    touched: game.touched,
    sortOrder,
  }
}

export type { DbPlayer, DbGame, DbTournament }
