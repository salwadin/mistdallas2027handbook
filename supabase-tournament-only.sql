-- Weekend Tournament Manager setup
-- Paste this into Supabase SQL Editor when you are ready to make the
-- room, competition, student placement, and NFC check-in system live.

create table if not exists public.tournament_rooms (
  id text primary key,
  room_name text not null,
  building text,
  floor_label text,
  capacity integer not null default 0 check (capacity >= 0),
  room_type text not null default 'Competition Room',
  privacy_notes text,
  av_notes text,
  setup_notes text,
  room_captain_role text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tournament_rooms enable row level security;

drop policy if exists "anyone can view active tournament rooms" on public.tournament_rooms;
create policy "anyone can view active tournament rooms"
on public.tournament_rooms
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "admins can manage tournament rooms" on public.tournament_rooms;
create policy "admins can manage tournament rooms"
on public.tournament_rooms
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

create table if not exists public.room_availability (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references public.tournament_rooms(id) on delete cascade,
  available_date date not null,
  starts_at time not null,
  ends_at time not null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (ends_at > starts_at)
);

create index if not exists room_availability_room_date_idx
on public.room_availability (room_id, available_date, starts_at);

alter table public.room_availability enable row level security;

drop policy if exists "anyone can view room availability" on public.room_availability;
create policy "anyone can view room availability"
on public.room_availability
for select
to anon, authenticated
using (true);

drop policy if exists "admins can manage room availability" on public.room_availability;
create policy "admins can manage room availability"
on public.room_availability
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

create table if not exists public.competition_blocks (
  id uuid primary key default gen_random_uuid(),
  competition_name text not null,
  round_label text not null default 'Round 1',
  division text,
  room_id text references public.tournament_rooms(id) on delete set null,
  block_date date not null,
  starts_at time not null,
  ends_at time not null,
  capacity integer not null default 0 check (capacity >= 0),
  judge_count integer not null default 0 check (judge_count >= 0),
  materials text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'locked', 'complete', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (ends_at > starts_at)
);

create index if not exists competition_blocks_room_date_idx
on public.competition_blocks (room_id, block_date, starts_at);

create index if not exists competition_blocks_competition_idx
on public.competition_blocks (competition_name, block_date);

alter table public.competition_blocks enable row level security;

drop policy if exists "anyone can view scheduled competition blocks" on public.competition_blocks;
create policy "anyone can view scheduled competition blocks"
on public.competition_blocks
for select
to anon, authenticated
using (status in ('scheduled', 'locked', 'complete'));

drop policy if exists "admins can manage competition blocks" on public.competition_blocks;
create policy "admins can manage competition blocks"
on public.competition_blocks
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

create table if not exists public.student_registrations (
  id uuid primary key default gen_random_uuid(),
  external_student_id text unique,
  full_name text not null,
  email text,
  school text,
  grade_level text,
  gender_label text,
  nfc_uid text unique,
  registration_data jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists student_registrations_nfc_uid_idx
on public.student_registrations (nfc_uid);

create index if not exists student_registrations_school_idx
on public.student_registrations (school);

alter table public.student_registrations enable row level security;

drop policy if exists "admins can manage student registrations" on public.student_registrations;
create policy "admins can manage student registrations"
on public.student_registrations
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

create table if not exists public.student_competition_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_registrations(id) on delete cascade,
  competition_name text not null,
  division text,
  registration_status text not null default 'registered' check (registration_status in ('registered', 'waitlisted', 'withdrawn')),
  created_at timestamptz default now(),
  unique (student_id, competition_name, division)
);

create index if not exists student_competition_entries_competition_idx
on public.student_competition_entries (competition_name, division);

alter table public.student_competition_entries enable row level security;

drop policy if exists "admins can manage student competition entries" on public.student_competition_entries;
create policy "admins can manage student competition entries"
on public.student_competition_entries
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

create table if not exists public.room_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.student_registrations(id) on delete cascade,
  competition_block_id uuid not null references public.competition_blocks(id) on delete cascade,
  assignment_status text not null default 'assigned' check (assignment_status in ('assigned', 'checked_in', 'missed', 'excused', 'removed')),
  checked_in_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (student_id, competition_block_id)
);

create index if not exists room_assignments_block_idx
on public.room_assignments (competition_block_id, assignment_status);

create index if not exists room_assignments_student_idx
on public.room_assignments (student_id);

alter table public.room_assignments enable row level security;

drop policy if exists "admins can manage room assignments" on public.room_assignments;
create policy "admins can manage room assignments"
on public.room_assignments
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

create table if not exists public.nfc_scan_logs (
  id bigserial primary key,
  nfc_uid text not null,
  student_id uuid references public.student_registrations(id) on delete set null,
  room_id text references public.tournament_rooms(id) on delete set null,
  competition_block_id uuid references public.competition_blocks(id) on delete set null,
  scan_type text not null default 'room_entry' check (scan_type in ('event_checkin', 'room_entry', 'room_exit', 'manual_override')),
  scan_result text not null default 'accepted' check (scan_result in ('accepted', 'unknown_tag', 'wrong_room', 'duplicate', 'manual_review')),
  scanned_by uuid references auth.users(id) on delete set null,
  notes text,
  scanned_at timestamptz not null default now()
);

create index if not exists nfc_scan_logs_nfc_uid_idx
on public.nfc_scan_logs (nfc_uid, scanned_at desc);

create index if not exists nfc_scan_logs_block_idx
on public.nfc_scan_logs (competition_block_id, scanned_at desc);

alter table public.nfc_scan_logs enable row level security;

drop policy if exists "admins can view nfc scan logs" on public.nfc_scan_logs;
create policy "admins can view nfc scan logs"
on public.nfc_scan_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.is_admin = true
  )
);

drop policy if exists "authenticated organizers can insert nfc scan logs" on public.nfc_scan_logs;
create policy "authenticated organizers can insert nfc scan logs"
on public.nfc_scan_logs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role_id is not null
  )
);

drop policy if exists "admins can manage nfc scan logs" on public.nfc_scan_logs;
create policy "admins can manage nfc scan logs"
on public.nfc_scan_logs
for update
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

insert into public.tournament_rooms (id, room_name, building, floor_label, capacity, room_type, privacy_notes, av_notes, setup_notes, room_captain_role, is_active)
values
  ('sample-main-auditorium', 'Main Auditorium', 'Venue TBD', 'Level 1', 450, 'Ceremony / Large Competition', 'Public mixed seating', 'Projector, microphones, sound board', 'Needs early access and stage manager', 'Operations Director', true),
  ('sample-room-101', 'Room 101', 'Venue TBD', 'Level 1', 40, 'Competition Room', 'Standard room', 'Projector preferred', 'Classroom setup', 'Competitions Director', true),
  ('sample-room-102', 'Room 102', 'Venue TBD', 'Level 1', 40, 'Competition Room', 'Standard room', 'Projector preferred', 'Classroom setup', 'Competitions Director', true),
  ('sample-sisters-space', 'Sisters Sports / Private Space', 'Venue TBD', 'TBD', 80, 'Private / Sports', 'Sisters-only access when scheduled', 'Depends on venue', 'Privacy signage required', 'Sports Director', true)
on conflict (id) do update set
  room_name = excluded.room_name,
  building = excluded.building,
  floor_label = excluded.floor_label,
  capacity = excluded.capacity,
  room_type = excluded.room_type,
  privacy_notes = excluded.privacy_notes,
  av_notes = excluded.av_notes,
  setup_notes = excluded.setup_notes,
  room_captain_role = excluded.room_captain_role,
  is_active = excluded.is_active,
  updated_at = now();
