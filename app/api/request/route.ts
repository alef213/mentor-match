import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const { target_id, requester_name, requester_email, message, consent, honeypot } = body;

  if (honeypot !== "") {
    return Response.json({ success: true });
  }

  if (!consent) {
    return Response.json({ error: "Consent is required." }, { status: 400 });
  }

  if (!target_id || !requester_name || !requester_email) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { data: target, error: targetError } = await supabaseAdmin
    .from("profiles")
    .select("name, email, type, industry")
    .eq("id", target_id)
    .single();

  if (targetError || !target) {
    return Response.json({ error: "Target profile not found." }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("match_requests")
    .insert({ target_id, requester_name, requester_email, message });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  await resend.emails.send({
    from: "MentorMatch <onboarding@resend.dev>",
    to: process.env.ADMIN_EMAIL!,
    subject: `Match request: ${requester_name} → ${target.name}`,
    text: `Requester: ${requester_name} (${requester_email})\nTarget: ${target.name} (${target.email}) — ${target.type}, ${target.industry}\nMessage: ${message || "none"}\n\nAction: Reply to both parties to make the intro.`,
  });

  return Response.json({ success: true });
}
