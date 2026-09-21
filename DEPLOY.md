# Postavljanje sajta na hosting

## Šta sajtu treba od hostinga
- PHP 8+ sa uključenom `pdo_sqlite` ekstenzijom (skoro svi hostinzi je imaju uključenu po default-u)
- Mogućnost pisanja fajlova u `data/` folder (obična dozvola foldera, ne treba ništa posebno podešavati)
- Apache sa podrškom za `.htaccess` (ili ekvivalentna zaštita foldera `data/` na drugom serveru)

Baza (SQLite fajl) se sama pravi i popunjava početnim proizvodima/uslugama prvi put kada neko otvori sajt ili admin panel — ne treba ništa ručno da se pravi u hosting panelu (nema potrebe za MySQL bazom).

## Prvo postavljanje (kad dobijemo URL/pristup hostingu)

1. **Promeni admin lozinku** (obavezno pre nego što sajt postane javan):
   ```
   php -r "echo password_hash('nova-lozinka', PASSWORD_DEFAULT);"
   ```
   Zalepi ispis u `api/config.php` umesto trenutne vrednosti.

2. **Pošalji kod na server** — dva uobičajena načina:
   - **Preko git-a** (ako hosting to podržava — VPS ili panel sa git deploy opcijom):
     ```
     git remote add origin <URL_KOJI_STIGNE>
     git push -u origin master
     ```
     Na serveru: `git clone`/`git pull` u folder koji hosting servira.
   - **Preko FTP-a** (najčešće kod jeftinijeg deljenog hostinga): otpremi SVE fajlove i foldere (uključujući `api/` i `data/`) u root folder sajta (obično `public_html`).

3. Otvori sajt u pregledaču — baza se automatski kreira. Uloguj se u `/admin.html` novom lozinkom i proveri da sve radi.

## Kasnije izmene koda (kad se nešto doradi)
- Preko git-a: `git pull` na serveru (ili push preko CI/deploy hook-a).
- Preko FTP-a: ponovo otpremi izmenjene fajlove.
- **Bazu (`data/spectrum.sqlite`) nikad ne diraj/ne prepisuj** pri ažuriranju koda — ona sadrži prave proizvode/usluge koje je admin uneo i mora da ostane netaknuta.

## Ako nešto zaglavi
- Prazna/pokvarena baza: obriši `data/spectrum.sqlite` (i `-wal`/`-shm` fajlove ako postoje) — ponovo će se napraviti sa podrazumevanim proizvodima pri sledećem otvaranju sajta.
- Admin ne može da se uloguje: proveri da li je `api/config.php` na serveru s ispravnim hešom lozinke.
