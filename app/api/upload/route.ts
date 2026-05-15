import { put } from "@vercel/blob";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as File;

  if (!file || !file.size)
    return Response.json({ error: "No file provided." }, { status: 400 });

  if (!file.type.startsWith("image/"))
    return Response.json({ error: "File must be an image." }, { status: 400 });

  if (file.size > 5 * 1024 * 1024)
    return Response.json({ error: "File must be under 5MB." }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const blob = await put(`profiles/${Date.now()}.${ext}`, file, {
    access: "public",
  });

  return Response.json({ url: blob.url });
}
