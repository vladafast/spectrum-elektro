// ===================================================================
// Minimalistički set linijskih SVG ikonica (u stilu Spectrum brenda).
// Sve ikonice koriste currentColor pa nasleđuju boju iz CSS-a.
// ===================================================================
const PATHS = {
  tv: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 20.5h8M12 17v3.5"/>',
  "tv-old": '<rect x="3" y="5" width="14" height="11" rx="1.5"/><circle cx="19.5" cy="8" r="1.6"/><circle cx="19.5" cy="13" r="1.6"/>',
  remote: '<rect x="8" y="2.5" width="8" height="19" rx="3"/><circle cx="12" cy="7" r="1.4"/><path d="M9.5 11.5h5M9.5 14.5h5M9.5 17.5h5"/>',
  soundbar: '<rect x="2.5" y="9" width="19" height="6" rx="2"/><circle cx="7" cy="12" r="1"/><circle cx="11" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  "wall-mount": '<path d="M4 4v16M4 8h9l5 4-5 4H4"/>',
  screen: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/><path d="M7 9l3 3 2-2 4 4" fill="none"/>',
  backlight: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  board: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 4v3M16 4v3M8 17v3M16 17v3M4 8h3M4 16h3M17 8h3M17 16h3"/><circle cx="12" cy="12" r="2.5"/>',
  diagnostic: '<path d="M3 12h4l2-7 4 14 2-7h6"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 4.9L3 17.5V21h3.5l6.3-6.3a4 4 0 0 0 4.9-5.4l-3 3-2-2z"/>',
  shield: '<path d="M12 2.5l7.5 3v5.5c0 5-3.2 8.4-7.5 10.5-4.3-2.1-7.5-5.5-7.5-10.5V5.5l7.5-3z"/><path d="M8.8 12l2.1 2.1 4.3-4.3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  truck: '<path d="M2.5 6.5h11v9h-11z"/><path d="M13.5 10h4l3 3v2.5h-7z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L12 16.8l-5.3 2.8 1.1-5.9L3.5 9.6l5.9-.7z"/>',
  check: '<path d="M4 12.5l5 5 11-11"/>',
  phone: '<path d="M5 4.5h3.3L10 9l-2.2 1.6a11.5 11.5 0 0 0 5.6 5.6L15 14l4.5 1.7V19a2 2 0 0 1-2.1 2C9.9 20.5 3.5 14.1 3 6.6A2 2 0 0 1 5 4.5z"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
  mappin: '<path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/>',
  facebook: '<path d="M14 21v-7.5h2.5l.5-3H14V8.3c0-1 .3-1.7 1.8-1.7H17V4.1C16.6 4 15.6 4 14.5 4A4 4 0 0 0 10 8.5v2H7.5v3H10V21z"/>',
  x: '<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M7.5 7.5l9 9M16.5 7.5l-9 9"/>',
  reddit: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="14.2" r="5"/><circle cx="9.3" cy="14.2" r="1"/><circle cx="14.7" cy="14.2" r="1"/><path d="M9 17.2c1 1 5 1 6 0"/><path d="M12 9.2V5.7l2.7-1.3"/><circle cx="15.3" cy="4" r="1.1"/>',
  menu: '<path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17"/>',
  close: '<path d="M5 5l14 14M19 5L5 19"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20l.9-4.2L15.5 5.2a1.8 1.8 0 0 1 2.5 0l.8.8a1.8 1.8 0 0 1 0 2.5L8.2 19.1z"/>',
  plus: '<path d="M12 4.5v15M4.5 12h15"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5"/>',
  arrow: '<path d="M4.5 12h15M13 5.5l6.5 6.5-6.5 6.5"/>',
  cable: '<rect x="2.5" y="9" width="5" height="6" rx="1.5"/><rect x="16.5" y="9" width="5" height="6" rx="1.5"/><path d="M7.5 12h9"/>',
  refresh: '<path d="M20 8a8 8 0 1 0 1.5 6.5"/><path d="M20 3v5.5h-5.5"/>',
  logout: '<path d="M9 4.5H5.5A1.5 1.5 0 0 0 4 6v12a1.5 1.5 0 0 0 1.5 1.5H9"/><path d="M14 15.5L19 12l-5-3.5M19 12H9"/>',
  filter: '<path d="M3 5h18M6.5 12h11M10.5 19h3"/>',
  package: '<path d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4z"/><path d="M3.5 7.4L12 12.3l8.5-4.9M12 12.3v9.2"/>',
  image: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><circle cx="8.5" cy="10" r="1.7"/><path d="M21 15.5l-5.5-5-9.5 8"/>',
};

export function icon(name, opts = {}) {
  const { size = 24, className = "", strokeWidth = 1.75 } = opts;
  const body = PATHS[name] || PATHS.tv;
  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
