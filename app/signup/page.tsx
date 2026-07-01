import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-white/10 bg-[#242424]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-white">
            Venture Cafe Phoenix Mentorship Network
          </Link>
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            ← Back to the Board
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Join the Network</h1>
          <p className="mt-1 text-white/60">
            Sign up as a mentor or mentee and get matched.
          </p>
        </div>
        <SignupForm />
      </main>
    </div>
  );
}
