"use client";

import { useRef, useState } from "react";
import { INDUSTRIES } from "@/lib/constants";

type Tab = "mentee" | "mentor";

const inputCls = "w-full rounded-lg border border-[#fdfefe]/20 bg-[#112148] px-3 py-2 text-sm text-[#fdfefe] placeholder:text-[#727272] focus:outline-none focus:ring-2 focus:ring-[#727272]";

export default function SignupForm() {
  const [tab, setTab] = useState<Tab>("mentee");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [consent, setConsent] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  function reset() {
    setName(""); setEmail(""); setIndustry(""); setRole(""); setBio("");
    setLinkedin(""); setConsent(false); setPhoto(null); setPhotoPreview(null);
    setStatus("idle"); setErrorMsg("");
  }

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

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: tab, name, email, industry, role, bio, linkedin, photo: photoUrl, consent, honeypot: honeypotRef.current?.value ?? "" }),
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
    <div className="w-full max-w-lg rounded-2xl border border-[#fdfefe]/10 bg-[#0d1a38] p-6">
      <div className="mb-6 flex rounded-xl bg-[#112148] p-1">
        {(["mentee", "mentor"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); reset(); }}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-[#fdfefe] text-[#112148] shadow-sm"
                : "text-[#727272] hover:text-[#fdfefe]"
            }`}
          >
            {t === "mentee" ? "I want a Mentor" : "I am a Mentor"}
          </button>
        ))}
      </div>

      {status === "success" ? (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#fdfefe]/10 text-[#fdfefe] text-xl">
            ✓
          </div>
          <p className="text-lg font-semibold text-[#fdfefe]">Thanks for submitting!</p>
          <p className="mt-2 text-sm text-[#727272]">
            We sent a confirmation email to your inbox — please click the link to verify your address. If you don&apos;t see it, check your spam folder.
          </p>
          <p className="mt-3 text-sm text-[#727272]/70">
            Once you confirm, your profile will be reviewed by our team. As soon as it&apos;s approved it will go live on the board, and we&apos;ll reach out when there&apos;s a match.
          </p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }} className="flex flex-col gap-4">
          <input ref={honeypotRef} name="website" type="text" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px", opacity: 0 }} />

          <div>
            <label className="mb-1 block text-sm font-medium text-[#fdfefe]/80">Name</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#fdfefe]/80">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#fdfefe]/80">Industry</label>
            <select required value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCls}>
              <option value="">Select industry…</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#fdfefe]/80">Role / Title</label>
            <input required type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Product Manager" className={inputCls} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#fdfefe]/80">Bio</label>
            <textarea
              required rows={3} maxLength={280} value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={tab === "mentor" ? "What can you help with? Any specialties?" : "What are you looking for in a mentor?"}
              className={inputCls}
            />
            <p className={`mt-1 text-right text-xs ${bio.length >= 260 ? "text-[#fdfefe]" : "text-[#727272]"}`}>
              {bio.length}/280
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#fdfefe]/80">
              LinkedIn <span className="text-[#727272]">(optional)</span>
            </label>
            <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" className={inputCls} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#fdfefe]/80">
              Profile Photo <span className="text-[#727272]">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fdfefe]/10 text-[#727272] text-xs">
                  No photo
                </div>
              )}
              <label className="cursor-pointer rounded-lg border border-[#fdfefe]/20 px-3 py-2 text-sm text-[#727272] hover:text-[#fdfefe] hover:bg-[#fdfefe]/5">
                {photoPreview ? "Change" : "Upload photo"}
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              {photoPreview && (
                <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="text-sm text-[#727272] hover:text-[#fdfefe]">
                  Remove
                </button>
              )}
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-[#727272]">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" required />
            I agree to be contacted for mentorship purposes
          </label>

          {status === "error" && <p className="text-sm text-red-400">{errorMsg}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-[#fdfefe] py-2.5 text-sm font-medium text-[#112148] hover:bg-[#e0e4f0] disabled:opacity-60"
          >
            {status === "loading" ? "Submitting…" : "Join the Network"}
          </button>
        </form>
      )}
    </div>
  );
}
