"use client";

import { useRef, useState } from "react";

type Tab = "mentee" | "mentor";

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Marketing",
  "Design",
  "Legal",
  "Operations",
  "Sales",
  "Other",
];

export default function SignupForm() {
  const [tab, setTab] = useState<Tab>("mentee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  function reset() {
    setName("");
    setEmail("");
    setIndustry("");
    setRole("");
    setBio("");
    setConsent(false);
    setStatus("idle");
    setErrorMsg("");
  }

  async function handleSubmit() {
    setStatus("loading");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: tab,
        name,
        email,
        industry,
        role,
        bio,
        consent,
        honeypot: honeypotRef.current?.value ?? "",
      }),
    });

    const data = await res.json();
    if (data.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMsg(data.error ?? "Something went wrong.");
    }
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {/* Tabs */}
      <div className="mb-6 flex rounded-xl bg-zinc-100 p-1">
        {(["mentee", "mentor"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); reset(); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {t === "mentee" ? "I want a mentor" : "I am a mentor"}
          </button>
        ))}
      </div>

      {status === "success" ? (
        <div className="py-8 text-center">
          <p className="text-lg font-medium text-emerald-600">You&apos;re on the board!</p>
          <p className="mt-1 text-sm text-zinc-500">
            Your profile is live. We&apos;ll reach out when there&apos;s a match.
          </p>
          <button
            onClick={() => { reset(); }}
            className="mt-5 rounded-lg border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Submit another
          </button>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="flex flex-col gap-4">
          {/* Honeypot — hidden via CSS, not display:none */}
          <input
            ref={honeypotRef}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            style={{ position: "absolute", left: "-9999px", opacity: 0 }}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Industry</label>
            <select
              required
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select industry…</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">Role / title</label>
            <input
              required
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Product Manager"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700">
              Bio <span className="text-zinc-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={
                tab === "mentor"
                  ? "What can you help with? Any specialties?"
                  : "What are you looking for in a mentor?"
              }
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5"
              required
            />
            I agree to be contacted for mentorship purposes
          </label>

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {status === "loading" ? "Submitting…" : "Join the board"}
          </button>
        </form>
      )}
    </div>
  );
}
