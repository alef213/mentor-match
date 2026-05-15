import { createProfile } from "@/lib/airtable";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const { type, name, email, industry, role, bio, photo, consent, honeypot } = body;

  if (honeypot !== "") return Response.json({ success: true });

  if (!consent)
    return Response.json({ error: "Consent is required." }, { status: 400 });

  if (!type || !name || !email || !industry || !role)
    return Response.json({ error: "Missing required fields." }, { status: 400 });

  try {
    const confirmToken = crypto.randomUUID();
    const { id } = await createProfile({ type, name, email, industry, role, bio, photo, confirmToken });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const confirmLink = `${siteUrl}/api/confirm?token=${confirmToken}`;
    const approveLink = `${siteUrl}/api/approve?id=${id}&secret=${process.env.ADMIN_SECRET}`;

    await resend.emails.send({
      from: "MentorMatch <onboarding@resend.dev>",
      to: email,
      subject: "Confirm your MentorMatch profile",
      text: `Hi ${name},\n\nThanks for signing up! Please confirm your email address to complete your profile:\n\n${confirmLink}\n\nThis link can only be used once.`,
    });

    await resend.emails.send({
      from: "MentorMatch <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL!,
      subject: `New ${type} awaiting approval: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nType: ${type}\nIndustry: ${industry}\nRole: ${role}\nBio: ${bio || "—"}\n\nApprove this profile:\n${approveLink}`,
    });

    return Response.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
