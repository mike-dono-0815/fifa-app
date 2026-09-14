import type { Game, GameResult, Player, PlayerStats, Rivalry, Stats } from './types'
import { pairKey } from './helpers'

function best<T>(arr: T[], fn: (t: T) => number): T | null {
  if (!arr.length) return null
  return arr.reduce((b, c) => (fn(c) > fn(b) ? c : b))
}

function worst<T>(arr: T[], fn: (t: T) => number): T | null {
  if (!arr.length) return null
  return arr.reduce((b, c) => (fn(c) < fn(b) ? c : b))
}

export function computeStats(players: Player[], games: Game[]): Stats {
  const confirmed = games.filter((g) => g.confirmed)
  const N = confirmed.length
  const totalGoals = confirmed.reduce((s, g) => s + g.scoreA + g.scoreB, 0)
  const avgGoals = N ? +(totalGoals / N).toFixed(2) : 0

  // Scoreline frequency
  const scorelineMap: Record<string, number> = {}
  confirmed.forEach((g) => {
    const k = [Math.min(g.scoreA, g.scoreB), Math.max(g.scoreA, g.scoreB)].join('-')
    scorelineMap[k] = (scorelineMap[k] || 0) + 1
  })
  let topScoreline = '—'
  let topScorelineCount = 0
  Object.entries(scorelineMap).forEach(([k, v]) => {
    if (v > topScorelineCount) {
      topScoreline = k
      topScorelineCount = v
    }
  })

  // Highest scoring game
  let highestGame: Game | null = null
  let highestTotal = 0
  confirmed.forEach((g) => {
    const t = g.scoreA + g.scoreB
    if (t > highestTotal) {
      highestTotal = t
      highestGame = g
    }
  })

  // Biggest win
  let biggestWin: Game | null = null
  let biggestDiff = 0
  confirmed.forEach((g) => {
    const d = Math.abs(g.scoreA - g.scoreB)
    if (d > biggestDiff) {
      biggestDiff = d
      biggestWin = g
    }
  })

  // Per-player
  const ps: Record<string, PlayerStats> = {}
  players.forEach((p) => {
    ps[p.id] = {
      id: p.id,
      gp: 0,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
      pts: 0,
      cleanSheets: 0,
      bestSingleGF: 0,
      bestSingleGA: 0,
      bestWinDiff: 0,
      worstLossDiff: 0,
      narrowWins: 0,
      gameResults: [],
      otGP: 0,
      otW: 0,
      otL: 0,
      otD: 0,
    }
  })
  confirmed.forEach((g) => {
    const { teamA, teamB, scoreA, scoreB } = g
    const process = (team: [string, string], mineScore: number, theirScore: number) => {
      team.forEach((pid) => {
        const r = ps[pid]
        r.gp++
        r.gf += mineScore
        r.ga += theirScore
        r.bestSingleGA = Math.max(r.bestSingleGA, theirScore)
        r.bestSingleGF = Math.max(r.bestSingleGF, mineScore)
        if (mineScore > theirScore) {
          r.w++
          r.pts += 3
          r.bestWinDiff = Math.max(r.bestWinDiff, mineScore - theirScore)
          r.gameResults.push('W')
          if (mineScore - theirScore === 1) r.narrowWins++
        } else if (mineScore === theirScore) {
          r.d++
          r.pts += 1
          r.gameResults.push('D')
        } else {
          r.l++
          r.worstLossDiff = Math.max(r.worstLossDiff, theirScore - mineScore)
          r.gameResults.push('L')
        }
        if (theirScore === 0) r.cleanSheets++
        if (g.overtime) {
          r.otGP++
          if (mineScore > theirScore) r.otW++
          else if (mineScore === theirScore) r.otD++
          else r.otL++
        }
      })
    }
    process(teamA, scoreA, scoreB)
    process(teamB, scoreB, scoreA)
  })

  // Streaks
  const streaks: Stats['streaks'] = {}
  players.forEach((p) => {
    const results = ps[p.id].gameResults
    let cur = 0
    let curType: GameResult | '' = ''
    let longestW = 0
    let longestL = 0
    let longestUnbeaten = 0
    let curUnbeaten = 0
    results.forEach((r) => {
      if (r === 'W') {
        cur = (curType === 'W' ? cur : 0) + 1
        curType = 'W'
        curUnbeaten++
      } else if (r === 'D') {
        curUnbeaten++
        curType = 'D'
        cur = curUnbeaten // cur = full unbeaten length
      } else {
        cur = (curType === 'L' ? cur : 0) + 1
        curType = 'L'
        curUnbeaten = 0
      }
      if (curType === 'W') longestW = Math.max(longestW, cur)
      if (curType === 'L') longestL = Math.max(longestL, cur)
      longestUnbeaten = Math.max(longestUnbeaten, curUnbeaten)
    })
    streaks[p.id] = { current: cur, type: curType, longestW, longestL, longestUnbeaten }
  })

  // Partnerships
  const partners: Stats['partners'] = {}
  confirmed.forEach((g) => {
    ;([
      [g.teamA, g.scoreA, g.scoreB],
      [g.teamB, g.scoreB, g.scoreA],
    ] as const).forEach(([team, mine, theirs]) => {
      if (team.length < 2) return
      const k = pairKey(team[0], team[1])
      if (!partners[k]) partners[k] = { gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, otGP: 0, otW: 0, otL: 0 }
      const p = partners[k]
      p.gp++
      p.gf += mine
      p.ga += theirs
      if (mine > theirs) {
        p.w++
        if (g.overtime) p.otW++
      } else if (mine === theirs) {
        p.d++
      } else {
        p.l++
        if (g.overtime) p.otL++
      }
      if (g.overtime) p.otGP++
    })
  })

  // Head-to-head
  const h2h: Stats['h2h'] = {}
  confirmed.forEach((g) => {
    g.teamA.forEach((aId) => {
      g.teamB.forEach((bId) => {
        const k = pairKey(aId, bId)
        if (!h2h[k]) h2h[k] = {}
        const aWins = g.scoreA > g.scoreB
        const bWins = g.scoreB > g.scoreA
        const aKey = `${aId}_vs_${bId}`
        const bKey = `${bId}_vs_${aId}`
        if (!h2h[k][aKey]) h2h[k][aKey] = { w: 0, d: 0, l: 0 }
        if (!h2h[k][bKey]) h2h[k][bKey] = { w: 0, d: 0, l: 0 }
        if (aWins) {
          h2h[k][aKey].w++
          h2h[k][bKey].l++
        } else if (bWins) {
          h2h[k][bKey].w++
          h2h[k][aKey].l++
        } else {
          h2h[k][aKey].d++
          h2h[k][bKey].d++
        }
      })
    })
  })

  // OT overview
  const otGames = confirmed.filter((g) => g.overtime)

  // Biggest rivalry: the pair who've faced off as opponents the most
  let rivalry: Rivalry | null = null
  let rivalryTotal = 0
  Object.entries(h2h).forEach(([k, rec]) => {
    const [idA, idB] = k.split('|')
    const rA = rec[`${idA}_vs_${idB}`]
    if (!rA) return
    const total = rA.w + rA.d + rA.l
    if (total > rivalryTotal) {
      rivalryTotal = total
      rivalry = { idA, idB, ...rA }
    }
  })

  // Awards
  const pArr = Object.values(ps).filter((p) => p.gp > 0)
  const minGP3 = pArr.filter((p) => p.gp >= 3)
  const awards: Stats['awards'] = {
    topScorer: best(pArr, (p) => p.gf),
    goldenGlove: minGP3.length ? best(minGP3, (p) => -p.ga / p.gp) : null,
    mvp: best(pArr, (p) => p.pts),
    liability: best(pArr, (p) => p.ga),
    brickWall: best(pArr, (p) => p.cleanSheets),
    goalMachine: minGP3.length ? best(minGP3, (p) => p.gf / p.gp) : null,
    unbreakable: best(pArr, (p) => streaks[p.id].longestUnbeaten),
    punchingBag: best(pArr, (p) => p.l),
    kingOfDraws: best(pArr, (p) => p.d),
    ironMan: best(pArr, (p) => p.gp),
    clutchPlayer: null,
    bottler: null,
    otMagnet: null,
  }
  if (otGames.length >= 2) {
    const otP = pArr.filter((p) => ps[p.id].otGP >= 2)
    if (otP.length) {
      awards.clutchPlayer = best(otP, (p) => (p.otGP ? p.otW / p.otGP : 0))
      awards.bottler = worst(otP, (p) => (p.otGP ? p.otW / p.otGP : 1))
      awards.otMagnet = best(pArr, (p) => p.otGP)
    }
  }

  return {
    overview: {
      N,
      totalGoals,
      avgGoals,
      topScoreline,
      topScorelineCount,
      highestGame,
      biggestWin,
      rivalry,
      rivalryTotal,
      draws: confirmed.filter((g) => g.scoreA === g.scoreB).length,
    },
    ps,
    streaks,
    partners,
    h2h,
    awards,
    otGames,
  }
}
