import { approveProfile } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const id = searchParams.get("id");
  const secret = searchParams.get("secret");

  if (!id || secret !== process.env.ADMIN_SECRET)
    return Response.redirect(`${origin}/approved?status=invalid`);

  const ok = await approveProfile(id);
  return Response.redirect(`${origin}/approved?status=${ok ? "ok" : "error"}`);
}
