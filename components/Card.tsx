"use client";

export type Profile = {
  id: string;
  type: "mentor" | "mentee";
  name: string;
  email: string;
  industry: string;
  role: string;
  bio: string | null;
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
    ? profile.bio.slice(0, 100) + (profile.bio.length > 100 ? "…" : "")
    : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
          {initials(profile.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-zinc-900">{profile.name}</p>
          <p className="truncate text-sm text-zinc-500">{profile.role}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
          {profile.industry}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            profile.type === "mentor"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-sky-100 text-sky-700"
          }`}
        >
          {profile.type}
        </span>
      </div>

      {bio && <p className="text-sm leading-relaxed text-zinc-600">{bio}</p>}

      <button
        onClick={() => onRequestMatch(profile.id)}
        className="mt-auto self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Request match →
      </button>
    </div>
  );
}
