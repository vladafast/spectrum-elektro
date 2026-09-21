// ===================================================================
// Data sloj — čuva proizvode/usluge u localStorage (u pregledaču).
// Admin panel piše ovde, a Prodavnica/Servis/Početna stranica čitaju
// odavde, pa se svaka izmena odmah odražava na celom sajtu.
//
// NAPOMENA: Ovo je demonstracioni "bez servera" pristup — podaci žive
// samo u pregledaču na ovom računaru/nalogu. Za pravu produkciju
// (deljeno stanje na svim uređajima, sigurna prijava admina) ovaj sloj
// treba zameniti pravim backendom/bazom.
// ===================================================================

const STORAGE_KEY = "spectrum_items_v1";

const SEED_ITEMS = [
  // ---- PRODAJA: Televizori ----
  // Radnja trenutno drži polovne televizore na stanju; novi modeli se
  // naručuju po dogovoru — zato cena traži poziv umesto fiksnog iznosa.
  {
    id: "p-tv-samsung",
    type: "prodaja",
    name: "Samsung televizor",
    brand: "Samsung",
    category: "Televizori",
    condition: "Polovno",
    price: 0,
    priceLabel: "Pozovite za cenu",
    oldPrice: null,
    description:
      "Polovni, pregledani Samsung televizor. Dostupni su i novi modeli ovog brenda po porudžbini — pozovite za trenutnu ponudu i cenu.",
    icon: "tv-old",
    stock: true,
    featured: true,
  },
  {
    id: "p-tv-hisense",
    type: "prodaja",
    name: "Hisense televizor",
    brand: "Hisense",
    category: "Televizori",
    condition: "Polovno",
    price: 0,
    priceLabel: "Pozovite za cenu",
    oldPrice: null,
    description:
      "Polovni, pregledani Hisense televizor. Dostupni su i novi modeli ovog brenda po porudžbini — pozovite za trenutnu ponudu i cenu.",
    icon: "tv-old",
    stock: true,
    featured: true,
  },
  {
    id: "p-tv-fox",
    type: "prodaja",
    name: "Fox televizor",
    brand: "Fox",
    category: "Televizori",
    condition: "Polovno",
    price: 0,
    priceLabel: "Pozovite za cenu",
    oldPrice: null,
    description:
      "Polovni, pregledani Fox televizor. Dostupni su i novi modeli ovog brenda po porudžbini — pozovite za trenutnu ponudu i cenu.",
    icon: "tv-old",
    stock: true,
    featured: false,
  },
  {
    id: "p-tv-vox",
    type: "prodaja",
    name: "Vox televizor",
    brand: "Vox",
    category: "Televizori",
    condition: "Polovno",
    price: 0,
    priceLabel: "Pozovite za cenu",
    oldPrice: null,
    description:
      "Polovni, pregledani Vox televizor. Dostupni su i novi modeli ovog brenda po porudžbini — pozovite za trenutnu ponudu i cenu.",
    icon: "tv-old",
    stock: true,
    featured: false,
  },
  {
    id: "p-tv-vivax",
    type: "prodaja",
    name: "Vivax televizor",
    brand: "Vivax",
    category: "Televizori",
    condition: "Polovno",
    price: 0,
    priceLabel: "Pozovite za cenu",
    oldPrice: null,
    description:
      "Polovni, pregledani Vivax televizor. Dostupni su i novi modeli ovog brenda po porudžbini — pozovite za trenutnu ponudu i cenu.",
    icon: "tv-old",
    stock: true,
    featured: true,
  },
  {
    id: "p-tv-tesla",
    type: "prodaja",
    name: "Tesla televizor",
    brand: "Tesla",
    category: "Televizori",
    condition: "Polovno",
    price: 0,
    priceLabel: "Pozovite za cenu",
    oldPrice: null,
    description:
      "Polovni, pregledani Tesla televizor. Dostupni su i novi modeli ovog brenda po porudžbini — pozovite za trenutnu ponudu i cenu.",
    icon: "tv-old",
    stock: true,
    featured: false,
  },
  {
    id: "p-tv-philips",
    type: "prodaja",
    name: "Philips televizor",
    brand: "Philips",
    category: "Televizori",
    condition: "Polovno",
    price: 0,
    priceLabel: "Pozovite za cenu",
    oldPrice: null,
    description:
      "Polovni, pregledani Philips televizor. Dostupni su i novi modeli ovog brenda po porudžbini — pozovite za trenutnu ponudu i cenu.",
    icon: "tv-old",
    stock: true,
    featured: false,
  },

  // ---- PRODAJA: daljinski upravljači ----
  {
    id: "p-remote-tv",
    type: "prodaja",
    name: "Daljinski upravljač za TV",
    brand: "Spectrum",
    category: "Daljinski upravljači",
    condition: "Novo",
    price: 1000,
    oldPrice: null,
    description: "Univerzalni daljinski upravljač za sve brendove televizora.",
    icon: "remote",
    stock: true,
    featured: true,
  },
  {
    id: "p-remote-klima",
    type: "prodaja",
    name: "Daljinski upravljač za klima uređaj",
    brand: "Spectrum",
    category: "Daljinski upravljači",
    condition: "Novo",
    price: 1500,
    oldPrice: null,
    description: "Univerzalni daljinski upravljač za klima uređaje svih brendova.",
    icon: "remote",
    stock: true,
    featured: false,
  },
  {
    id: "p-remote-dtv2",
    type: "prodaja",
    name: "Daljinski upravljač za DTV2 risiver",
    brand: "Spectrum",
    category: "Daljinski upravljači",
    condition: "Novo",
    price: 700,
    oldPrice: null,
    description: "Daljinski upravljač za digitalne zemaljske (DVB-T2) risivere.",
    icon: "remote",
    stock: true,
    featured: false,
  },

  // ---- PRODAJA: kablovi i delovi ----
  {
    id: "p-kabl-hdmi",
    type: "prodaja",
    name: "HDMI kabl",
    brand: "Spectrum",
    category: "Kablovi i delovi",
    condition: "Novo",
    price: 750,
    priceLabel: "750 – 1.200 RSD",
    oldPrice: null,
    description: "HDMI kabl različitih dužina, cena zavisi od dužine kabla.",
    icon: "cable",
    stock: true,
    featured: false,
  },
  {
    id: "p-kabl-skart",
    type: "prodaja",
    name: "Skart kabl",
    brand: "Spectrum",
    category: "Kablovi i delovi",
    condition: "Novo",
    price: 600,
    oldPrice: null,
    description: "Skart (SCART) kabl za povezivanje starijih uređaja.",
    icon: "cable",
    stock: true,
    featured: false,
  },
  {
    id: "p-kabl-koaksijalni",
    type: "prodaja",
    name: "Koaksijalni (antenski) kabl",
    brand: "Spectrum",
    category: "Kablovi i delovi",
    condition: "Novo",
    price: 45,
    priceLabel: "45 RSD/m",
    oldPrice: null,
    description: "Antenski koaksijalni kabl, cena po metru.",
    icon: "cable",
    stock: true,
    featured: false,
  },
  {
    id: "p-diodni-most",
    type: "prodaja",
    name: "Grečov diodni most",
    brand: "Spectrum",
    category: "Kablovi i delovi",
    condition: "Novo",
    price: 600,
    oldPrice: null,
    description: "Rezervni deo za popravku napojnih kola televizora i drugih uređaja.",
    icon: "board",
    stock: true,
    featured: false,
  },
  {
    id: "p-adapter-napajanje",
    type: "prodaja",
    name: "Adapter za napajanje",
    brand: "Spectrum",
    category: "Kablovi i delovi",
    condition: "Novo",
    price: 800,
    priceLabel: "800 – 1.500 RSD",
    oldPrice: null,
    description: "Adapteri za napajanje raznih uređaja, cena zavisi od modela.",
    icon: "cable",
    stock: true,
    featured: false,
  },

  // ---- SERVIS ----
  {
    id: "s-dijagnostika",
    type: "servis",
    name: "Dijagnostika kvara",
    category: "Dijagnostika",
    price: 0,
    priceLabel: "Besplatno",
    description:
      "Detaljan pregled uređaja i utvrđivanje uzroka kvara pre nego što odlučite da li se popravka isplati. Bez obaveze.",
    icon: "diagnostic",
    featured: true,
  },
  {
    id: "s-pozadinsko-32",
    type: "servis",
    name: "Zamena pozadinskog osvetljenja (32\")",
    category: "Popravka ekrana",
    price: 4000,
    priceLabel: "4.000 – 6.000 RSD",
    description:
      "Otklanjanje mrlja, tamnih polja i treperenja slike zamenom LED traka u panelu, uz 12 meseci garancije.",
    icon: "backlight",
    featured: true,
  },
  {
    id: "s-pozadinsko-40-43",
    type: "servis",
    name: "Zamena pozadinskog osvetljenja (40–43\")",
    category: "Popravka ekrana",
    price: 7000,
    priceLabel: "7.000 – 9.000 RSD",
    description:
      "Otklanjanje mrlja, tamnih polja i treperenja slike zamenom LED traka u panelu, uz 12 meseci garancije.",
    icon: "backlight",
    featured: false,
  },
  {
    id: "s-pozadinsko-43-55",
    type: "servis",
    name: "Zamena pozadinskog osvetljenja (43–55\")",
    category: "Popravka ekrana",
    price: 8000,
    priceLabel: "8.000 – 12.000 RSD",
    description:
      "Otklanjanje mrlja, tamnih polja i treperenja slike zamenom LED traka u panelu, uz 12 meseci garancije.",
    icon: "backlight",
    featured: false,
  },
  {
    id: "s-pozadinsko-55plus",
    type: "servis",
    name: "Zamena pozadinskog osvetljenja (55\"+)",
    category: "Popravka ekrana",
    price: 10000,
    priceLabel: "10.000 – 18.000 RSD",
    description:
      "Otklanjanje mrlja, tamnih polja i treperenja slike zamenom LED traka u panelu, uz 12 meseci garancije.",
    icon: "backlight",
    featured: false,
  },
  {
    id: "s-maticna",
    type: "servis",
    name: "Servisiranje matične ploče",
    category: "Elektronika",
    price: 2500,
    description:
      "Popravka ili zamena matične ploče — za uređaje koji se ne pale ili imaju izobličenu sliku. Cena zavisi od kvara i brenda uređaja.",
    icon: "board",
    featured: true,
  },
  {
    id: "s-mrezna",
    type: "servis",
    name: "Servisiranje mrežne ploče",
    category: "Elektronika",
    price: 2500,
    priceLabel: "2.500 – 7.000 RSD",
    description: "Popravka ili zamena mrežne ploče (Wi-Fi / LAN) na Smart TV uređajima.",
    icon: "board",
    featured: false,
  },
  {
    id: "s-audio",
    type: "servis",
    name: "Popravka radio uređaja i tonskih pojačala",
    category: "Audio uređaji",
    price: 1000,
    priceLabel: "1.000 – 10.000 RSD",
    description: "Servisiranje radio prijemnika i tonskih (audio) pojačala.",
    icon: "soundbar",
    featured: false,
  },
  {
    id: "s-panel",
    type: "servis",
    name: "Zamena ekrana / panela",
    category: "Popravka ekrana",
    price: 15990,
    description:
      "Zamena oštećenog ili napuklog panela originalnim ili kompatibilnim delovima, uz proveru kalibracije slike.",
    icon: "screen",
    featured: false,
  },
  {
    id: "s-daljinski",
    type: "servis",
    name: "Popravka daljinskog upravljača",
    category: "Sitne popravke",
    price: 1490,
    description:
      "Čišćenje kontakata, zamena tastature ili senzora — vraćamo vaš daljinski u funkciju umesto kupovine novog.",
    icon: "remote",
    featured: false,
  },
  {
    id: "s-softver",
    type: "servis",
    name: "Softverska dijagnostika i ažuriranje",
    category: "Smart TV",
    price: 2990,
    description:
      "Rešavanje problema sa aplikacijama, sporim radom ili zamrzavanjem Smart TV sistema, uz ažuriranje na najnoviju verziju.",
    icon: "wrench",
    featured: false,
  },
  {
    id: "s-ugradnja",
    type: "servis",
    name: "Ugradnja i kalibracija slike",
    category: "Montaža",
    price: 2490,
    description:
      "Montaža na zid, povezivanje uređaja i fino podešavanje slike i zvuka prema prostoriji.",
    icon: "wall-mount",
    featured: false,
  },
  {
    id: "s-preuzimanje",
    type: "servis",
    name: "Preuzimanje uređaja na adresi",
    category: "Dodatne usluge",
    price: 0,
    priceLabel: "Uz doplatu",
    description: "Dolazimo po vaš uređaj i vraćamo ga nazad nakon popravke.",
    icon: "truck",
    featured: false,
  },
  {
    id: "s-terenski",
    type: "servis",
    name: "Terenski servis (na adresi)",
    category: "Dodatne usluge",
    price: 0,
    priceLabel: "Po dogovoru",
    description: "Servisiranje televizora direktno na vašoj adresi, bez potrebe da nosite uređaj u radnju.",
    icon: "wrench",
    featured: false,
  },
  {
    id: "s-kanali",
    type: "servis",
    name: "Programiranje kanala",
    category: "Montaža",
    price: 0,
    priceLabel: "Po dogovoru",
    description: "Podešavanje i skeniranje TV kanala na vašem uređaju.",
    icon: "tv",
    featured: false,
  },
  {
    id: "s-antena",
    type: "servis",
    name: "Postavljanje antena",
    category: "Montaža",
    price: 0,
    priceLabel: "Po dogovoru",
    description: "Ugradnja i podešavanje TV antena za najbolji prijem signala.",
    icon: "wall-mount",
    featured: false,
  },
];

function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    throw new Error(
      "Nema dovoljno prostora za čuvanje podataka u pregledaču. Slika je verovatno prevelika — probajte manju sliku ili obrišite neku staru stavku."
    );
  }
}

export function getItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      persist(SEED_ITEMS);
      return clone(SEED_ITEMS);
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Greška pri čitanju podataka, vraćam podrazumevane.", err);
    return clone(SEED_ITEMS);
  }
}

export function getItem(id) {
  return getItems().find((item) => item.id === id) || null;
}

export function addItem(item) {
  const items = getItems();
  const newItem = {
    id: crypto.randomUUID(),
    stock: true,
    featured: false,
    oldPrice: null,
    image: null,
    ...item,
  };
  items.unshift(newItem);
  persist(items);
  return newItem;
}

export function updateItem(id, patch) {
  const items = getItems();
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  persist(items);
  return items[idx];
}

export function deleteItem(id) {
  const items = getItems().filter((item) => item.id !== id);
  persist(items);
}

export function resetItems() {
  persist(SEED_ITEMS);
  return clone(SEED_ITEMS);
}

export function formatPrice(item) {
  if (item.priceLabel) return item.priceLabel;
  if (item.type === "servis") {
    if (!item.price) return "Besplatno";
    return `od ${item.price.toLocaleString("sr-RS")} RSD`;
  }
  return `${Number(item.price).toLocaleString("sr-RS")} RSD`;
}
