import { requestRemoval } from "@/lib/airtable";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  const { name, email } = await request.json();

  if (!name || !email)
    return Response.json({ error: "Name and email are required." }, { status: 400 });

  try {
    const token = crypto.randomUUID();
    const profile = await requestRemoval(email, token);

    if (profile) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
      const removeLink = `${siteUrl}/remove?token=${token}`;

      await resend.emails.send({
        from: "RRG Phoenix Mentorship Network <noreply@globalmentorshipprogram.com>",
        to: email,
        subject: "Confirm your removal from RRG Phoenix Mentorship Network",
        text: `Hi ${profile.name},\n\nWe received a request to remove your listing from the RRG Phoenix Mentorship Network board.\n\nIf this was you, click the link below to confirm:\n\n${removeLink}\n\nIf you didn't request this, you can ignore this email â€” nothing will change.`,
      });
    }

    // Always return success to avoid email enumeration
    return Response.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
