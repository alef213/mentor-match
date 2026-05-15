import { approveProfile } from "@/lib/airtable";

export default async function ApprovePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; secret?: string }>;
}) {
  const { id, secret } = await searchParams;

  let ok = false;
  if (id && secret === process.env.ADMIN_SECRET) {
    ok = await approveProfile(id);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        {ok ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-xl">
              ✓
            </div>
            <h1 className="mt-4 text-lg font-semibold text-zinc-900">Profile approved!</h1>
            <p className="mt-2 text-sm text-zinc-500">
              The profile is now live on the board.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 text-xl">
              ✕
            </div>
            <h1 className="mt-4 text-lg font-semibold text-zinc-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-zinc-500">
              This link is invalid or has already been used.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
