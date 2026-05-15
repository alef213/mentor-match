"use client";

import { useRef, useState } from "react";
import { Profile } from "./Card";

type Props = {
  target: Profile | null;
  onClose: () => void;
};

export default function RequestModal({ target, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  if (!target) return null;

  async function handleSubmit() {
    setStatus("loading");

    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_id: target!.id,
        requester_name: name,
        requester_email: email,
        message,
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

  function handleClose() {
    setName("");
    setEmail("");
    setMessage("");
    setConsent(false);
    setStatus("idle");
    setErrorMsg("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Request a match</h2>
            <p className="text-sm text-zinc-500">
              Connecting with <span className="font-medium">{target.name}</span> ({target.type})
            </p>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 text-zinc-400 hover:text-zinc-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {status === "success" ? (
          <div className="py-6 text-center">
            <p className="text-lg font-medium text-emerald-600">Request sent!</p>
            <p className="mt-1 text-sm text-zinc-500">
              We&apos;ll be in touch to make the introduction.
            </p>
            <button
              onClick={handleClose}
              className="mt-5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Close
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
              <label className="mb-1 block text-sm font-medium text-zinc-700">Your name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Your email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Message <span className="text-zinc-400">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-zinc-200 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {status === "loading" ? "Sending…" : "Send request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
