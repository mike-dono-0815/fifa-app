import { pgTable, text, integer, boolean, timestamp, pgEnum, index } from 'drizzle-orm/pg-core'

export const tournamentStatusEnum = pgEnum('tournament_status', ['live', 'finished'])

export const tournaments = pgTable('tournaments', {
  id: text('id').primaryKey(),
  status: tournamentStatusEnum('status').notNull().default('live'),
  currentRound: integer('current_round').notNull().default(1),
  title: text('title'),
  winnerName: text('winner_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  savedAt: timestamp('saved_at', { withTimezone: true }),
})

export const players = pgTable('players', {
  id: text('id').primaryKey(),
  tournamentId: text('tournament_id')
    .notNull()
    .references(() => tournaments.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  countryCode: text('country_code'),
  countryName: text('country_name'),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => ({
  byTournament: index('players_tournament_idx').on(t.tournamentId),
}))

export const games = pgTable('games', {
  id: text('id').primaryKey(),
  tournamentId: text('tournament_id')
    .notNull()
    .references(() => tournaments.id, { onDelete: 'cascade' }),
  round: integer('round').notNull(),
  teamAPlayer1: text('team_a_player1')
    .notNull()
    .references(() => players.id),
  teamAPlayer2: text('team_a_player2')
    .notNull()
    .references(() => players.id),
  teamBPlayer1: text('team_b_player1')
    .notNull()
    .references(() => players.id),
  teamBPlayer2: text('team_b_player2')
    .notNull()
    .references(() => players.id),
  scoreA: integer('score_a').notNull().default(0),
  scoreB: integer('score_b').notNull().default(0),
  confirmed: boolean('confirmed').notNull().default(false),
  overtime: boolean('overtime').notNull().default(false),
  touched: boolean('touched').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
}, (t) => ({
  byTournament: index('games_tournament_idx').on(t.tournamentId),
}))
