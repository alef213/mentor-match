# MentorMatch — PLAN.md

> Feed this file to Claude Code in VS Code.
> Suggested first prompt: "Read PLAN.md and build this app top to bottom, starting with project setup and Supabase schema."

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14 (App Router) + React + Tailwind CSS |
| Database | Supabase (Postgres) |
| Email | Resend |
| Hosting | Vercel (connected to GitHub) |
| Version control | GitHub |

---

## Project structure

```
mentor-match/
├── app/
│   ├── page.tsx                  # Public board (default route)
│   ├── signup/page.tsx           # Signup page (mentor + mentee tabs)
│   ├── api/
│   │   ├── signup/route.ts       # POST: save signup + email admin
│   │   └── request/route.ts      # POST: save match request + email admin
├── components/
│   ├── Board.tsx                 # Grid of mentor/mentee cards with filters
│   ├── Card.tsx                  # Individual person card
│   ├── SignupForm.tsx            # Tabbed signup form (mentor / mentee)
│   ├── RequestModal.tsx          # Match request modal
│   └── Filters.tsx               # Industry + type filter bar
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── resend.ts                 # Resend client
├── .env.local                    # Secrets (never commit this)
└── PLAN.md                       # This file
```

---

## Database schema (Supabase)

### Table: `profiles`

```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  type text not null check (type in ('mentor', 'mentee')),
  name text not null,
  email text not null,
  industry text not null,
  role text not null,
  bio text,
  is_active boolean default true
);
```

### Table: `match_requests`

```sql
create table match_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  target_id uuid references profiles(id),
  requester_name text not null,
  requester_email text not null,
  message text,
  status text default 'pending' check (status in ('pending', 'approved', 'declined'))
);
```

### Row-level security (RLS)

Enable RLS on both tables. Rules:
- `profiles`: public SELECT on `is_active = true`. INSERT via service role only (API route).
- `match_requests`: INSERT via service role only. No public SELECT.

---

## Environment variables

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=you@yourdomain.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## API routes

### POST /api/signup

**Request body:**
```json
{
  "type": "mentor" | "mentee",
  "name": "string",
  "email": "string",
  "industry": "string",
  "role": "string",
  "bio": "string",
  "consent": true,
  "honeypot": ""
}
```

**Actions:**
1. Validate all required fields
2. Check `honeypot === ""` — if it has a value, silently return `{ success: true }` (bot, do nothing)
3. Check `consent === true` — reject if missing
4. Insert into `profiles` using service role key
3. Send email to `ADMIN_EMAIL` via Resend:
   - Subject: `New [mentor/mentee] signup: [name]`
   - Body: all fields, plus link to Supabase dashboard

**Response:** `{ success: true, id: uuid }` or `{ error: string }`

---

### POST /api/request

**Request body:**
```json
{
  "target_id": "uuid",
  "requester_name": "string",
  "requester_email": "string",
  "message": "string (optional)",
  "consent": true,
  "honeypot": ""
}
```

**Actions:**
1. Validate required fields
2. Check `honeypot === ""` — if populated, silently return `{ success: true }`
3. Check `consent === true` — reject if missing
4. Fetch target profile from Supabase (to include in email)
3. Insert into `match_requests`
4. Send email to `ADMIN_EMAIL`:
   - Subject: `Match request: [requester] → [target name]`
   - Body: requester info, target info, message, action needed

**Response:** `{ success: true }` or `{ error: string }`

---

## Pages

### `/` — Public board

- Fetch all `profiles` where `is_active = true` (server component, no auth needed)
- Render `<Filters>` + `<Board>`
- Filters: industry (dropdown), type (mentor / mentee / both)
- Each card shows: avatar initials, name, role, industry tag, type badge, bio preview
- "Request match" button opens `<RequestModal>`

### `/signup` — Signup page

- Two tabs: "I want a mentor" / "I am a mentor"
- Form fields: name, email, industry, role, bio
- On submit: POST to `/api/signup`
- On success: show confirmation message, clear form

---

## Components

### `Board.tsx`
- Props: `profiles: Profile[]`
- Client component (handles filter state)
- Filters profiles in-memory (no re-fetch on filter change)

### `Card.tsx`
- Props: `profile: Profile`, `onRequestMatch: (id: string) => void`
- Shows initials avatar, name, role, industry, type badge, bio (truncated to 100 chars)
- "Request match →" button

### `SignupForm.tsx`
- Client component
- Tabbed: mentor / mentee
- Fields include a hidden honeypot input (`name="website"`, hidden via CSS not `display:none`) and a visible consent checkbox: "I agree to be contacted for mentorship purposes"
- Calls `/api/signup` on submit
- Shows success/error toast

### `RequestModal.tsx`
- Props: `target: Profile | null`, `onClose: () => void`
- Fields: requester name, email, message (optional)
- Includes hidden honeypot input (`name="website"`, hidden via CSS) and consent checkbox: "I agree to be contacted for mentorship purposes"
- Calls `/api/request` on submit
- Close on backdrop click or cancel

### `Filters.tsx`
- Props: `onChange: (filters) => void`
- Industry select + type select
- Controlled — parent owns filter state

---

## Email templates (Resend)

Keep these as plain text for v1. No HTML templates needed yet.

### Signup notification
```
Subject: New [mentor/mentee] signup: [name]

Name: [name]
Email: [email]
Type: [mentor/mentee]
Industry: [industry]
Role: [role]
Bio: [bio]

Review in Supabase: [link]
```

### Match request notification
```
Subject: Match request: [requester_name] → [target_name]

Requester: [requester_name] ([requester_email])
Target: [target_name] ([target_email]) — [target_type], [target_industry]
Message: [message or "none"]

Action: Reply to both parties to make the intro.
```

---

## GitHub + Vercel setup

1. `git init && git add . && git commit -m "init"`
2. Create repo at github.com/new (private is fine)
3. `git remote add origin [your repo url]`
4. `git push -u origin main`
5. Go to vercel.com → Import GitHub repo
6. Add all `.env.local` variables in Vercel's Environment Variables settings
7. Every `git push` to `main` auto-deploys

---

## Build order for Claude Code

Tell Claude Code to build in this sequence to avoid dependency issues:

1. Project init (`create-next-app`, install `@supabase/supabase-js`, `resend`, `tailwindcss`)
2. `.env.local` template + `lib/supabase.ts` + `lib/resend.ts`
3. Supabase schema (output as `supabase/schema.sql` to run manually)
4. `/api/signup/route.ts`
5. `/api/request/route.ts`
6. `components/Card.tsx` + `components/Filters.tsx`
7. `components/Board.tsx`
8. `components/RequestModal.tsx`
9. `components/SignupForm.tsx`
10. `app/page.tsx` (board)
11. `app/signup/page.tsx`
12. End-to-end test: signup → check Supabase → check email

---

## MVP scope (do not gold-plate)

In scope:
- Public board, signup forms, match request, admin email notifications

Out of scope for v1:
- User login / auth
- Admin dashboard UI
- Mentor approving/declining requests themselves
- Profile editing
- Pagination (board will be small at launch)
