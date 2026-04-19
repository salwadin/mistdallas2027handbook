create table if not exists public.role_applications (
  id uuid primary key default gen_random_uuid(),
  role_id text not null,
  full_name text not null,
  email text not null,
  phone text,
  experience text not null default '',
  availability text not null default '',
  selected_roles text[] not null default '{}'::text[],
  responses jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  review_notes text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.role_applications add column if not exists selected_roles text[] not null default '{}'::text[];
alter table public.role_applications add column if not exists responses jsonb not null default '{}'::jsonb;

alter table public.role_applications enable row level security;

drop policy if exists "anyone can submit role applications" on public.role_applications;
create policy "anyone can submit role applications"
on public.role_applications
for insert
to anon, authenticated
with check (true);

drop policy if exists "admins can view role applications" on public.role_applications;
create policy "admins can view role applications"
on public.role_applications
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

drop policy if exists "admins can update role applications" on public.role_applications;
create policy "admins can update role applications"
on public.role_applications
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

drop policy if exists "admins can delete role applications" on public.role_applications;
create policy "admins can delete role applications"
on public.role_applications
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);
