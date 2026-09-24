# Postavljanje sajta na hosting

## Šta sajtu treba od hostinga
Sajt je potpuno statičan (HTML/CSS/JS) — proizvodi/usluge i admin login idu
preko Supabase-a (Postgres baza + Auth), ne preko servera. Radi na bilo kom
static hostingu: Netlify, Vercel, GitHub Pages, ili isti server kao do sada.
Ne treba PHP ni SQLite.

## Supabase podešavanje (već urađeno)
- Projekat: `oihazmmkzpqhuhvglotb.supabase.co`
- Tabela `items` sa RLS politikama: javno čitanje, izmene samo za admin nalog
  (vezano za konkretan UID admin naloga, ne za bilo koji ulogovani nalog).
- Admin nalog za `/admin.html`: email u `js/config.js` → `SITE_CONFIG.adminEmail`.
- `js/config.js` sadrži `SUPABASE_URL` i `SUPABASE_PUBLISHABLE_KEY` (anon
  ključ) — oba su bezbedna za javni frontend, pristup je zaštićen RLS-om u
  bazi. **Secret/service_role ključ se nikad ne stavlja u kod niti u git.**

## Prvo postavljanje (kad dobijemo URL/pristup hostingu)
1. Pošalji kod na server — preko git-a (`git push`) ili FTP-a (otpremi sve
   fajlove, uključujući `data/seed.json` koji koristi dugme "Resetuj" u
   admin panelu).
2. Otvori sajt u pregledaču — stavke se učitavaju direktno iz Supabase-a.
   Uloguj se u `/admin.html` sa admin mejlom i lozinkom i proveri da sve radi.

## Više slika po stavci (jednokratna migracija)
Sajt sad podržava više slika po proizvodu/usluzi, sačuvanih kao fajlovi u
Supabase Storage-u (ne kao tekst u bazi kao ranije — brže učitavanje, bez
gubitka kvaliteta pri svakom čuvanju).

**Pre nego što ovo pokreneš, sajt neće moći da čuva/prikazuje slike.**
1. Supabase dashboard → SQL Editor → New query.
2. Nalepi ceo sadržaj `data/migration_multi_images.sql` i pokreni (Run).
3. Proveri u Storage da postoji bucket `product-images` označen kao Public.
4. Otvori `/admin.html`, uredi neku stavku i probaj da dodaš/ukloniš sliku.

## Društvene mreže u footeru (jednokratna migracija)
Instagram/Facebook/X/Reddit linkovi u footeru se sad uređuju iz admin panela
("Društvene mreže" na vrhu), ne kroz kod — prazno polje = ikonica se ne
prikazuje.

1. Supabase dashboard → SQL Editor → New query.
2. Nalepi ceo sadržaj `data/migration_social_links.sql` i pokreni (Run).
3. Otvori `/admin.html` → "Društvene mreže" → upiši linkove koje imaš (ostatak
   ostavi prazan) → Sačuvaj linkove.

## Promena admin lozinke
U Supabase dashboardu → Authentication → Users → admin nalog → "Reset password"
(ili preko API-ja Admin Auth endpointa). Nema potrebe menjati kod.

## Kasnije izmene koda
- Preko git-a: `git pull` na serveru (ili push preko CI/deploy hook-a).
- Preko FTP-a: ponovo otpremi izmenjene fajlove.
- Podaci o proizvodima/uslugama žive u Supabase-u, ne u kodu — izmene se rade
  kroz admin panel i odmah su vidljive svim posetiocima.

## Ako nešto zaglavi
- Dugme "Resetuj" u admin panelu vraća stavke na podrazumevane iz
  `data/seed.json`.
- Admin ne može da se uloguje: proveri email/lozinku u Supabase dashboardu
  (Authentication → Users), i proveri da `js/config.js` → `SITE_CONFIG.adminEmail`
  odgovara tom nalogu.
