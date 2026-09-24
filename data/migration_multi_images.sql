-- ===================================================================
-- Migracija: više slika po proizvodu/usluzi + Supabase Storage za slike
-- ===================================================================
-- POKRENI OVO RUČNO jednom, u Supabase dashboardu → SQL Editor → New query.
-- Sajt (kod) je već ažuriran da očekuje kolonu "images" (niz) i bucket
-- "product-images" — ništa neće raditi dok se ova migracija ne pokrene.
--
-- UPOZORENJE: ovo trajno briše staru kolonu "image" (jednu sliku po stavci)
-- nakon što prebaci postojeće slike u novu kolonu "images". Ako imaš stavke
-- sa slikama, njihova postojeća slika će postati prva slika u novom nizu —
-- ništa se ne gubi, samo se menja oblik kolone.
-- ===================================================================

-- 1) Nova kolona za niz slika + prebacivanje postojećih slika u nju
alter table public.items add column if not exists images text[] not null default '{}';

update public.items
set images = array[image]
where image is not null
  and image <> ''
  and array_length(images, 1) is null;

alter table public.items drop column if exists image;

-- 2) Storage bucket za slike proizvoda (javno čitanje, izmene samo za admin)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Svako može da VIDI slike (potrebno da bi se prikazale na sajtu)
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects
  for select
  using (bucket_id = 'product-images');

-- Samo admin nalog (isti email kao SITE_CONFIG.adminEmail u js/config.js)
-- može da otprema/menja/briše slike
drop policy if exists "Admin manage product images" on storage.objects;
create policy "Admin manage product images" on storage.objects
  for all
  using (
    bucket_id = 'product-images'
    and lower(auth.jwt() ->> 'email') = lower('vasilijeglisevic032@gmail.com')
  )
  with check (
    bucket_id = 'product-images'
    and lower(auth.jwt() ->> 'email') = lower('vasilijeglisevic032@gmail.com')
  );

-- Gotovo. Proveri u Storage → product-images da je bucket "Public",
-- i da uspeš da uploaduješ/uklanjaš sliku iz admin panela.
