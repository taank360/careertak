-- CareerTak database schema for Supabase (free Postgres).
-- Run this once in Supabase → SQL Editor → New query → Run.

-- One row per student. `data` holds the full app state (profile, tests, roadmap…);
-- the other columns are a summary used by the placement-cell dashboard.
create table if not exists public.students (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  name          text,
  district      text,
  college       text,
  education     text,
  stream        text,
  target_role   text,
  readiness     int,
  coverage      int,
  strengths     text[] default '{}',
  weaknesses    text[] default '{}',
  interest_code text,
  tests_done    int default 0,
  data          jsonb not null default '{}'::jsonb,
  updated_at    timestamptz not null default now()
);

-- Placement-cell / TPO accounts. Add a row manually for each staff member
-- (college = null means they can see every student).
create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  college text
);

alter table public.students enable row level security;
alter table public.staff enable row level security;

-- Students: read and write only their own row.
drop policy if exists "students read own" on public.students;
create policy "students read own" on public.students for select using (auth.uid() = id);
drop policy if exists "students insert own" on public.students;
create policy "students insert own" on public.students for insert with check (auth.uid() = id);
drop policy if exists "students update own" on public.students;
create policy "students update own" on public.students for update using (auth.uid() = id);

-- Staff: can check their own staff row, and read students of their college.
drop policy if exists "staff read self" on public.staff;
create policy "staff read self" on public.staff for select using (auth.uid() = user_id);
drop policy if exists "staff read students" on public.students;
create policy "staff read students" on public.students for select using (
  exists (
    select 1 from public.staff s
    where s.user_id = auth.uid() and (s.college is null or lower(s.college) = lower(students.college))
  )
);

create index if not exists students_college_idx on public.students (lower(college));

-- Make someone placement-cell staff (run after they have signed in once):
-- insert into public.staff (user_id, college)
--   select id, 'Your College Name' from auth.users where email = 'tpo@college.edu';
