import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { tournaments } from '@/lib/db/schema'
import { SetupForm } from '@/components/SetupForm'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const live = await db
    .select({ id: tournaments.id })
    .from(tournaments)
    .where(eq(tournaments.status, 'live'))
    .limit(1)
  if (live.length) redirect(`/tournaments/${live[0].id}`)

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-xl text-center mb-8">
        <h1 className="headline text-4xl sm:text-5xl text-text-primary">FC Tournament</h1>
        <p className="mt-2 text-text-secondary">2v2 Edition</p>
        <a
          href="/tournaments"
          className="headline mt-4 inline-flex items-center gap-2 rounded-fifa border border-blue-neon bg-blue-neon/10 px-5 py-2.5 text-sm text-blue-neon shadow-[0_0_16px_rgba(0,180,255,.12)] transition hover:bg-blue-neon/20 hover:shadow-[0_0_22px_rgba(0,180,255,.22)]"
        >
          📋 All Tournaments →
        </a>
      </div>
      <SetupForm />
    </main>
  )
}
