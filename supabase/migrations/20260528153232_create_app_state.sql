create table if not exists public.app_state (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

create policy "app_state_select"
on public.app_state
for select
to anon, authenticated
using (true);

create policy "app_state_insert"
on public.app_state
for insert
to anon, authenticated
with check (true);

create policy "app_state_update"
on public.app_state
for update
to anon, authenticated
using (true)
with check (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_app_state_updated_at on public.app_state;
create trigger set_app_state_updated_at
before update on public.app_state
for each row
execute function public.set_updated_at();
