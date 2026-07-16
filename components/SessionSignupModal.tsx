"use client";

import { useState } from "react";
import { Session } from "./CalendarBoard";

type Props = {
  session: Session | null;
  onClose: () => void;
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

const inputCls = "w-full rounded-lg border border-[#fdfefe]/20 bg-[#112148] px-3 py-2 text-sm text-[#fdfefe] placeholder:text-[#727272] focus:outline-none focus:ring-2 focus:ring-[#727272]";

export default function SessionSignupModal({ session, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!session) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/session-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: session!.id, name, email }),
    });

    const data = await res.json();
    if (data.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(data.error ?? "Something went wrong.");
    }
  }

  function handleClose() {
    setName(""); setEmail(""); setStatus("idle"); setErrorMsg("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#112148]/80 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-[#fdfefe]/10 bg-[#0d1a38] shadow-xl">
        <div className="flex items-start justify-between border-b border-[#fdfefe]/10 p-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#fdfefe]">Sign Up for Session</h2>
            <p className="mt-0.5 text-sm text-[#727272]">
              {formatDate(session.date)} · {session.time}
            </p>
          </div>
          <button onClick={handleClose} className="ml-4 text-[#727272] hover:text-[#fdfefe]">✕</button>
        </div>

        {status === "success" ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fdfefe]/10 text-[#fdfefe] text-xl">✓</div>
            <p className="text-lg font-semibold text-[#fdfefe]">You&apos;re signed up!</p>
            <p className="mt-2 text-sm text-[#727272]">
              We&apos;ve sent a confirmation to your email. Our team will be in touch to confirm your spot.
            </p>
            <button onClick={handleClose} className="mt-6 rounded-lg bg-[#fdfefe] px-5 py-2 text-sm font-medium text-[#112148] hover:bg-[#e0e4f0]">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#fdfefe]/80">Name</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#fdfefe]/80">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>

            {status === "error" && <p className="text-sm text-red-400">{errorMsg}</p>}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleClose} className="flex-1 rounded-lg border border-[#fdfefe]/20 py-2 text-sm font-medium text-[#727272] hover:text-[#fdfefe] hover:bg-[#fdfefe]/5">
                Cancel
              </button>
              <button type="submit" disabled={status === "loading"} className="flex-1 rounded-lg bg-[#fdfefe] py-2 text-sm font-medium text-[#112148] hover:bg-[#e0e4f0] disabled:opacity-60">
                {status === "loading" ? "Signing up…" : "Sign Up"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
