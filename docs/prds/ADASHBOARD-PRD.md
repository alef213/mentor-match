# ADashboard — Product Requirements Document

> Feature branch: `feature/adashboard`
> Feeds into: `docs/plans/adashboard.md` (implementation plan for Claude Code)

---

## 1. Summary

ADashboard is an internal, password-protected admin panel built directly into the Venture Cafe Phoenix Mentorship Network Next.js app. It replaces the current practice of managing profiles, match requests, and sessions by (a) opening Airtable directly and hand-editing records, and (b) clicking one-off secret links embedded in admin notification emails. Airtable remains the data store — ADashboard is a UI layer on top of the existing `lib/airtable.ts` functions, extended with the write operations that are currently missing.

---

## 2. Problem

The app already emails the admin (Ak) for two actions — approving a new profile and being told to deactivate a removed profile — but every other piece of "backend management" happens by hand in Airtable, and some actions the emails promise don't actually happen anywhere in code. Specifically, as of this repo today:

| Action | What actually happens today |
|---|---|
| New signup awaiting approval | Admin gets an email with a one-click `/api/approve?id=...&secret=...` link. Works, but it's a bare link with no context beyond the email body, no way to reject (only approve), and no record of who else is pending without checking Airtable. |
| Someone confirms they want to be removed | `app/remove/page.tsx` clears their removal token and emails the admin "Please deactivate their profile" — **it does not deactivate anything**. The admin has to open Airtable and flip `Active` to false by hand, every time. |
| Match request comes in | `createMatchRequest` writes `Status: "pending"` to Airtable. **No code path anywhere ever changes that status.** There is no approve/decline/complete action — the admin reads the notification email and does the intro over email, and the Airtable record just sits at "pending" forever, so Airtable can't even be trusted as a record of what's been handled. |
| Session signup approval | Has a real flow (`confirm` → `pending_approval` → `approve`/`decline` via token links) — this one actually works end-to-end already. |
| Reviewing bios/photos/LinkedIn before approving a profile | Admin must open Airtable to see the photo/bio, since the approval email is plain text and doesn't include a photo. |
| Any bulk view ("who's pending", "how many mentors vs mentees", "what requests are unresolved") | Airtable only. |

The core problem: Airtable is being used as a database, a worklist, and a UI simultaneously, and the "UI" part is bad — no filtering built for this workflow, no single view of what needs attention, and at least one action (deactivation) that the system claims to do but doesn't.

---

## 3. Goals

- Give the admin one screen to see everything needing action: pending profile approvals, unresolved match requests, and pending session signups.
- Make every action the current emails promise actually happen in one click from the dashboard (including the broken deactivation step).
- Give match requests a real status lifecycle (pending → approved → declined → completed) that's actually written back to Airtable, instead of a status field nothing updates.
- Let the admin edit and deactivate/reactivate any profile without opening Airtable.
- Keep Airtable as the system of record — no data migration, no new database.
- Gate all of this behind a real login instead of a bare secret-in-URL pattern.

## 4. Non-goals (out of scope for v1)

- Migrating off Airtable to Supabase or any other database.
- Multi-admin roles/permissions (assume single admin user for v1; design shouldn't preclude adding more later).
- Creating/editing Sessions (dates/capacity) from the dashboard — v1 covers reviewing/approving signups to *existing* sessions, not session creation. (Call out as a fast-follow if Ak wants it.)
- Rebuilding the public-facing board, signup form, or request modal — those are unchanged.
- Replacing Resend — transactional emails (confirmations, notifications to end users) stay as-is. ADashboard reduces reliance on emailed *admin* action links, not user-facing email.
- Analytics/reporting beyond basic counts.

---

## 5. Users

Single user: Ak, acting as the sole admin of the Venture Cafe Phoenix Mentorship Network program. Design should not assume multi-user auth complexity, but shouldn't hard-code a single username either (e.g. a password + role check is fine; don't hardcode "Ak" as a magic string).

---

## 6. Proposed solution

### 6.1 Architecture

- New route group `app/admin/*` inside the existing Next.js app (same repo, same deploy — no separate service).
- All admin pages and API routes protected by middleware that checks for a valid session cookie.
- Data access continues through `lib/airtable.ts`, extended with new functions (see §8). No new database.
- Deployed the same way as today: push to `master` → Vercel auto-deploys. Dashboard is just more routes in the same app, gated by auth.

### 6.2 Authentication

Recommendation: **simple session-based password login**, not the current bare-secret-in-URL pattern, and not full multi-user auth (Supabase Auth, Clerk, etc.) — that's more infrastructure than a single-admin tool needs.

- `/admin/login` page: password field, checked server-side against an `ADMIN_DASHBOARD_PASSWORD` env var (bcrypt-hashed comparison, not plaintext-in-env if avoidable).
- On success, set an HTTP-only, `Secure`, `SameSite=Strict` session cookie (signed, e.g. with `jose`/JWT or a simple signed token) with a reasonable expiry (e.g. 7 days).
- Middleware on `/admin/*` (except `/admin/login`) redirects to login if the cookie is missing/invalid.
- No password reset flow needed for v1 (single admin, change the env var and redeploy if needed) — but note this as a known limitation.
- This retires `ADMIN_SECRET`-in-URL entirely once the dashboard replaces the approve-link emails (see §9.1) — it's a strictly better security posture (no permanent secret sitting in email inboxes/logs).

---

## 7. Information architecture

```
/admin/login                     — password gate
/admin                           — overview: counts + "needs attention" feed
/admin/profiles                  — all profiles, filter by type/status/industry
/admin/profiles/[id]             — profile detail: approve/reject, edit, deactivate/reactivate
/admin/matches                   — match requests, filter by status
/admin/matches/[id]              — match detail: mark approved/declined/completed, view both parties
/admin/sessions                  — upcoming sessions, signup counts
/admin/sessions/[id]             — signups for a session: approve/decline
```

---

## 8. Features (v1 — "full replacement" scope)

### 8.1 Overview page (`/admin`)
Counts of: profiles awaiting approval, unresolved match requests (pending), pending session signups, pending removal confirmations. Each count links to the filtered list. This is the "what needs my attention today" screen — the thing Airtable can't give without manually building a view.

### 8.2 Profile management (`/admin/profiles`)
- List/filter by type (mentor/mentee), status (pending approval / active / inactive), industry.
- Approve or reject a pending signup directly (currently: approve-only, via email link).
- Edit any profile field (name, bio, industry, role, LinkedIn, photo).
- **Deactivate/reactivate a profile** — this is the fix for the broken removal flow in §2. When a removal is confirmed, it should show up here as "pending deactivation" and deactivating it should be one click, actually flipping `Active` to false in Airtable (today, nothing does this).
- New Airtable field needed: something to distinguish "removal confirmed, awaiting admin action" from a normal active/inactive profile (e.g. reuse a cleared `Remove Token` + `Active=true` as the signal, or add an explicit `Pending Removal` checkbox field for clarity).

### 8.3 Match request management (`/admin/matches`)
- List all match requests with requester + target info, filterable by status.
- **Real status transitions**: pending → approved → completed, or pending → declined, all writable from the dashboard. This requires a new `updateMatchRequestStatus()` function in `lib/airtable.ts` (does not exist today — status is currently write-once).
- Optional: a text field for admin notes on a match (e.g. "introduced via email 7/20").

### 8.4 Session & signup management (`/admin/sessions`)
- View upcoming sessions with capacity and current signup count (data already available via `getSessions`/`getSignupCountsForSessions`).
- View and approve/decline pending signups per session — same underlying action as the existing `/api/approve` (session) token flow, just exposed as a button instead of requiring an emailed link click.
- Session creation/editing is out of scope for v1 (see §4).

### 8.5 Removal requests
Surfaced inside Profile management (§8.2) rather than as a separate section, since a removal request *is* a profile action. The dashboard should make "confirmed removal, not yet deactivated" a visible, actionable state — closing the current gap where this silently does nothing.

---

## 9. Migration notes / things this replaces

### 9.1 Replaces
- `/api/approve` and `/api/admin-approve` (identical routes today — worth deduplicating regardless) — profile approval moves into `/admin/profiles/[id]`.
- The "please deactivate their profile" email in `app/remove/page.tsx` — replaced by a visible pending-deactivation item in the dashboard. (Can keep the email as a notification *that* something needs attention, but the action itself happens in ADashboard, not Airtable.)
- Manually opening airtable.com to check on match request status or profile counts.

### 9.2 Keeps unchanged
- Public board (`/`), signup form (`/signup`), request modal, session signup flow's user-facing emails (confirmation emails via Resend stay).
- Airtable as the data store.
- `ADMIN_EMAIL` notifications for new signups/match requests/removal requests — these still tell the admin *something happened*; ADashboard is where they now go to *act* on it, rather than clicking a bare link or opening Airtable.

---

## 10. Non-functional requirements

- All new Airtable write functions should follow the existing pattern in `lib/airtable.ts` (fetch + throw on non-OK response).
- Rate limits: Airtable's API has request-per-second limits; the overview page pulls from four tables, so verify it stays comfortably under Airtable's rate limit (5 req/s per base) — batch or cache if needed.
- No secrets in the client bundle — password check and session validation happen server-side only (route handlers / middleware).
- Session cookie must be `HttpOnly` + `Secure` in production.

---

## 11. Success criteria

- Ak can approve/reject a new signup, resolve a match request, approve a session signup, and deactivate a removed profile — all without opening airtable.com.
- Zero "phantom" states left in Airtable (e.g. match requests stuck at "pending" forever, removal-confirmed profiles that are still `Active: true`).
- `ADMIN_SECRET`-in-URL pattern retired from all new admin actions.

## 12. Open questions for Ak (resolve before/while writing Plan.md)

1. Password-reset story: acceptable to just rotate the env var manually if the password is ever compromised, or do you want a reset mechanism now?
2. For match requests: is "approved / declined / completed" the right set of states, or do you want something closer to a pipeline (e.g. "intro sent", "waiting on reply", "scheduled")?
3. Should the dashboard show *inactive/rejected* profiles too (full history), or only things currently needing attention?
4. Any preference on session library for the login (roll a minimal JWT cookie by hand vs. pulling in `iron-session` or similar)? Given single-admin scope, a small dependency (`iron-session`) is probably less code than hand-rolling — flagging for the Plan.md decision.

---

## 13. Out of scope, revisit later

- Migrating Airtable → Supabase (schema already sketched in `supabase/schema.sql`, currently unused).
- Multi-admin accounts/roles.
- Session creation/editing UI.
- Analytics/reporting dashboards beyond basic counts.
