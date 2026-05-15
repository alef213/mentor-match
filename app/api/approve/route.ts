import { approveProfile } from "@/lib/airtable";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const secret = searchParams.get("secret");

  if (!id || secret !== process.env.ADMIN_SECRET)
    redirect("/approved?status=invalid");

  const ok = await approveProfile(id);
  redirect(ok ? "/approved?status=ok" : "/approved?status=error");
}
