-- MentorMatch schema
-- Run this in the Supabase SQL editor

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

create table match_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  target_id uuid references profiles(id),
  requester_name text not null,
  requester_email text not null,
  message text,
  status text default 'pending' check (status in ('pending', 'approved', 'declined'))
);

-- Enable RLS
alter table profiles enable row level security;
alter table match_requests enable row level security;

-- profiles: public SELECT on active rows
create policy "Public read active profiles"
  on profiles for select
  using (is_active = true);

-- profiles: service role INSERT (handled by API routes via supabaseAdmin)
-- match_requests: service role INSERT only, no public SELECT
-- (service role bypasses RLS by default — no additional policies needed)
