import { NextRequest, NextResponse } from "next/server";
import { approveProfile } from "@/lib/airtable";


export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const secret = request.nextUrl.searchParams.get("secret");
  const base = process.env.NEXT_PUBLIC_SITE_URL!;

  try {
    if (!id || secret !== process.env.ADMIN_SECRET)
      return NextResponse.redirect(`${base}/approved?status=invalid`);

    const ok = await approveProfile(id);
    return NextResponse.redirect(`${base}/approved?status=${ok ? "ok" : "error"}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
