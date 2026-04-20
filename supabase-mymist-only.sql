-- MyMIST Integration Center setup
-- Run this when you want to stage MyMIST exports inside the portal.

create table if not exists public.mymist_import_batches (
  id text primary key,
  source_name text not null,
  import_type text not null default 'participants',
  row_count integer not null default 0,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.mymist_import_batches enable row level security;

drop policy if exists "admins can manage mymist import batches" on public.mymist_import_batches;
create policy "admins can manage mymist import batches"
on public.mymist_import_batches
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

create table if not exists public.mymist_participants (
  id uuid primary key default gen_random_uuid(),
  import_batch_id text references public.mymist_import_batches(id) on delete set null,
  external_participant_id text unique,
  full_name text not null,
  email text,
  school text,
  grade_level text,
  gender_label text,
  competitions text[] not null default '{}'::text[],
  badge_code text unique,
  nfc_uid text unique,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists mymist_participants_school_idx
on public.mymist_participants (school);

create index if not exists mymist_participants_nfc_idx
on public.mymist_participants (nfc_uid);

create index if not exists mymist_participants_badge_idx
on public.mymist_participants (badge_code);

alter table public.mymist_participants enable row level security;

drop policy if exists "admins can manage mymist participants" on public.mymist_participants;
create policy "admins can manage mymist participants"
on public.mymist_participants
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

create table if not exists public.mymist_schools (
  id uuid primary key default gen_random_uuid(),
  school_name text not null unique,
  city text,
  state text,
  primary_contact text,
  contact_email text,
  participant_count integer not null default 0,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.mymist_schools enable row level security;

drop policy if exists "admins can manage mymist schools" on public.mymist_schools;
create policy "admins can manage mymist schools"
on public.mymist_schools
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

create table if not exists public.mymist_judges (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  competition_areas text[] not null default '{}'::text[],
  availability text,
  status text not null default 'prospect' check (status in ('prospect', 'confirmed', 'trained', 'cancelled')),
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists mymist_judges_email_idx
on public.mymist_judges (email);

alter table public.mymist_judges enable row level security;

drop policy if exists "admins can manage mymist judges" on public.mymist_judges;
create policy "admins can manage mymist judges"
on public.mymist_judges
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);
