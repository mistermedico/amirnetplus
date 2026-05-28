create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.app_settings (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_users (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_custom_questions (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_groups (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_announcements (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_exams (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_activity_log (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;
alter table public.app_users enable row level security;
alter table public.app_custom_questions enable row level security;
alter table public.app_groups enable row level security;
alter table public.app_announcements enable row level security;
alter table public.app_exams enable row level security;
alter table public.app_activity_log enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'app_settings',
    'app_users',
    'app_custom_questions',
    'app_groups',
    'app_announcements',
    'app_exams',
    'app_activity_log'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', table_name || '_select', table_name);
    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', table_name || '_select', table_name);

    execute format('drop policy if exists %I on public.%I', table_name || '_insert', table_name);
    execute format('create policy %I on public.%I for insert to anon, authenticated with check (true)', table_name || '_insert', table_name);

    execute format('drop policy if exists %I on public.%I', table_name || '_update', table_name);
    execute format('create policy %I on public.%I for update to anon, authenticated using (true) with check (true)', table_name || '_update', table_name);

    execute format('drop policy if exists %I on public.%I', table_name || '_delete', table_name);
    execute format('create policy %I on public.%I for delete to anon, authenticated using (true)', table_name || '_delete', table_name);

    execute format('alter table public.%I replica identity full', table_name);
    execute format('drop trigger if exists %I on public.%I', 'set_' || table_name || '_updated_at', table_name);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', 'set_' || table_name || '_updated_at', table_name);
  end loop;
end $$;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_settings') then
    alter publication supabase_realtime add table public.app_settings;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_users') then
    alter publication supabase_realtime add table public.app_users;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_custom_questions') then
    alter publication supabase_realtime add table public.app_custom_questions;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_groups') then
    alter publication supabase_realtime add table public.app_groups;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_announcements') then
    alter publication supabase_realtime add table public.app_announcements;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_exams') then
    alter publication supabase_realtime add table public.app_exams;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_activity_log') then
    alter publication supabase_realtime add table public.app_activity_log;
  end if;
end $$;
