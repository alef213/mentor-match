"use client";

import { useState } from "react";

export default function RemoveSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/remove-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (res.ok) {
      setStatus("success");
    } else {
      const data = await res.json();
      setStatus("error");
      setErrorMsg(data.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="mt-20 border-t border-white/10 pt-10 pb-16 text-center">
      <p className="text-sm font-medium text-white/70">Want to remove your listing?</p>
      <p className="mt-1 text-sm text-white/40">
        Enter your name and email and we&apos;ll send you a confirmation link.
      </p>

      {status === "success" ? (
        <p className="mt-4 text-sm text-[#60b09c]">
          Check your inbox — we sent you a confirmation link.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto mt-4 flex max-w-sm flex-col gap-3">
          <input
            required
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-white/20 bg-[#242424] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#60b09c]"
          />
          <input
            required
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-white/20 bg-[#242424] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#60b09c]"
          />
          {status === "error" && (
            <p className="text-sm text-red-400">{errorMsg}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-white/60 hover:bg-white/5 disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Send Confirmation Email"}
          </button>
        </form>
      )}

      <div className="mt-16 border-t border-white/10 pt-10">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-white/30">
          Brought to you by
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          <a href="https://venturecafephoenix.org/" target="_blank" rel="noopener noreferrer">
            <img
              src="/venturecafe-logo.png"
              alt="Venture Café Phoenix"
              className="h-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </a>
          <a href="https://resolutionresourcegroup.com/" target="_blank" rel="noopener noreferrer">
            <img
              src="/rrg-logo.png"
              alt="Resolution Resource Group LLC"
              className="h-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
