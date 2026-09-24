// ===================================================================
// Centralna konfiguracija sajta — izmenite ove podatke na jednom mestu
// i promene će se automatski pojaviti u zaglavlju, podnožju i na
// stranici Kontakt.
// ===================================================================

// Supabase — URL i publishable (anon) ključ su bezbedni za frontend,
// pristup podacima je zaštićen RLS politikama u bazi (vidi data/README ili
// Supabase dashboard). Secret/service_role ključ se NIKAD ne stavlja ovde.
export const SUPABASE_URL = "https://oihazmmkzpqhuhvglotb.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Dkuh5hqk7-ZG-ZiwsFCutg_3ZMx--vA";

export const SITE_CONFIG = {
  name: "TV Spectrum Elektro",
  claim: "Servis televizora, audio-video tehnike i kućnih aparata",
  phone: "065 464 60 49",
  phoneHref: "tel:+381654646049",
  email: "tvspektrumelektro@gmail.com",
  adminEmail: "vasilijeglisevic032@gmail.com",
  address: "Zanatski centar 31, Gornji Milanovac",
  mapsQuery: "Zanatski centar 31, Gornji Milanovac",
  hours: [
    { day: "Ponedeljak – Petak", time: "09:00 – 17:00" },
    { day: "Subota", time: "09:00 – 15:00" },
    { day: "Nedelja", time: "Na terenu / po pozivu" },
  ],
  foundedYear: 1997,
};
