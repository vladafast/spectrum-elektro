-- ===================================================================
-- Migracija: društvene mreže u footeru (Instagram/Facebook/X/Reddit),
-- uređuje se iz admin panela — nezavisna od migration_multi_images.sql,
-- može se pokrenuti pre, posle ili nezavisno od nje.
-- ===================================================================
-- POKRENI OVO RUČNO jednom, u Supabase dashboardu → SQL Editor → New query.

create table if not exists public.social_links (
  platform text primary key,
  url text
);

insert into public.social_links (platform, url) values
  ('instagram', null),
  ('facebook', null),
  ('x', null),
  ('reddit', null)
on conflict (platform) do nothing;

alter table public.social_links enable row level security;

-- Svako može da VIDI koji linkovi su podešeni (potrebno da bi se ikonice
-- prikazale na sajtu)
drop policy if exists "Public read social links" on public.social_links;
create policy "Public read social links" on public.social_links
  for select
  using (true);

-- Samo admin nalog (isti email kao SITE_CONFIG.adminEmail u js/config.js)
-- može da menja linkove
drop policy if exists "Admin manage social links" on public.social_links;
create policy "Admin manage social links" on public.social_links
  for all
  using (lower(auth.jwt() ->> 'email') = lower('vasilijeglisevic032@gmail.com'))
  with check (lower(auth.jwt() ->> 'email') = lower('vasilijeglisevic032@gmail.com'));

-- Gotovo. Prazan url = ikonica se ne prikazuje na sajtu (Instagram/Facebook
-- trenutno nemate pa ostaju prazni dok se ne otvore nalozi).
