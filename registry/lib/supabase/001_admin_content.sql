-- Admin kit schema for Supabase (Postgres).
-- Apply in the host project. This file does not connect to a database.
--
-- Public visitors can read rows with published = true.
-- Writes require a row in public.admins for auth.uid().
-- Bookings are not public: the site inserts them with the service role.

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.categories (
  id text primary key,
  title text not null,
  slug text not null unique,
  position integer not null default 0,
  published boolean not null default false
);

create table if not exists public.projects (
  id text primary key,
  title text not null,
  slug text not null unique,
  category_id text references public.categories (id) on delete set null,
  summary text not null default '',
  client text not null default '',
  year text not null default '',
  live_url text not null default '',
  cover_url text,
  show_on_homepage boolean not null default false,
  published boolean not null default false,
  position integer not null default 0
);

create table if not exists public.settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id text primary key,
  name text not null,
  logo_url text,
  row_index integer not null default 0,
  position integer not null default 0,
  published boolean not null default false
);

create table if not exists public.photos (
  id text primary key,
  src text not null default '',
  alt text not null default '',
  show_on_homepage boolean not null default false,
  position integer not null default 0,
  published boolean not null default false
);

create table if not exists public.testimonials (
  id text primary key,
  quote text not null,
  name text not null,
  role text not null default '',
  avatar_url text,
  position integer not null default 0,
  published boolean not null default false
);

create table if not exists public.faqs (
  id text primary key,
  question text not null,
  answer text not null,
  position integer not null default 0,
  published boolean not null default false
);

create table if not exists public.plans (
  id text primary key,
  name text not null,
  blurb text not null default '',
  monthly_price integer,
  badge text not null default '',
  cta_label text not null default '',
  cta_href text not null default '',
  position integer not null default 0,
  published boolean not null default false
);

create table if not exists public.plan_features (
  id text primary key,
  plan_id text not null references public.plans (id) on delete cascade,
  text text not null,
  position integer not null default 0
);

create table if not exists public.about_stats (
  id text primary key,
  value text not null,
  label text not null,
  position integer not null default 0,
  published boolean not null default false
);

create table if not exists public.experience (
  id text primary key,
  role text not null,
  company text not null default '',
  period text not null default '',
  position integer not null default 0,
  published boolean not null default false
);

create table if not exists public.awards (
  id text primary key,
  name text not null,
  count text not null default '',
  href text not null default '',
  position integer not null default 0,
  published boolean not null default false
);

create table if not exists public.media (
  id text primary key,
  filename text not null,
  mime text not null,
  size integer not null default 0,
  url text not null default '',
  storage_path text not null default '',
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id text primary key,
  created_at bigint not null,
  updated_at bigint not null,
  status text not null default 'booked',
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  needs text not null default '',
  plan text not null default '',
  note text not null default '',
  source text not null default 'site',
  came_from text not null default '',
  start_time bigint,
  end_time bigint,
  timezone text not null default '',
  meet_url text not null default ''
);

create index if not exists projects_position_idx on public.projects (position);
create index if not exists projects_homepage_idx on public.projects (show_on_homepage, position);
create index if not exists bookings_created_idx on public.bookings (created_at);

alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.settings enable row level security;
alter table public.clients enable row level security;
alter table public.photos enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.plans enable row level security;
alter table public.plan_features enable row level security;
alter table public.about_stats enable row level security;
alter table public.experience enable row level security;
alter table public.awards enable row level security;
alter table public.media enable row level security;
alter table public.bookings enable row level security;

-- A signed-in user can see their own admin row. Other reads and all writes
-- go through is_admin(), which is security definer so it does not recurse.
drop policy if exists admins_select_self on public.admins;
create policy admins_select_self on public.admins
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists admins_write on public.admins;
create policy admins_write on public.admins
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Settings are site copy. The public site needs them; only admins write.
drop policy if exists settings_read on public.settings;
create policy settings_read on public.settings
  for select to anon, authenticated
  using (true);

drop policy if exists settings_write on public.settings;
create policy settings_write on public.settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Media rows are addresses of public files. Only admins change them.
drop policy if exists media_read on public.media;
create policy media_read on public.media
  for select to anon, authenticated
  using (true);

drop policy if exists media_write on public.media;
create policy media_write on public.media
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Bookings hold personal data. No anon read or write.
drop policy if exists bookings_admin on public.bookings;
create policy bookings_admin on public.bookings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Published content is public. Admins can read drafts and write.
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'projects', 'clients', 'photos', 'testimonials', 'faqs',
    'plans', 'about_stats', 'experience', 'awards'
  ]
  loop
    execute format(
      'drop policy if exists %I on public.%I; create policy %I on public.%I for select to anon, authenticated using (published = true or public.is_admin())',
      t || '_read', t, t || '_read', t
    );
    execute format(
      'drop policy if exists %I on public.%I; create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t || '_write', t, t || '_write', t
    );
  end loop;
end $$;

-- Features follow their plan: public when the plan is published.
drop policy if exists plan_features_read on public.plan_features;
create policy plan_features_read on public.plan_features
  for select to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.plans p
      where p.id = plan_id and p.published = true
    )
  );

drop policy if exists plan_features_write on public.plan_features;
create policy plan_features_write on public.plan_features
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_bucket_read on storage.objects;
create policy media_bucket_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists media_bucket_write on storage.objects;
create policy media_bucket_write on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

-- One statement, so a failed reorder does not leave a partial order.
create or replace function public.admin_reorder(target text, ids text[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if target not in (
    'categories', 'projects', 'clients', 'photos', 'testimonials',
    'faqs', 'plans', 'experience', 'awards', 'about_stats'
  ) then
    raise exception 'unknown table %', target;
  end if;

  execute format(
    'update public.%I as item
        set position = ranked.pos
       from (
         select id, (ordinality - 1)::integer as pos
         from unnest($1::text[]) with ordinality as listed(id, ordinality)
       ) as ranked
      where item.id = ranked.id',
    target
  ) using ids;
end;
$$;

revoke all on function public.admin_reorder(text, text[]) from public;
grant execute on function public.admin_reorder(text, text[]) to authenticated;

-- Plan row and its feature lines commit together.
create or replace function public.admin_save_plan(plan jsonb, features jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  saved public.plans;
begin
  insert into public.plans (
    id, name, blurb, monthly_price, badge, cta_label, cta_href, position, published
  ) values (
    plan->>'id',
    coalesce(plan->>'name', ''),
    coalesce(plan->>'blurb', ''),
    case
      when plan->'monthly_price' is null or jsonb_typeof(plan->'monthly_price') = 'null' then null
      else (plan->>'monthly_price')::integer
    end,
    coalesce(plan->>'badge', ''),
    coalesce(plan->>'cta_label', ''),
    coalesce(plan->>'cta_href', ''),
    coalesce((plan->>'position')::integer, 0),
    coalesce((plan->>'published')::boolean, false)
  )
  on conflict (id) do update set
    name = excluded.name,
    blurb = excluded.blurb,
    monthly_price = excluded.monthly_price,
    badge = excluded.badge,
    cta_label = excluded.cta_label,
    cta_href = excluded.cta_href,
    position = excluded.position,
    published = excluded.published
  returning * into saved;

  delete from public.plan_features where plan_id = saved.id;

  insert into public.plan_features (id, plan_id, text, position)
  select
    saved.id || ':' || (item.ord - 1)::text,
    saved.id,
    item.feature,
    (item.ord - 1)::integer
  from jsonb_array_elements_text(coalesce(features, '[]'::jsonb)) with ordinality as item(feature, ord);

  return to_jsonb(saved);
end;
$$;

revoke all on function public.admin_save_plan(jsonb, jsonb) from public;
grant execute on function public.admin_save_plan(jsonb, jsonb) to authenticated;
