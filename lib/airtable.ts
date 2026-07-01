import { Profile } from "@/components/Card";

const BASE = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}`;

function airtableHeaders() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

function toProfile(record: { id: string; createdTime: string; fields: Record<string, unknown> }): Profile {
  const f = record.fields;
  return {
    id: record.id,
    created_at: record.createdTime,
    type: f["Type"] as "mentor" | "mentee",
    name: f["Name"] as string,
    email: f["Email"] as string,
    industry: f["Industry"] as string,
    role: f["Role"] as string,
    bio: (f["Bio"] as string) ?? null,
    photo: (f["Photo"] as string) || null,
    is_active: (f["Active"] as boolean) ?? false,
  };
}

async function updateProfile(id: string, fields: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${BASE}/Profiles/${id}`, {
    method: "PATCH",
    headers: airtableHeaders(),
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function getActiveProfiles(): Promise<Profile[]> {
  const params = new URLSearchParams({
    filterByFormula: "{Active}=1",
  });
  const res = await fetch(`${BASE}/Profiles?${params}`, {
    headers: airtableHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return (data.records ?? []).map(toProfile);
}

export async function createProfile(fields: {
  type: "mentor" | "mentee";
  name: string;
  email: string;
  industry: string;
  role: string;
  bio?: string;
  linkedin?: string;
  photo?: string;
  confirmToken: string;
}): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/Profiles`, {
    method: "POST",
    headers: airtableHeaders(),
    body: JSON.stringify({
      fields: {
        Name: fields.name,
        Email: fields.email,
        Type: fields.type,
        Industry: fields.industry,
        Role: fields.role,
        Bio: fields.bio ?? "",
        LinkedIn: fields.linkedin ?? "",
        Photo: fields.photo ?? "",
        Active: false,
        "Email Confirmed": false,
        "Admin Approved": false,
        "Confirm Token": fields.confirmToken,
      },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const record = await res.json();
  return { id: record.id };
}

export async function confirmEmail(token: string): Promise<{ id: string } | null> {
  const params = new URLSearchParams({
    filterByFormula: `{Confirm Token}="${token}"`,
    maxRecords: "1",
  });
  const res = await fetch(`${BASE}/Profiles?${params}`, { headers: airtableHeaders() });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.records?.length) return null;

  const record = data.records[0];
  const adminApproved = (record.fields["Admin Approved"] as boolean) ?? false;

  await updateProfile(record.id, {
    "Email Confirmed": true,
    "Confirm Token": "",
    ...(adminApproved ? { Active: true } : {}),
  });

  return { id: record.id };
}

export async function approveProfile(id: string): Promise<boolean> {
  const res = await fetch(`${BASE}/Profiles/${id}`, { headers: airtableHeaders() });
  if (!res.ok) return false;
  const record = await res.json();
  const emailConfirmed = (record.fields["Email Confirmed"] as boolean) ?? false;

  await updateProfile(id, {
    "Admin Approved": true,
    ...(emailConfirmed ? { Active: true } : {}),
  });

  return true;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const res = await fetch(`${BASE}/Profiles/${id}`, {
    headers: airtableHeaders(),
  });
  if (!res.ok) return null;
  const record = await res.json();
  return toProfile(record);
}

export async function requestRemoval(email: string, token: string): Promise<{ name: string } | null> {
  const params = new URLSearchParams({
    filterByFormula: `{Email}="${email}"`,
    maxRecords: "1",
  });
  const res = await fetch(`${BASE}/Profiles?${params}`, { headers: airtableHeaders() });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.records?.length) return null;

  const record = data.records[0];
  await updateProfile(record.id, { "Remove Token": token });
  return { name: record.fields["Name"] as string };
}

export async function processRemoval(token: string): Promise<{ name: string; email: string } | null> {
  const params = new URLSearchParams({
    filterByFormula: `{Remove Token}="${token}"`,
    maxRecords: "1",
  });
  const res = await fetch(`${BASE}/Profiles?${params}`, { headers: airtableHeaders() });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.records?.length) return null;

  const record = data.records[0];
  await updateProfile(record.id, { "Remove Token": "" });
  return {
    name: record.fields["Name"] as string,
    email: record.fields["Email"] as string,
  };
}

export async function createMatchRequest(fields: {
  target_id: string;
  requester_name: string;
  requester_email: string;
  requester_industry: string;
  requester_role: string;
  requester_bio?: string;
  requester_photo?: string;
}): Promise<void> {
  const res = await fetch(`${BASE}/${encodeURIComponent("Match Requests")}`, {
    method: "POST",
    headers: airtableHeaders(),
    body: JSON.stringify({
      fields: {
        "Target ID": fields.target_id,
        "Requester Name": fields.requester_name,
        "Requester Email": fields.requester_email,
        "Requester Industry": fields.requester_industry,
        "Requester Role": fields.requester_role,
        "Requester Bio": fields.requester_bio ?? "",
        "Requester Photo": fields.requester_photo ?? "",
        Status: "pending",
      },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}
