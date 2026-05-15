import { confirmEmail } from "@/lib/airtable";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) redirect("/confirmed?status=invalid");

  const result = await confirmEmail(token);
  redirect(result ? "/confirmed?status=ok" : "/confirmed?status=invalid");
}
