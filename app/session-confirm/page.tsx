import { confirmSessionEmail } from "@/lib/airtable";
import { resend } from "@/lib/resend";
import { SESSION_TIME } from "@/lib/sessions";
import Link from "next/link";

export default async function SessionConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <Result ok={false} message="Invalid confirmation link." />;
  }

  const result = await confirmSessionEmail(token);

  if (!result) {
    return <Result ok={false} message="This link is expired or has already been used." />;
  }

  const dateFormatted = new Date(result.sessionId + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const approveUrl = `${siteUrl}/session-approve?token=${result.approveToken}&action=approve`;
  const declineUrl = `${siteUrl}/session-approve?token=${result.approveToken}&action=decline`;

  try {
    await resend.emails.send({
      from: "Venture Cafe Phoenix Mentorship Network <noreply@globalmentorshipprogram.com>",
      to: process.env.ADMIN_EMAIL!,
      subject: `Session signup pending approval: ${result.name}`,
      text: `${result.name} (${result.email}) has confirmed their email and is requesting a spot for the session on ${dateFormatted} at ${SESSION_TIME}.\n\nApprove: ${approveUrl}\n\nDecline: ${declineUrl}`,
    });
  } catch {
    // don't fail the page if the email fails
  }

  return <Result ok={true} message="Your email is confirmed! We'll review your request and send you a confirmation shortly." />;
}

function Result({ ok, message }: { ok: boolean; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#242424] p-8 text-center shadow-xl">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl ${ok ? "bg-[#60b09c]/20 text-[#60b09c]" : "bg-red-500/20 text-red-400"}`}>
          {ok ? "âœ“" : "âœ•"}
        </div>
        <p className="text-lg font-semibold text-white">{ok ? "Email confirmed!" : "Something went wrong"}</p>
        <p className="mt-2 text-sm text-white/60">{message}</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-[#60b09c] px-5 py-2 text-sm font-medium text-white hover:bg-[#4d9b86]">
          Back to Board
        </Link>
      </div>
    </div>
  );
}
