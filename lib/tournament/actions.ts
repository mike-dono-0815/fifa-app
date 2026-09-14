'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { games, players, tournaments } from '@/lib/db/schema'
import { generateSchedule } from './schedule'
import { computeStandings } from './standings'
import { fromGame, toGames, toPlayers } from './toState'
import { uid } from './helpers'

export type NewPlayerInput = {
  name: string
  countryCode: string | null
  countryName: string | null
}

export async function createTournament(input: NewPlayerInput[]) {
  const existing = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.status, 'live'))
    .limit(1)
  if (existing.length) redirect(`/tournaments/${existing[0].id}`)

  const tournamentId = `t_${Date.now()}_${uid()}`
  const playerRows = input.map((p, i) => ({
    id: uid(),
    tournamentId,
    name: p.name.trim(),
    countryCode: p.countryCode,
    countryName: p.countryName,
    sortOrder: i,
  }))
  const scheduleInput = playerRows.map((p) => ({
    id: p.id,
    name: p.name,
    countryCode: p.countryCode,
    countryName: p.countryName,
  }))
  const generatedGames = generateSchedule(scheduleInput, 1)
  const gameRows = generatedGames.map((g, i) => fromGame(g, tournamentId, i))

  await db.insert(tournaments).values({
    id: tournamentId,
    status: 'live',
    currentRound: 1,
    title: playerRows.map((p) => p.name || 'Player').join(' · '),
  })
  await db.insert(players).values(playerRows)
  await db.insert(games).values(gameRows)

  redirect(`/tournaments/${tournamentId}`)
}

export async function updateScore(gameId: string, side: 'a' | 'b', delta: number) {
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1)
  if (!game) return
  const scoreA = side === 'a' ? Math.max(0, game.scoreA + delta) : game.scoreA
  const scoreB = side === 'b' ? Math.max(0, game.scoreB + delta) : game.scoreB
  await db
    .update(games)
    .set({ scoreA, scoreB, confirmed: true, touched: true })
    .where(eq(games.id, gameId))
  revalidatePath(`/tournaments/${game.tournamentId}`)
}

export async function confirmGame(gameId: string) {
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1)
  if (!game) return
  await db.update(games).set({ confirmed: true, touched: true }).where(eq(games.id, gameId))
  revalidatePath(`/tournaments/${game.tournamentId}`)
}

export async function toggleOvertime(gameId: string) {
  const [game] = await db.select().from(games).where(eq(games.id, gameId)).limit(1)
  if (!game) return
  await db.update(games).set({ overtime: !game.overtime }).where(eq(games.id, gameId))
  revalidatePath(`/tournaments/${game.tournamentId}`)
}

// There is exactly one round per tournament — generateSchedule(players, 1)
// produces the full round-robin up front. "Lock Final Score" only ever force
// -confirms a still-untouched trailing game (a legitimate 0-0 that never got
// a button click) and then finishes the tournament once every game is
// confirmed; it never generates a next round (the old app never advanced
// currentRound past 1 either).
export async function lockFinalScore(tournamentId: string) {
  const gameRows = await db.select().from(games).where(eq(games.tournamentId, tournamentId))
  const ordered = [...gameRows].sort((a, b) => a.sortOrder - b.sortOrder)
  const last = ordered[ordered.length - 1]
  if (last && !last.confirmed) {
    await db.update(games).set({ confirmed: true, touched: true }).where(eq(games.id, last.id))
    last.confirmed = true
  }

  const allConfirmed = ordered.length > 0 && ordered.every((g) => g.confirmed)
  if (allConfirmed) {
    const playerRows = await db.select().from(players).where(eq(players.tournamentId, tournamentId))
    const standings = computeStandings(toPlayers(playerRows), toGames(ordered))
    const winnerId = standings[0]?.id
    const winnerName = playerRows.find((p) => p.id === winnerId)?.name ?? '—'
    await db
      .update(tournaments)
      .set({ status: 'finished', winnerName, savedAt: new Date() })
      .where(eq(tournaments.id, tournamentId))
  }
  revalidatePath(`/tournaments/${tournamentId}`)
}
