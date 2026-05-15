import { NextRequest, NextResponse } from "next/server";
import { confirmEmail } from "@/lib/airtable";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const base = process.env.NEXT_PUBLIC_SITE_URL!;

  try {
    if (!token)
      return NextResponse.redirect(`${base}/confirmed?status=invalid`);

    const result = await confirmEmail(token);
    return NextResponse.redirect(`${base}/confirmed?status=${result ? "ok" : "invalid"}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
