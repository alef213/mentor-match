import { Suspense } from "react";
import { processRemoval } from "@/lib/airtable";
import { resend } from "@/lib/resend";
import Link from "next/link";

export default function RemovePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense fallback={<Shell />}>
      <RemoveContent searchParams={searchParams} />
    </Suspense>
  );
}

async function RemoveContent({
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
      from: "RRG Phoenix Mentorship Network <noreply@globalmentorshipprogram.com>",
      to: "resolutionresourcegroupllc@gmail.com",
      subject: `Removal request: ${profile.name}`,
      text: `${profile.name} (${profile.email}) has confirmed they want to be removed from the RRG Phoenix Mentorship Network board.\n\nPlease deactivate their profile.`,
    });
  } catch {
    // Notification failed but token is already cleared — log and continue
  }

  return <Result success={true} message="Done — your listing has been flagged for removal. We'll take care of the rest." />;
}

function Result({ success, message }: { success: boolean; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#112148] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#fdfefe]/10 bg-[#0d1a38] p-8 text-center">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl ${success ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
          {success ? "✓" : "✕"}
        </div>
        <p className="text-lg font-semibold text-[#fdfefe]">{success ? "Request confirmed" : "Something went wrong"}</p>
        <p className="mt-2 text-sm text-[#727272]">{message}</p>
        <Link href="/" className="mt-6 inline-block text-sm text-[#fdfefe] hover:underline">
          Back to the board
        </Link>
      </div>
    </div>
  );
}

function Shell() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#112148] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#fdfefe]/10 bg-[#0d1a38] p-8 text-center">
        <p className="text-sm text-[#727272]">Processing…</p>
      </div>
    </div>
  );
}
