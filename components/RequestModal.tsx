"use client";

import { useRef, useState } from "react";
import { Profile } from "./Card";

type Props = {
  target: Profile | null;
  onClose: () => void;
};

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

export default function RequestModal({ target, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  if (!target) return null;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit() {
    setStatus("loading");

    let photoUrl: string | undefined;
    if (photo) {
      try {
        const form = new FormData();
        form.append("file", photo);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setStatus("error");
          setErrorMsg(uploadData.error ?? "Photo upload failed.");
          return;
        }
        photoUrl = uploadData.url;
      } catch {
        setStatus("error");
        setErrorMsg("Photo upload failed. Please try again.");
        return;
      }
    }

    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_id: target!.id,
        requester_name: name,
        requester_email: email,
        requester_industry: industry,
        requester_role: role,
        requester_bio: bio,
        requester_photo: photoUrl,
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
    setIndustry("");
    setRole("");
    setBio("");
    setPhoto(null);
    setPhotoPreview(null);
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
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-zinc-100">
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

        {/* Body */}
        {status === "success" ? (
          <div className="py-10 px-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xl">
              ✓
            </div>
            <p className="text-lg font-semibold text-zinc-900">Request sent!</p>
            <p className="mt-2 text-sm text-zinc-500">
              We&apos;ll review your request and be in touch to make the introduction.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
            className="overflow-y-auto p-6 flex flex-col gap-4"
          >
            {/* Honeypot */}
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
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Your email</label>
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
                placeholder="e.g. Junior Marketing Manager"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                About you <span className="text-zinc-400">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What are you hoping to get out of this mentorship?"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                Profile photo <span className="text-zinc-400">(optional)</span>
              </label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 text-xs">
                    No photo
                  </div>
                )}
                <label className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                  {photoPreview ? "Change" : "Upload photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="text-sm text-zinc-400 hover:text-zinc-600"
                  >
                    Remove
                  </button>
                )}
              </div>
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
