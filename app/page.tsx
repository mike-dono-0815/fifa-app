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
        <a href="/tournaments" className="mt-3 inline-block text-sm text-blue-neon hover:underline">
          📋 All Tournaments →
        </a>
      </div>
      <SetupForm />
    </main>
  )
}
