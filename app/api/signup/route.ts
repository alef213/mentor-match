import { createProfile } from "@/lib/airtable";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const { type, name, email, industry, role, bio, consent, honeypot } = body;

  if (honeypot !== "") return Response.json({ success: true });

  if (!consent)
    return Response.json({ error: "Consent is required." }, { status: 400 });

  if (!type || !name || !email || !industry || !role)
    return Response.json({ error: "Missing required fields." }, { status: 400 });

  try {
    const { id } = await createProfile({ type, name, email, industry, role, bio });

    const airtableLink = `https://airtable.com/${process.env.AIRTABLE_BASE_ID}`;

    await resend.emails.send({
      from: "MentorMatch <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL!,
      subject: `New ${type} signup: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nType: ${type}\nIndustry: ${industry}\nRole: ${role}\nBio: ${bio || "—"}\n\nReview in Airtable: ${airtableLink}`,
    });

    return Response.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
