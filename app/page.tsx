import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Board from "@/components/Board";
import { Profile } from "@/components/Card";

export default async function Home() {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">MentorMatch</h1>
            <p className="text-sm text-zinc-500">Find your mentor or mentee</p>
          </div>
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Join the board
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {!profiles || profiles.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-zinc-500">No profiles yet. Be the first to join!</p>
            <Link
              href="/signup"
              className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Sign up →
            </Link>
          </div>
        ) : (
          <Board profiles={profiles as Profile[]} />
        )}
      </main>
    </div>
  );
}
