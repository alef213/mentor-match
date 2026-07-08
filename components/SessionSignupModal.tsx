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

export default function SessionSignupModal({ session, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!session) return null;

  const inputCls = "w-full rounded-lg border border-white/20 bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#60b09c]";

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
    setName("");
    setEmail("");
    setStatus("idle");
    setErrorMsg("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#242424] shadow-xl">
        <div className="flex items-start justify-between border-b border-white/10 p-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Sign Up for Session</h2>
            <p className="mt-0.5 text-sm text-white/60">
              {formatDate(session.date)} · {session.time}
            </p>
          </div>
          <button onClick={handleClose} className="ml-4 text-white/40 hover:text-white">✕</button>
        </div>

        {status === "success" ? (
          <div className="px-6 py-10 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#60b09c]/20 text-[#60b09c] text-xl">✓</div>
            <p className="text-lg font-semibold text-white">You&apos;re signed up!</p>
            <p className="mt-2 text-sm text-white/60">
              We&apos;ve sent a confirmation to your email. Our team will be in touch to confirm your spot.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 rounded-lg bg-[#60b09c] px-5 py-2 text-sm font-medium text-white hover:bg-[#4d9b86]"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Name</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>

            {status === "error" && <p className="text-sm text-red-400">{errorMsg}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-white/20 py-2 text-sm font-medium text-white/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 rounded-lg bg-[#60b09c] py-2 text-sm font-medium text-white hover:bg-[#4d9b86] disabled:opacity-60"
              >
                {status === "loading" ? "Signing up…" : "Sign Up"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
