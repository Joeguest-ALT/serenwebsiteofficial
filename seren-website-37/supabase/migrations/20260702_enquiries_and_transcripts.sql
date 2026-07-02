-- ─────────────────────────────────────────────────────────────
-- Enquiries + chatbot transcript tables for send-enquiry-email
-- Idempotent — safe to run against an existing project.
-- ─────────────────────────────────────────────────────────────

-- Contact form submissions
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  phone       text,
  reason      text,
  message     text not null
);

-- Ensure the columns are present even if the table was created earlier
-- during the May 2026 mid-setup with a lighter schema.
alter table public.enquiries add column if not exists reason text;
alter table public.enquiries add column if not exists phone  text;

-- Chatbot conversation transcripts
create table if not exists public.chatbot_transcripts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text,
  email       text not null,
  phone       text,
  page        text,
  transcript  jsonb not null
);

-- Row-level security: block ALL anon/public access.
-- The Edge Function uses the service_role key which bypasses RLS,
-- so writes still work from the function. This prevents anyone with
-- the public anon key from reading or writing directly.
alter table public.enquiries          enable row level security;
alter table public.chatbot_transcripts enable row level security;

drop policy if exists "block_anon"       on public.enquiries;
drop policy if exists "block_anon_trans" on public.chatbot_transcripts;

create policy "block_anon" on public.enquiries
  for all to anon
  using (false) with check (false);

create policy "block_anon_trans" on public.chatbot_transcripts
  for all to anon
  using (false) with check (false);

-- Indexes for admin viewing (newest first)
create index if not exists enquiries_created_at_idx
  on public.enquiries (created_at desc);
create index if not exists chatbot_transcripts_created_at_idx
  on public.chatbot_transcripts (created_at desc);
