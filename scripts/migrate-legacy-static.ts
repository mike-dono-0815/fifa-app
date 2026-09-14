import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { readFileSync } from 'fs'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { tournaments, players, games } from '../lib/db/schema'
import { fromGame } from '../lib/tournament/toState'
import { computeStandings } from '../lib/tournament/standings'
import type { Player, Game } from '../lib/tournament/types'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const NAT: Record<string, string> = JSON.parse(readFileSync('./__nat.json', 'utf8'))

type LegacyTournament = {
  slug: string
  date: string
  label: string
  players: [string, string][]
  games: [[string, string], number, number, [string, string], boolean][]
  expected: Record<string, [number, number, number, number, number, number]>
}

const data: LegacyTournament[] = JSON.parse(readFileSync('./__tournaments.json', 'utf8'))

async function main() {
  for (const t of data) {
    const id = t.slug
    const idOf = (name: string) => `${id}_${name.toLowerCase()}`

    const legacyPlayers: Player[] = t.players.map(([name, code]) => ({
      id: idOf(name),
      name,
      countryCode: code,
      countryName: NAT[code] ?? null,
    }))

    const legacyGames: Game[] = t.games.map(([teamA, scoreA, scoreB, teamB, overtime], i) => ({
      id: `${id}_g${i}`,
      round: 1,
      teamA: [idOf(teamA[0]), idOf(teamA[1])],
      teamB: [idOf(teamB[0]), idOf(teamB[1])],
      scoreA,
      scoreB,
      confirmed: true,
      overtime,
      touched: true,
    }))

    // Sanity-check against the hand-verified `expected` standings embedded
    // in the original data before writing anything — this is the single
    // best correctness signal available for a historical record nobody can
    // re-play to double check.
    const standings = computeStandings(legacyPlayers, legacyGames)
    let mismatches = 0
    for (const s of standings) {
      const name = legacyPlayers.find((p) => p.id === s.id)!.name
      const exp = t.expected[name]
      if (!exp) {
        console.error(`  ${id}: no expected data for ${name}`)
        mismatches++
        continue
      }
      const [ew, ed, el, egf, ega, epts] = exp
      if (s.w !== ew || s.d !== ed || s.l !== el || s.gf !== egf || s.ga !== ega || s.pts !== epts) {
        console.error(
          `  ${id}: MISMATCH for ${name}: computed w${s.w}d${s.d}l${s.l} gf${s.gf}ga${s.ga} pts${s.pts}, expected w${ew}d${ed}l${el} gf${egf}ga${ega} pts${epts}`,
        )
        mismatches++
      }
    }
    if (mismatches > 0) {
      console.error(`  ${id}: ${mismatches} mismatch(es) — skipping insert, fix data before re-running`)
      continue
    }

    const winner = standings[0]
    const winnerName = legacyPlayers.find((p) => p.id === winner.id)!.name
    const savedAt = new Date(t.date + 'T12:00:00Z')

    await db
      .insert(tournaments)
      .values({
        id,
        status: 'finished',
        currentRound: 1,
        title: legacyPlayers.map((p) => p.name).join(' · '),
        winnerName,
        createdAt: savedAt,
        savedAt,
      })
      .onConflictDoNothing()

    await db
      .insert(players)
      .values(legacyPlayers.map((p, i) => ({ ...p, tournamentId: id, sortOrder: i })))
      .onConflictDoNothing()

    await db
      .insert(games)
      .values(legacyGames.map((g, i) => fromGame(g, id, i)))
      .onConflictDoNothing()

    console.log(`  migrated ${id} (${legacyPlayers.length} players, ${legacyGames.length} games) — verified against expected standings, winner ${winnerName}`)
  }
  console.log(`\nDone: ${data.length} tournament(s) processed.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
