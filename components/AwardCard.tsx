import type { Awards, Player, PlayerStats, Streak } from '@/lib/tournament/types'
import { flagSrc, playerById } from '@/lib/tournament/helpers'

type AwardStyle = 'gold' | 'blue' | 'red' | 'purple' | 'plain'

const styleClasses: Record<AwardStyle, string> = {
  gold: 'border-gold/40 bg-gold/10',
  blue: 'border-blue-neon/40 bg-blue-neon/10',
  red: 'border-loss/40 bg-loss/10',
  purple: 'border-purple/40 bg-purple/10',
  plain: 'border-border-subtle bg-surface',
}

function AwardCard({
  icon,
  title,
  player,
  players,
  desc,
  style = 'plain',
}: {
  icon: string
  title: string
  player: PlayerStats | null | undefined
  players: Player[]
  desc: string
  style?: AwardStyle
}) {
  if (!player) {
    return (
      <div className="print-avoid-break flex flex-col items-center gap-1 rounded-fifa border border-border-subtle bg-surface p-3 text-center opacity-40">
        <div className="text-2xl">{icon}</div>
        <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{title}</div>
        <div className="text-xs text-text-muted">Not enough data yet</div>
      </div>
    )
  }
  const p = playerById(players, player.id)
  return (
    <div className={`print-avoid-break flex flex-col items-center gap-1 rounded-fifa border p-3 text-center ${styleClasses[style]}`}>
      <div className="text-2xl">{icon}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{title}</div>
      <span className="flex items-center gap-1.5 text-sm font-semibold text-text-primary">
        <img
          src={flagSrc(p?.countryCode)}
          alt=""
          className="h-3 w-4 rounded-sm object-cover"
          onError={(e) => {
            e.currentTarget.style.opacity = '0'
          }}
        />
        {p?.name ?? '?'}
      </span>
      <div className="text-xs text-text-muted">{desc}</div>
    </div>
  )
}

export function AwardsGrid({
  awards,
  streaks,
  otGamesCount,
  players,
}: {
  awards: Awards
  streaks: Record<string, Streak>
  otGamesCount: number
  players: Player[]
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      <AwardCard icon="⚽" title="Top Scorer" player={awards.topScorer} players={players} desc={`${awards.topScorer?.gf ?? 0} goals`} style="gold" />
      <AwardCard
        icon="🧤"
        title="Golden Glove"
        player={awards.goldenGlove}
        players={players}
        desc={awards.goldenGlove ? `${(awards.goldenGlove.ga / awards.goldenGlove.gp).toFixed(2)} GA/game` : ''}
      />
      <AwardCard icon="🏆" title="MVP" player={awards.mvp} players={players} desc={`${awards.mvp?.pts ?? 0} points`} style="gold" />
      <AwardCard
        icon="📈"
        title="Goal Machine"
        player={awards.goalMachine}
        players={players}
        desc={awards.goalMachine ? `${(awards.goalMachine.gf / awards.goalMachine.gp).toFixed(2)} goals/game` : ''}
        style="blue"
      />
      <AwardCard icon="🧱" title="Brick Wall" player={awards.brickWall} players={players} desc={`${awards.brickWall?.cleanSheets ?? 0} clean sheets`} style="blue" />
      <AwardCard
        icon="💎"
        title="Unbreakable"
        player={awards.unbreakable}
        players={players}
        desc={awards.unbreakable ? `${streaks[awards.unbreakable.id]?.longestUnbeaten ?? 0}-game unbeaten streak` : ''}
      />
      <AwardCard icon="😬" title="Liability" player={awards.liability} players={players} desc={`${awards.liability?.ga ?? 0} goals conceded`} style="red" />
      <AwardCard icon="😓" title="Punching Bag" player={awards.punchingBag} players={players} desc={`${awards.punchingBag?.l ?? 0} losses`} style="red" />
      {awards.kingOfDraws && awards.kingOfDraws.d > 0 && (
        <AwardCard icon="🤝" title="King of Draws" player={awards.kingOfDraws} players={players} desc={`${awards.kingOfDraws.d} draws`} />
      )}
      {awards.ironMan && <AwardCard icon="🦾" title="Iron Man" player={awards.ironMan} players={players} desc={`${awards.ironMan.gp} games played`} style="blue" />}
      {otGamesCount >= 2 && awards.clutchPlayer && (
        <AwardCard
          icon="⚡"
          title="Clutch Player"
          player={awards.clutchPlayer}
          players={players}
          desc={`${Math.round((awards.clutchPlayer.otW / awards.clutchPlayer.otGP) * 100)}% OT win rate`}
          style="purple"
        />
      )}
      {otGamesCount >= 2 && awards.bottler && (
        <AwardCard
          icon="🫣"
          title="Bottler"
          player={awards.bottler}
          players={players}
          desc={`${Math.round((awards.bottler.otW / awards.bottler.otGP) * 100)}% OT win rate`}
          style="red"
        />
      )}
      {otGamesCount >= 1 && awards.otMagnet && (
        <AwardCard icon="🕐" title="OT Magnet" player={awards.otMagnet} players={players} desc={`${awards.otMagnet.otGP} OT games`} style="purple" />
      )}
    </div>
  )
}
