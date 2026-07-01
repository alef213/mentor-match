"use client";

import { useRef, useState } from "react";
import { Profile } from "./Card";
import { INDUSTRIES } from "@/lib/constants";

type Props = {
  target: Profile | null;
  onClose: () => void;
};

const inputCls = "w-full rounded-lg border border-white/20 bg-black px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#60b09c]";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#242424] border border-white/10 shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">Request a match</h2>
            <p className="text-sm text-white/60">
              Connecting with <span className="font-medium text-white">{target.name}</span> ({target.type})
            </p>
          </div>
          <button
            onClick={handleClose}
            className="ml-4 text-white/40 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {status === "success" ? (
          <div className="py-10 px-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#60b09c]/20 text-[#60b09c] text-xl">
              ✓
            </div>
            <p className="text-lg font-semibold text-white">Request sent!</p>
            <p className="mt-2 text-sm text-white/60">
              Thank you — you&apos;ll hear from us within 7 days.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 rounded-lg bg-[#60b09c] px-5 py-2 text-sm font-medium text-white hover:bg-[#4d9b86]"
            >
              Close
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
            className="overflow-y-auto p-6 flex flex-col gap-4"
          >
            <input
              ref={honeypotRef}
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              style={{ position: "absolute", left: "-9999px", opacity: 0 }}
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Your Name</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Your Email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Industry</label>
              <select
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={inputCls}
              >
                <option value="">Select Industry…</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Role / Title</label>
              <input
                required
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Junior Marketing Manager"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">
                About You <span className="text-white/30">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What are you hoping to get out of this mentorship?"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">
                Profile Photo <span className="text-white/30">(optional)</span>
              </label>
              <div className="flex items-center gap-4">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/30 text-xs">
                    No photo
                  </div>
                )}
                <label className="cursor-pointer rounded-lg border border-white/20 px-3 py-2 text-sm text-white/70 hover:bg-white/5">
                  {photoPreview ? "Change" : "Upload photo"}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </label>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="text-sm text-white/30 hover:text-white/60"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-white/70">
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
              <p className="text-sm text-red-400">{errorMsg}</p>
            )}

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
                {status === "loading" ? "Sending…" : "Send Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
