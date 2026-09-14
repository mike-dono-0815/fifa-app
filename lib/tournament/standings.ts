import type { Game, Player, Standing } from './types'
import { playerName } from './helpers'

export function computeStandings(players: Player[], games: Game[]): Standing[] {
  const s: Record<string, Standing> = {}
  players.forEach((p) => {
    s[p.id] = { id: p.id, gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }
  })
  games.forEach((g) => {
    if (!g.confirmed) return
    const { teamA, teamB, scoreA, scoreB } = g
    teamA.forEach((pid) => {
      const r = s[pid]
      r.gp++
      r.gf += scoreA
      r.ga += scoreB
      if (scoreA > scoreB) {
        r.w++
        r.pts += 3
      } else if (scoreA === scoreB) {
        r.d++
        r.pts += 1
      } else {
        r.l++
      }
    })
    teamB.forEach((pid) => {
      const r = s[pid]
      r.gp++
      r.gf += scoreB
      r.ga += scoreA
      if (scoreB > scoreA) {
        r.w++
        r.pts += 3
      } else if (scoreA === scoreB) {
        r.d++
        r.pts += 1
      } else {
        r.l++
      }
    })
  })
  return Object.values(s).sort((a, b) => {
    const gdA = a.gf - a.ga
    const gdB = b.gf - b.ga
    return (
      b.pts - a.pts ||
      gdB - gdA ||
      b.gf - a.gf ||
      playerName(players, a.id).localeCompare(playerName(players, b.id))
    )
  })
}
