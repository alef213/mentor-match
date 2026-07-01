import { getProfileById, createMatchRequest } from "@/lib/airtable";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const { target_id, requester_name, requester_email, requester_industry, requester_role, requester_bio, requester_photo, consent, honeypot } = body;

  if (honeypot !== "") return Response.json({ success: true });

  if (!consent)
    return Response.json({ error: "Consent is required." }, { status: 400 });

  if (!target_id || !requester_name || !requester_email || !requester_industry || !requester_role)
    return Response.json({ error: "Missing required fields." }, { status: 400 });

  try {
    const target = await getProfileById(target_id);
    if (!target)
      return Response.json({ error: "Target profile not found." }, { status: 404 });

    await createMatchRequest({ target_id, requester_name, requester_email, requester_industry, requester_role, requester_bio, requester_photo });

    await resend.emails.send({
      from: "Venture Cafe Phoenix Mentorship Network <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL!,
      subject: `Match request: ${requester_name} → ${target.name}`,
      text: `Requester: ${requester_name} (${requester_email})\nIndustry: ${requester_industry}\nRole: ${requester_role}\nAbout: ${requester_bio || "—"}\nPhoto: ${requester_photo || "none"}\n\nTarget: ${target.name} (${target.email}) — ${target.type}, ${target.industry}\n\nAction: Reply to both parties to make the intro.`,
    });

    return Response.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
