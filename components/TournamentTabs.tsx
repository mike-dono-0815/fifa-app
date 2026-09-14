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
      <div className="flex gap-1 border-b border-border-subtle print:hidden">
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

      {/* All three panels stay mounted (visibility via .tab-panel/.active,
          not conditional rendering) so @media print can reveal all three
          stacked, not just whichever one was last clicked. */}
      <div id="tab-table" className={`tab-panel${tab === 'table' ? ' active' : ''}`}>
        <TableTab players={players} games={games} finished={status === 'finished'} />
      </div>
      <div id="tab-schedule" className={`tab-panel${tab === 'schedule' ? ' active' : ''}`}>
        <ScheduleTab games={games} players={players} tournamentId={tournamentId} status={status} />
      </div>
      <div id="tab-stats" className={`tab-panel${tab === 'stats' ? ' active' : ''}`}>
        <StatsTab players={players} games={games} />
      </div>
    </div>
  )
}
