import { Suspense } from "react";
import { approveSessionSignup } from "@/lib/airtable";
import { resend } from "@/lib/resend";
import { SESSION_TIME } from "@/lib/sessions";
import Link from "next/link";

export default function SessionApprovePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; action?: string }>;
}) {
  return (
    <Suspense fallback={<Shell />}>
      <SessionApproveContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SessionApproveContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; action?: string }>;
}) {
  const { token, action } = await searchParams;

  if (!token || (action !== "approve" && action !== "decline")) {
    return <Result ok={false} title="Invalid link" message="This link is missing required parameters." />;
  }

  const result = await approveSessionSignup(token, action);

  if (!result) {
    return <Result ok={false} title="Link expired" message="This link has already been used or is invalid." />;
  }

  const dateFormatted = new Date(result.sessionId + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  if (action === "approve") {
    try {
      await resend.emails.send({
        from: "RRG Phoenix Mentorship Network <noreply@globalmentorshipprogram.com>",
        to: result.email,
        subject: `You're confirmed for the ${dateFormatted} session`,
        text: `Hi ${result.name},\n\nGreat news - you're confirmed for the mentorship session on ${dateFormatted} at ${SESSION_TIME}.\n\nWe look forward to seeing you there!\n\nThe RRG Mentorship Team`,
      });
    } catch {
      // don't fail the page if email fails
    }

    return (
      <Result
        ok={true}
        title="Approved!"
        message={`${result.name} has been approved and notified by email.`}
      />
    );
  }

  try {
    await resend.emails.send({
      from: "RRG Phoenix Mentorship Network <noreply@globalmentorshipprogram.com>",
      to: result.email,
      subject: `Update on your session signup for ${dateFormatted}`,
      text: `Hi ${result.name},\n\nUnfortunately, the slot you requested for ${dateFormatted} at ${SESSION_TIME} is no longer available.\n\nPlease visit the sessions page to sign up for another upcoming date - we'd love to have you!\n\n${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/calendar\n\nThe RRG Mentorship Team`,
    });
  } catch {
    // don't fail the page if email fails
  }

  return (
    <Result
      ok={true}
      title="Declined"
      message={`${result.name}'s signup has been declined and they've been notified by email.`}
    />
  );
}

function Result({ ok, title, message }: { ok: boolean; title: string; message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#112148] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#fdfefe]/10 bg-[#0d1a38] p-8 text-center shadow-xl">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-xl ${ok ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
          {ok ? "✓" : "✕"}
        </div>
        <p className="text-lg font-semibold text-[#fdfefe]">{title}</p>
        <p className="mt-2 text-sm text-[#727272]">{message}</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-[#fdfefe] px-5 py-2 text-sm font-medium text-[#112148] hover:bg-[#e0e4f0]">
          Back to Board
        </Link>
      </div>
    </div>
  );
}

function Shell() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#112148] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#fdfefe]/10 bg-[#0d1a38] p-8 text-center shadow-xl">
        <p className="text-sm text-[#727272]">Processing…</p>
      </div>
    </div>
  );
}
