'use client'

import { useTransition } from 'react'
import type { Game, Player } from '@/lib/tournament/types'
import { flagSrc, playerById } from '@/lib/tournament/helpers'
import { confirmGame, lockFinalScore, toggleOvertime, updateScore } from '@/lib/tournament/actions'

function TeamPair({ ids, players }: { ids: [string, string]; players: Player[] }) {
  return (
    <div className="flex flex-col gap-0.5 text-sm">
      {ids.map((id) => {
        const p = playerById(players, id)
        return (
          <span key={id} className="flex items-center gap-1.5">
            <span className="text-text-primary">{p?.name ?? '?'}</span>
            <img
              src={flagSrc(p?.countryCode)}
              alt=""
              className="h-3.5 w-5 rounded-sm object-cover"
              onError={(e) => {
                e.currentTarget.style.opacity = '0'
              }}
            />
          </span>
        )
      })}
    </div>
  )
}

function GameRow({
  game,
  gameNum,
  totalGames,
  players,
  readonly,
  locked,
}: {
  game: Game
  gameNum: number
  totalGames: number
  players: Player[]
  readonly: boolean
  locked: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const confirmable = !game.touched && !game.confirmed

  function score(side: 'a' | 'b', delta: number) {
    startTransition(() => {
      updateScore(game.id, side, delta)
    })
  }

  return (
    <div
      className={`grid grid-cols-[2rem_1fr_auto_1fr] items-center gap-2 rounded-fifa-sm border p-2.5 ${
        game.confirmed ? 'border-green-mid/40 bg-surface' : 'border-border-subtle bg-raised'
      } ${locked ? 'pointer-events-none opacity-30' : ''} ${game.overtime ? 'ring-1 ring-purple/50' : ''}`}
    >
      <div className="text-xs text-text-muted">
        {gameNum}<span className="text-text-muted/60">/{totalGames}</span>
      </div>

      <TeamPair ids={game.teamA} players={players} />

      <div className="flex flex-col items-center gap-1">
        {!readonly && (
          <button
            type="button"
            onClick={() => toggleOvertime(game.id)}
            className={`rounded px-1.5 text-[10px] font-bold ${
              game.overtime ? 'bg-purple text-white' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            OT
          </button>
        )}
        {readonly ? (
          <div className="flex items-center gap-1.5 text-lg font-semibold">
            <span>{game.scoreA}</span>
            <span className="text-text-muted">–</span>
            <span>{game.scoreB}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={game.scoreA === 0 || isPending}
              onClick={() => score('a', -1)}
              className="h-6 w-6 rounded bg-input text-text-primary disabled:opacity-30"
            >
              −
            </button>
            <span className="w-5 text-center text-lg font-semibold">{game.scoreA}</span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => score('a', 1)}
              className="h-6 w-6 rounded bg-input text-text-primary"
            >
              +
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => confirmGame(game.id))}
              className={`px-1 text-sm ${confirmable ? 'text-blue-neon' : 'text-text-muted'}`}
              title="Confirm as shown"
            >
              –
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => score('b', 1)}
              className="h-6 w-6 rounded bg-input text-text-primary"
            >
              +
            </button>
            <span className="w-5 text-center text-lg font-semibold">{game.scoreB}</span>
            <button
              type="button"
              disabled={game.scoreB === 0 || isPending}
              onClick={() => score('b', -1)}
              className="h-6 w-6 rounded bg-input text-text-primary disabled:opacity-30"
            >
              −
            </button>
          </div>
        )}
        <div className={`h-1.5 w-1.5 rounded-full ${game.confirmed ? 'bg-green-bright' : 'bg-text-muted'}`} />
      </div>

      <TeamPair ids={game.teamB} players={players} />
    </div>
  )
}

export function ScheduleTab({
  games,
  players,
  tournamentId,
  status,
}: {
  games: Game[]
  players: Player[]
  tournamentId: string
  status: 'live' | 'finished'
}) {
  const readonly = status === 'finished'
  const firstUnconfirmedIndex = games.findIndex((g) => !g.confirmed)
  const done = games.filter((g) => g.confirmed).length
  const lastGameLive = games.length > 0 && games.slice(0, -1).every((g) => g.confirmed)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-secondary">Round 1</span>
        <span className="text-xs text-text-muted">{done}/{games.length} played</span>
      </div>
      <div className="flex flex-col gap-2">
        {games.map((g, i) => (
          <GameRow
            key={g.id}
            game={g}
            gameNum={i + 1}
            totalGames={games.length}
            players={players}
            readonly={readonly}
            locked={!readonly && firstUnconfirmedIndex >= 0 && i > firstUnconfirmedIndex}
          />
        ))}
      </div>
      {!readonly && lastGameLive && (
        <button
          type="button"
          onClick={() => lockFinalScore(tournamentId)}
          className="self-center rounded-fifa border border-green-bright px-4 py-2 text-sm font-semibold text-green-bright hover:bg-green-bright/10"
        >
          Lock in Final Score
        </button>
      )}
    </div>
  )
}
