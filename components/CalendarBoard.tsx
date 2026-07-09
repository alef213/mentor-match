"use client";

import { useState } from "react";
import SessionSignupModal from "./SessionSignupModal";

export type Session = {
  id: string;
  date: string;
  time: string;
  capacity: number;
  spotsLeft: number;
};

type Props = {
  sessions: Session[];
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

export default function CalendarBoard({ sessions }: Props) {
  const [selected, setSelected] = useState<Session | null>(null);

  if (sessions.length === 0) {
    return (
      <p className="text-center text-white/50 py-16">
        No upcoming sessions scheduled. Check back soon.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {sessions.map((s) => {
          const full = s.spotsLeft === 0;
          return (
            <div
              key={s.id}
              className="rounded-2xl border border-white/10 bg-[#242424] p-6 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-white">{formatDate(s.date)}</p>
                  <p className="text-sm text-white/60 mt-0.5">{s.time}</p>
                </div>
                {full ? (
                  <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs text-white/40">Full</span>
                ) : (
                  <span className="shrink-0 rounded-full bg-[#60b09c]/20 px-3 py-1 text-xs text-[#60b09c]">
                    {s.spotsLeft} spot{s.spotsLeft !== 1 ? "s" : ""} left
                  </span>
                )}
              </div>

<button
                disabled={full}
                onClick={() => setSelected(s)}
                className="mt-auto w-full rounded-lg bg-[#60b09c] py-2 text-sm font-medium text-white hover:bg-[#4d9b86] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {full ? "Session Full" : "Sign Up"}
              </button>
            </div>
          );
        })}
      </div>

      <SessionSignupModal session={selected} onClose={() => setSelected(null)} />
    </>
  );
}
