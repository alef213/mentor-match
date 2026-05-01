import { supabaseAdmin } from "@/lib/supabase";
import { resend } from "@/lib/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const { type, name, email, industry, role, bio, consent, honeypot } = body;

  if (honeypot !== "") {
    return Response.json({ success: true });
  }

  if (!consent) {
    return Response.json({ error: "Consent is required." }, { status: 400 });
  }

  if (!type || !name || !email || !industry || !role) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .insert({ type, name, email, industry, role, bio })
    .select("id")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  const dashboardLink = `https://supabase.com/dashboard/project/${projectRef}/editor`;

  await resend.emails.send({
    from: "MentorMatch <onboarding@resend.dev>",
    to: process.env.ADMIN_EMAIL!,
    subject: `New ${type} signup: ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nType: ${type}\nIndustry: ${industry}\nRole: ${role}\nBio: ${bio || "—"}\n\nReview in Supabase: ${dashboardLink}`,
  });

  return Response.json({ success: true, id: data.id });
}
