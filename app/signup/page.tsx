import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#112148]">
      <Link
        href="/"
        className="fixed left-5 top-20 z-50 flex items-center gap-2 rounded-full bg-[#fdfefe] px-4 py-2 text-sm font-medium text-[#112148] hover:bg-[#e0e4f0] transition-colors"
      >
        ← Back
      </Link>
      <header className="border-b border-[#fdfefe]/10 bg-[#0d1a38]">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4">
          <span className="text-xl font-bold text-[#fdfefe]">Venture Cafe Phoenix Mentorship Network</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-center px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#fdfefe]">Join the Network</h1>
          <p className="mt-1 text-[#727272]">
            Sign up as a mentor or mentee and get matched.
          </p>
        </div>
        <SignupForm />
      </main>
    </div>
  );
}
