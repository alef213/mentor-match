import { confirmEmail } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token)
    return Response.redirect(`${origin}/confirmed?status=invalid`);

  const result = await confirmEmail(token);
  return Response.redirect(`${origin}/confirmed?status=${result ? "ok" : "invalid"}`);
}
