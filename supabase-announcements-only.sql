create table if not exists public.announcements (
  id text primary key,
  title text not null,
  body text not null default '',
  audience text not null default 'all',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.announcements enable row level security;

drop policy if exists "anyone can view active announcements" on public.announcements;
create policy "anyone can view active announcements"
on public.announcements
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "admins can manage announcements" on public.announcements;
create policy "admins can manage announcements"
on public.announcements
for all
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

insert into public.announcements (id, title, body, audience, priority, is_active)
values
  ('welcome', 'Welcome to the MIST Dallas 2027 portal', 'Use this space to find roles, apply, track planning phases, and keep team work organized in one place.', 'all', 'medium', true)
on conflict (id) do update set
  title = excluded.title,
  body = excluded.body,
  audience = excluded.audience,
  priority = excluded.priority,
  is_active = excluded.is_active,
  updated_at = now();
