import { getSignupCountForDate, createSessionSignup } from "@/lib/airtable";
import { getUpcomingThursdays, SESSION_CAPACITY, SESSION_TIME } from "@/lib/sessions";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  const { session_id, name, email } = await request.json();

  if (!session_id || !name || !email)
    return Response.json({ error: "Missing required fields." }, { status: 400 });

  const validDates = getUpcomingThursdays(6);
  if (!validDates.includes(session_id))
    return Response.json({ error: "Invalid session." }, { status: 400 });

  try {
    const count = await getSignupCountForDate(session_id);
    if (count >= SESSION_CAPACITY)
      return Response.json({ error: "This session is full." }, { status: 409 });

    const confirmToken = crypto.randomUUID();
    await createSessionSignup({ sessionId: session_id, name, email, confirmToken });

    const dateFormatted = new Date(session_id + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const confirmUrl = `${siteUrl}/session-confirm?token=${confirmToken}`;

    await resend.emails.send({
      from: "Venture Cafe Phoenix Mentorship Network <noreply@globalmentorshipprogram.com>",
      to: email,
      subject: `Confirm your sign-up for the ${dateFormatted} session`,
      text: `Hi ${name},\n\nThanks for signing up for the mentorship session on ${dateFormatted} at ${SESSION_TIME}.\n\nPlease confirm your email by clicking the link below:\n\n${confirmUrl}\n\nIf you didn't sign up for this, you can ignore this email.\n\nThe VCP Mentorship Team`,
    });

    return Response.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
