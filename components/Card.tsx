"use client";

export type Profile = {
  id: string;
  type: "mentor" | "mentee";
  name: string;
  email: string;
  industry: string;
  role: string;
  bio: string | null;
  linkedin: string | null;
  photo: string | null;
  is_active: boolean;
  created_at: string;
};

type Props = {
  profile: Profile;
  onRequestMatch: (id: string) => void;
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function Card({ profile, onRequestMatch }: Props) {
  const bio = profile.bio
    ? profile.bio.slice(0, 280) + (profile.bio.length > 280 ? "…" : "")
    : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#fdfefe]/10 bg-[#0d1a38] p-5">
      <div className="flex items-start gap-4">
        {profile.photo ? (
          <img
            src={profile.photo}
            alt={profile.name}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fdfefe]/10 text-sm font-semibold text-[#fdfefe]">
            {initials(profile.name)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#fdfefe]">{profile.name}</p>
          <p className="truncate text-sm text-[#727272]">{profile.role}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-[#fdfefe]/10 px-2.5 py-0.5 text-xs text-[#fdfefe]/70">
          {profile.industry}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            profile.type === "mentor"
              ? "bg-[#fdfefe]/15 text-[#fdfefe]"
              : "bg-[#727272]/20 text-[#727272]"
          }`}
        >
          {profile.type.charAt(0).toUpperCase() + profile.type.slice(1)}
        </span>
      </div>

      {bio && <p className="text-sm leading-relaxed text-[#fdfefe]/70">{bio}</p>}

      {profile.linkedin && (
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#fdfefe]/60 hover:text-[#fdfefe] hover:underline"
        >
          LinkedIn Profile →
        </a>
      )}

      <button
        onClick={() => onRequestMatch(profile.id)}
        className="mt-auto self-start rounded-lg bg-[#fdfefe] px-4 py-2 text-sm font-medium text-[#112148] transition-colors hover:bg-[#e0e4f0]"
      >
        Request Match →
      </button>
    </div>
  );
}
