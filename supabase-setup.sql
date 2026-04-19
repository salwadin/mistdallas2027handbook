create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role_id text,
  team text,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create unique index if not exists profiles_role_id_unique
on public.profiles (role_id)
where role_id is not null;

drop policy if exists "users can view all profiles" on public.profiles;
create policy "users can view all profiles"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

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

create table if not exists public.workbook_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  phase text not null,
  data jsonb not null default '{}'::jsonb,
  percent_complete integer not null default 0,
  updated_at timestamptz default now(),
  primary key (user_id, phase)
);

alter table public.workbook_progress enable row level security;

drop policy if exists "users can view all workbook progress" on public.workbook_progress;
create policy "users can view all workbook progress"
on public.workbook_progress
for select
to anon, authenticated
using (true);

drop policy if exists "users can insert own workbook progress" on public.workbook_progress;
create policy "users can insert own workbook progress"
on public.workbook_progress
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own workbook progress" on public.workbook_progress;
create policy "users can update own workbook progress"
on public.workbook_progress
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.deadline_events (
  id text primary key,
  title text not null,
  detail text not null default '',
  phase text not null check (phase in ('foundations', 'build', 'stabilization', 'execution')),
  due_date date not null,
  date_label text,
  send_reminders boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.deadline_events enable row level security;

drop policy if exists "anyone can view deadline events" on public.deadline_events;
create policy "anyone can view deadline events"
on public.deadline_events
for select
to anon, authenticated
using (true);

drop policy if exists "admins can manage deadline events" on public.deadline_events;
create policy "admins can manage deadline events"
on public.deadline_events
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

insert into public.deadline_events (id, title, detail, phase, due_date, date_label, send_reminders)
values
  ('foundations-core-roles', 'Core roles claimed', 'RD, ADs, directors, and foundational leads are claimed in the portal.', 'foundations', '2026-09-15', 'Sep 15', true),
  ('foundations-checkin', 'Foundations check-in', 'Team structures, communication norms, and first planning priorities are drafted.', 'foundations', '2026-09-30', 'Sep 30', true),
  ('build-roles-onboarded', 'Build roles onboarded', 'Build-phase chairs and leads are claimed and briefed on first deliverables.', 'build', '2026-10-15', 'Oct 15', true),
  ('build-mid-review', 'Mid-build progress review', 'Venue, registration, competitions, PR, sponsorship, and DT progress are reviewed.', 'build', '2026-11-15', 'Nov 15', true),
  ('stabilization-roles', 'Stabilization roles onboarded', 'December roles are claimed and readiness gaps are assigned owners.', 'stabilization', '2026-12-01', 'Dec 1', true),
  ('stabilization-lock', 'Schedules and rosters locked', 'Major schedules, rosters, brackets, and staffing plans are ready for execution prep.', 'stabilization', '2026-12-20', 'Dec 20', true),
  ('execution-training', 'Execution training complete', 'Dream Team and event-day operators complete walkthroughs and escalation training.', 'execution', '2027-01-10', 'Jan 10', true),
  ('execution-run-show', 'Final run-of-show confirmed', 'Command Center, communications, and all team leads confirm event-week readiness.', 'execution', '2027-01-20', 'Event Week', true)
on conflict (id) do update set
  title = excluded.title,
  detail = excluded.detail,
  phase = excluded.phase,
  due_date = excluded.due_date,
  date_label = excluded.date_label,
  send_reminders = excluded.send_reminders,
  updated_at = now();

create table if not exists public.reminder_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  days_before integer not null default 7 check (days_before in (1, 3, 7, 14)),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.reminder_preferences enable row level security;

drop policy if exists "users can view own reminder preferences" on public.reminder_preferences;
create policy "users can view own reminder preferences"
on public.reminder_preferences
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own reminder preferences" on public.reminder_preferences;
create policy "users can insert own reminder preferences"
on public.reminder_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own reminder preferences" on public.reminder_preferences;
create policy "users can update own reminder preferences"
on public.reminder_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.reminder_deliveries (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  deadline_id text not null references public.deadline_events(id) on delete cascade,
  reminder_date date not null default current_date,
  sent_at timestamptz not null default now(),
  unique (user_id, deadline_id, reminder_date)
);

alter table public.reminder_deliveries enable row level security;

drop policy if exists "admins can view reminder deliveries" on public.reminder_deliveries;
create policy "admins can view reminder deliveries"
on public.reminder_deliveries
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);
