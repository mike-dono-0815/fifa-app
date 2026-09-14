export type Player = {
  id: string
  name: string
  countryCode: string | null
  countryName: string | null
}

export type GameResult = 'W' | 'D' | 'L'

export type Game = {
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

export type TournamentState = {
  players: Player[]
  games: Game[]
  currentRound: number
  createdAt: number | string | null
}

export type Standing = {
  id: string
  gp: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  pts: number
}

export type PlayerStats = {
  id: string
  gp: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  pts: number
  cleanSheets: number
  bestSingleGF: number
  bestSingleGA: number
  bestWinDiff: number
  worstLossDiff: number
  narrowWins: number
  gameResults: GameResult[]
  otGP: number
  otW: number
  otL: number
  otD: number
}

export type Streak = {
  current: number
  type: GameResult | ''
  longestW: number
  longestL: number
  longestUnbeaten: number
}

export type Partnership = {
  gp: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  otGP: number
  otW: number
  otL: number
}

export type H2HRecord = { w: number; d: number; l: number }

// keyed by pairKey(idA, idB); each entry holds both directional records,
// e.g. h2h[pairKey]['idA_vs_idB'] and h2h[pairKey]['idB_vs_idA']
export type H2H = Record<string, Record<string, H2HRecord>>

export type Rivalry = { idA: string; idB: string } & H2HRecord

export type Awards = {
  topScorer: PlayerStats | null
  goldenGlove: PlayerStats | null
  mvp: PlayerStats | null
  liability: PlayerStats | null
  brickWall: PlayerStats | null
  goalMachine: PlayerStats | null
  unbreakable: PlayerStats | null
  punchingBag: PlayerStats | null
  kingOfDraws: PlayerStats | null
  ironMan: PlayerStats | null
  clutchPlayer: PlayerStats | null
  bottler: PlayerStats | null
  otMagnet: PlayerStats | null
}

export type StatsOverview = {
  N: number
  totalGoals: number
  avgGoals: number
  topScoreline: string
  topScorelineCount: number
  highestGame: Game | null
  biggestWin: Game | null
  rivalry: Rivalry | null
  rivalryTotal: number
  draws: number
}

export type Stats = {
  overview: StatsOverview
  ps: Record<string, PlayerStats>
  streaks: Record<string, Streak>
  partners: Record<string, Partnership>
  h2h: H2H
  awards: Awards
  otGames: Game[]
}
