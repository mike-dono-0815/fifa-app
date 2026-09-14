import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { readFileSync } from 'fs'
import path from 'path'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { tournaments, players, games } from '../lib/db/schema'
import { fromGame } from '../lib/tournament/toState'
import type { Player } from '../lib/tournament/types'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const serviceAccount = JSON.parse(
  readFileSync(path.join(process.cwd(), 'scripts/.secrets/firebase-service-account.json'), 'utf8'),
)
initializeApp({ credential: cert(serviceAccount) })
const fs = getFirestore()

type LegacyGame = {
  id: string
  round: number
  teamA: [string, string]
  teamB: [string, string]
  scoreA: number
  scoreB: number
  confirmed: boolean
  overtime: boolean
  touched: boolean
}
type LegacyPlayer = { id: string; name: string; countryCode: string | null; countryName: string | null }
type LegacyRecord = {
  id: string
  title?: string
  winnerName?: string
  savedAt?: number
  state: {
    players: LegacyPlayer[]
    games: LegacyGame[]
    currentRound?: number
    createdAt?: number
  }
}

async function main() {
  const snap = await fs.collection('finished').get()
  const records = snap.docs.map((d) => d.data() as LegacyRecord)
  console.log(`Found ${records.length} record(s) in Firestore 'finished' collection.`)

  let migrated = 0
  let skipped = 0

  for (const rec of records) {
    if (!rec?.id || !rec.state?.players?.length || !rec.state?.games?.length) {
      console.log(`  skip ${rec?.id ?? '(no id)'}: missing/empty state`)
      skipped++
      continue
    }
    if (rec.id === 'all') {
      console.log(`  skip ${rec.id}: synthetic combined view, not a real tournament`)
      skipped++
      continue
    }

    const legacyPlayers: Player[] = rec.state.players.map((p) => ({
      id: p.id,
      name: p.name,
      countryCode: p.countryCode,
      countryName: p.countryName,
    }))

    await db
      .insert(tournaments)
      .values({
        id: rec.id,
        status: 'finished',
        currentRound: rec.state.currentRound ?? 1,
        title: rec.title ?? null,
        winnerName: rec.winnerName ?? null,
        createdAt: rec.state.createdAt ? new Date(rec.state.createdAt) : new Date(),
        savedAt: rec.savedAt ? new Date(rec.savedAt) : new Date(),
      })
      .onConflictDoNothing()

    await db
      .insert(players)
      .values(
        legacyPlayers.map((p, i) => ({
          id: p.id,
          tournamentId: rec.id,
          name: p.name,
          countryCode: p.countryCode,
          countryName: p.countryName,
          sortOrder: i,
        })),
      )
      .onConflictDoNothing()

    await db
      .insert(games)
      .values(rec.state.games.map((g, i) => fromGame(g, rec.id, i)))
      .onConflictDoNothing()

    console.log(`  migrated ${rec.id} (${legacyPlayers.length} players, ${rec.state.games.length} games)`)
    migrated++
  }

  console.log(`\nDone: ${migrated} migrated, ${skipped} skipped.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
