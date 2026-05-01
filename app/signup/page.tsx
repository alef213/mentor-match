import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-zinc-900">
            MentorMatch
          </Link>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
            ← Back to board
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">Join MentorMatch</h1>
          <p className="mt-1 text-zinc-500">
            Sign up as a mentor or mentee and get matched.
          </p>
        </div>
        <SignupForm />
      </main>
    </div>
  );
}
