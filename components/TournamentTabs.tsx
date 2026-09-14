'use client'

import { useState } from 'react'
import type { Game, Player } from '@/lib/tournament/types'
import { ScheduleTab } from './ScheduleTab'
import { TableTab } from './TableTab'
import { StatsTab } from './StatsTab'

type Tab = 'schedule' | 'table' | 'stats'

export function TournamentTabs({
  tournamentId,
  status,
  players,
  games,
}: {
  tournamentId: string
  status: 'live' | 'finished'
  players: Player[]
  games: Game[]
}) {
  const [tab, setTab] = useState<Tab>('schedule')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 border-b border-border-subtle">
        {(['schedule', 'table', 'stats'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium capitalize ${
              tab === t
                ? 'border-b-2 border-green-bright text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'schedule' && (
        <ScheduleTab games={games} players={players} tournamentId={tournamentId} status={status} />
      )}
      {tab === 'table' && <TableTab players={players} games={games} finished={status === 'finished'} />}
      {tab === 'stats' && <StatsTab players={players} games={games} />}
    </div>
  )
}
