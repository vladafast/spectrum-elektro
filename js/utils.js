// ===================================================================
// Sitne deljene pomoćne funkcije.
// ===================================================================

// Sprečava da tekst koji je admin uneo (naziv, opis, kategorija, brend)
// slučajno ili namerno probije HTML kad se ubacuje u karticu/tabelu —
// npr. "5 < 6" ili "Samsung & LG" bi inače pokvarili prikaz, a bez ovoga
// bi neko ko dobije admin lozinku mogao da ubaci <script> kod koji bi se
// izvršio kod svakog posetioca sajta.
export function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]);
}
