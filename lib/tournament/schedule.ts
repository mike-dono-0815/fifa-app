import type { Game, Player } from './types'
import { combinations, uid } from './helpers'

type RawGame = { teamA: [string, string]; teamB: [string, string] }

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function generateSchedule(players: Player[], round: number): Game[] {
  const ids = players.map((p) => p.id)
  const rawGames: RawGame[] = []
  const groups = combinations(ids, 4)
  for (const [A, B, C, D] of groups) {
    rawGames.push({ teamA: [A, B], teamB: [C, D] })
    rawGames.push({ teamA: [A, C], teamB: [B, D] })
    rawGames.push({ teamA: [A, D], teamB: [B, C] })
  }

  let ordered: RawGame[]
  if (ids.length === 5) {
    // Group the 15 games by which player sits out (5 buckets x 3 games each)
    const sitOf = (g: RawGame) => ids.find((id) => !g.teamA.includes(id) && !g.teamB.includes(id))!
    const buckets: Record<string, RawGame[]> = {}
    ids.forEach((id) => {
      buckets[id] = []
    })
    rawGames.forEach((g) => buckets[sitOf(g)].push(g))
    ids.forEach((id) => shuffle(buckets[id]))

    // One shared random sit-out order repeated 3 times:
    //   player k sits out at positions k, k+5, k+10  ->  gaps always exactly 5
    //   no consecutive same sit-out guaranteed by construction (all 5 distinct)
    const playerOrder = shuffle([...ids])
    const bIdx: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]))
    ordered = []
    for (let r = 0; r < 3; r++) {
      for (const pid of playerOrder) {
        ordered.push(buckets[pid][bIdx[pid]++])
      }
    }
  } else {
    ordered = shuffle(rawGames)
    const sitOf = (g: RawGame) => ids.filter((id) => !g.teamA.includes(id) && !g.teamB.includes(id))
    const clashes = (g1: RawGame, g2: RawGame) => sitOf(g1).some((id) => sitOf(g2).includes(id))
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < ordered.length - 1; i++) {
        if (clashes(ordered[i], ordered[i + 1])) {
          for (let j = i + 2; j < ordered.length; j++) {
            if (!clashes(ordered[i], ordered[j])) {
              ;[ordered[i + 1], ordered[j]] = [ordered[j], ordered[i + 1]]
              break
            }
          }
        }
      }
    }
  }

  ordered.forEach((g) => {
    if (Math.random() < 0.5) {
      ;[g.teamA, g.teamB] = [g.teamB, g.teamA]
    }
  })

  return ordered.map((g, i) => ({
    id: `g${round}_${i}_${uid()}`,
    round,
    teamA: g.teamA,
    teamB: g.teamB,
    scoreA: 0,
    scoreB: 0,
    confirmed: false,
    overtime: false,
    touched: false,
  }))
}
