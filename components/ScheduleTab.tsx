'use client'

import { useTransition } from 'react'
import type { Game, Player } from '@/lib/tournament/types'
import { flagSrc, playerById } from '@/lib/tournament/helpers'
import { confirmGame, lockFinalScore, toggleOvertime, updateScore } from '@/lib/tournament/actions'

function TeamPair({ ids, players, align }: { ids: [string, string]; players: Player[]; align: 'end' | 'start' }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${align === 'end' ? 'justify-end' : 'justify-start'}`}>
      {ids.map((id) => {
        const p = playerById(players, id)
        return (
          <span key={id} className="flex items-center gap-1.5">
            <span className="font-headline text-lg font-bold uppercase tracking-wide whitespace-nowrap text-text-primary sm:text-2xl">
              {p?.name ?? '?'}
            </span>
            <span className="font-headline text-sm font-bold text-text-muted sm:text-base">–</span>
            <img
              src={flagSrc(p?.countryCode)}
              alt=""
              className="h-[19px] w-7 flex-shrink-0 rounded-sm object-cover sm:h-[26px] sm:w-[38px]"
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

  const confirmedClass = game.confirmed
    ? 'border-l-[3px] border-l-green-bright shadow-[inset_4px_0_12px_rgba(0,230,118,.15)]'
    : ''
  const otBorderClass = game.overtime
    ? game.confirmed
      ? 'border-r-[3px] border-r-purple shadow-[inset_4px_0_12px_rgba(0,230,118,.15),inset_-4px_0_12px_rgba(168,85,247,.2)]'
      : 'border-r-[3px] border-r-purple shadow-[inset_-4px_0_12px_rgba(168,85,247,.2)]'
    : ''

  return (
    <div
      className={`print-avoid-break relative grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2 rounded-fifa border border-border-subtle bg-surface p-2.5 transition sm:gap-3 sm:p-4 ${
        !locked ? 'hover:border-border-mid hover:shadow-[0_0_16px_rgba(0,180,255,.15)]' : ''
      } ${confirmedClass} ${otBorderClass} ${locked ? 'pointer-events-none opacity-30' : ''}`}
    >
      <div className="font-headline flex flex-col items-center justify-center text-center text-[0.65rem] font-bold uppercase leading-tight tracking-wide text-text-muted sm:text-[0.72rem]">
        <span className="text-lg font-black leading-none text-text-secondary sm:text-xl">{gameNum}</span>
        <span>
          of&nbsp;{totalGames}
        </span>
      </div>

      <TeamPair ids={game.teamA} players={players} align="end" />

      <div className="flex min-w-[76px] flex-col items-center gap-1 sm:min-w-[100px]">
        {readonly ? (
          game.overtime && (
            <span className="rounded-full border border-purple-text bg-purple/20 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-purple-text shadow-[0_0_10px_rgba(168,85,247,.2)]">
              OT
            </span>
          )
        ) : (
          <button
            type="button"
            onClick={() => toggleOvertime(game.id)}
            className={`print:hidden rounded-full border px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest transition ${
              game.overtime
                ? 'border-purple-text bg-purple/20 text-purple-text shadow-[0_0_10px_rgba(168,85,247,.2)]'
                : 'border-border-mid text-text-secondary hover:border-purple-text hover:text-purple-text'
            }`}
          >
            OT
          </button>
        )}

        {readonly ? (
          <div className="flex items-center gap-0.5">
            <span className="font-headline text-2xl font-black leading-none sm:text-3xl">{game.scoreA}</span>
            <span className="font-headline px-1 text-2xl font-black leading-none text-text-muted sm:text-3xl">–</span>
            <span className="font-headline text-2xl font-black leading-none sm:text-3xl">{game.scoreB}</span>
          </div>
        ) : (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              disabled={game.scoreA === 0 || isPending}
              onClick={() => score('a', -1)}
              className="print:hidden flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border-subtle bg-raised text-text-secondary transition hover:border-blue-neon hover:bg-blue-neon hover:text-void hover:shadow-[0_0_12px_rgba(0,180,255,.15)] disabled:pointer-events-none disabled:opacity-30 sm:h-9 sm:w-9"
            >
              −
            </button>
            <span className="font-headline min-w-[1.4ch] text-center text-2xl font-black leading-none sm:text-3xl">
              {game.scoreA}
            </span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => score('a', 1)}
              className="print:hidden flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border-subtle bg-raised text-text-secondary transition hover:border-blue-neon hover:bg-blue-neon hover:text-void hover:shadow-[0_0_12px_rgba(0,180,255,.15)] sm:h-9 sm:w-9"
            >
              +
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => confirmGame(game.id))}
              title="Confirm as shown"
              className={`font-headline print:hidden px-0.5 text-2xl font-black leading-none transition sm:text-3xl ${
                confirmable
                  ? 'cursor-pointer text-text-muted hover:text-green-bright hover:[text-shadow:0_0_12px_rgba(0,230,118,.5)]'
                  : 'cursor-default text-text-muted'
              }`}
            >
              –
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => score('b', 1)}
              className="print:hidden flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border-subtle bg-raised text-text-secondary transition hover:border-blue-neon hover:bg-blue-neon hover:text-void hover:shadow-[0_0_12px_rgba(0,180,255,.15)] sm:h-9 sm:w-9"
            >
              +
            </button>
            <span className="font-headline min-w-[1.4ch] text-center text-2xl font-black leading-none sm:text-3xl">
              {game.scoreB}
            </span>
            <button
              type="button"
              disabled={game.scoreB === 0 || isPending}
              onClick={() => score('b', -1)}
              className="print:hidden flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border-subtle bg-raised text-text-secondary transition hover:border-blue-neon hover:bg-blue-neon hover:text-void hover:shadow-[0_0_12px_rgba(0,180,255,.15)] disabled:pointer-events-none disabled:opacity-30 sm:h-9 sm:w-9"
            >
              −
            </button>
          </div>
        )}

        <div
          className={`print:hidden h-2 w-2 rounded-full ${
            game.confirmed ? 'bg-green-bright shadow-[0_0_6px_var(--color-win)]' : 'bg-text-muted'
          }`}
        />
      </div>

      <TeamPair ids={game.teamB} players={players} align="start" />
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
  const isComplete = done === games.length && games.length > 0
  const lastGameLive = games.length > 0 && games.slice(0, -1).every((g) => g.confirmed)

  return (
    <div className="flex flex-col">
      <div className="mb-3.5 flex items-center gap-3">
        <span className="font-headline text-xl font-extrabold uppercase tracking-wide text-text-secondary sm:text-2xl">
          Round 1
        </span>
        <span className="ml-auto text-sm text-text-secondary">
          {done}/{games.length} played
        </span>
        {isComplete && (
          <span className="rounded-full border border-green-mid bg-green-deep px-2.5 py-0.5 text-xs font-semibold text-green-bright">
            ✓ Complete
          </span>
        )}
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
          className="font-headline print:hidden mx-auto mt-5 block rounded-fifa border-2 border-gold px-8 py-3 text-base font-extrabold uppercase tracking-widest text-gold shadow-[0_0_10px_rgba(255,215,0,.2)] transition hover:bg-gold/10 hover:shadow-[0_0_20px_rgba(255,215,0,.2)]"
        >
          🔒 Lock in Final Score
        </button>
      )}
    </div>
  )
}
