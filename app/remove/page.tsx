import { processRemoval } from "@/lib/airtable";
import { resend } from "@/lib/resend";
import Link from "next/link";

export default async function RemovePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <Result success={false} message="Invalid removal link." />;
  }

  const profile = await processRemoval(token);

  if (!profile) {
    return <Result success={false} message="This link is invalid or has already been used." />;
  }

  try {
    await resend.emails.send({
      from: "Venture Cafe Phoenix Mentorship Network <onboarding@resend.dev>",
      to: "resolutionresourcegroupllc@gmail.com",
      subject: `Removal request: ${profile.name}`,
      text: `${profile.name} (${profile.email}) has confirmed they want to be removed from the Venture Cafe Phoenix Mentorship Network board.\n\nPlease deactivate their profile.`,
    });
  } catch {
    // Notification failed but token is already cleared — log and continue
  }

  return <Result success={true} message="Done — your listing has been flagged for removal. We'll take care of the rest." />;
}

function Result({ success, message }: { success: boolean; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#242424] p-8 text-center">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl ${success ? "bg-[#60b09c]/20 text-[#60b09c]" : "bg-red-500/20 text-red-400"}`}>
          {success ? "✓" : "✕"}
        </div>
        <p className="text-lg font-semibold text-white">{success ? "Request confirmed" : "Something went wrong"}</p>
        <p className="mt-2 text-sm text-white/60">{message}</p>
        <Link href="/" className="mt-6 inline-block text-sm text-[#60b09c] hover:underline">
          Back to the board
        </Link>
      </div>
    </div>
  );
}
