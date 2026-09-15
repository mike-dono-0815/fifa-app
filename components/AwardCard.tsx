import type { Awards, Player, PlayerStats, Streak } from '@/lib/tournament/types'
import { flagSrc, playerById } from '@/lib/tournament/helpers'

type AwardStyle = 'gold' | 'blue' | 'red' | 'purple' | 'plain'

const styleClasses: Record<AwardStyle, string> = {
  gold: 'border-gold-dim bg-[linear-gradient(135deg,#1a1500,#2a2200)] shadow-[0_0_16px_rgba(255,215,0,.2)]',
  blue: 'border-[rgba(0,180,255,.3)] bg-[linear-gradient(135deg,#0a0d1a,#141a2a)] shadow-[0_0_12px_rgba(0,180,255,.15)]',
  purple: 'border-[rgba(168,85,247,.3)] bg-[linear-gradient(135deg,#110a1a,#1a1028)] shadow-[0_0_12px_rgba(168,85,247,.2)]',
  red: 'border-[rgba(255,77,77,.3)] bg-[linear-gradient(135deg,#1a0a0a,#2a1010)]',
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
      <div className="print-avoid-break rounded-fifa border border-border-subtle bg-surface p-4 opacity-40 transition">
        <div className="mb-2 text-[1.6rem] leading-none">{icon}</div>
        <div className="font-headline mb-2 text-sm font-extrabold uppercase tracking-wide text-text-secondary">
          {title}
        </div>
        <div className="text-[0.85rem] leading-snug text-text-secondary">Not enough data yet</div>
      </div>
    )
  }
  const p = playerById(players, player.id)
  return (
    <div className={`print-avoid-break rounded-fifa border p-4 transition ${styleClasses[style]}`}>
      <div className="mb-2 text-[1.6rem] leading-none">{icon}</div>
      <div className="font-headline mb-2 text-sm font-extrabold uppercase tracking-wide text-text-secondary">
        {title}
      </div>
      <div className="mb-1.5 flex items-center gap-2">
        <img
          src={flagSrc(p?.countryCode)}
          alt=""
          className="h-[19px] w-7 rounded-sm object-cover"
          onError={(e) => {
            e.currentTarget.style.opacity = '0'
          }}
        />
        <span className="font-headline text-xl font-extrabold uppercase text-text-primary">{p?.name ?? '?'}</span>
      </div>
      <div className="text-[0.85rem] leading-snug text-text-secondary">{desc}</div>
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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
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
