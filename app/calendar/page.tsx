import Link from "next/link";
import { getSignupCountsForDates } from "@/lib/airtable";
import { getUpcomingThursdays, SESSION_CAPACITY, SESSION_TIME } from "@/lib/sessions";
import CalendarBoard from "@/components/CalendarBoard";
import { Session } from "@/components/CalendarBoard";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const dates = getUpcomingThursdays(6);

  let counts: Record<string, number> = {};
  try {
    counts = await getSignupCountsForDates(dates);
  } catch {
    // show sessions with full capacity unknown — fail open
  }

  const sessions: Session[] = dates.map((date) => ({
    id: date,
    date,
    time: SESSION_TIME,
    capacity: SESSION_CAPACITY,
    spotsLeft: Math.max(0, SESSION_CAPACITY - (counts[date] ?? 0)),
  }));

  return (
    <div className="min-h-screen bg-black pb-8">
      <header className="border-b border-white/10 bg-[#242424]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold text-white">Venture Cafe Phoenix Mentorship Network</span>
          <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">
            ← Back to Board
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Upcoming Sessions</h1>
          <p className="mt-2 text-white/60">
            Every Thursday, 4:30 PM – 7:00 PM · {SESSION_CAPACITY} spots per session
          </p>
        </div>

        <CalendarBoard sessions={sessions} />
      </main>
    </div>
  );
}
