// ===================================================================
// Zajednička logika za sve javne stranice: mobilni meni, hidratacija
// kontakt podataka iz config.js i reveal-on-scroll animacije.
// ===================================================================
import { SITE_CONFIG } from "./config.js";
import { icon } from "./icons.js";
import { escapeHTML } from "./utils.js";
import { getSocialLinks } from "./store.js";

function initNavToggle() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if (!header || !toggle) return;

  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.innerHTML = open
      ? document.getElementById("icon-close-tpl")?.innerHTML || toggle.innerHTML
      : document.getElementById("icon-menu-tpl")?.innerHTML || toggle.innerHTML;
  });

  // Delegacija na .nav-links (ne pojedinačni linkovi) da bi i CTA dugme
  // dodato kasnije (addMobileNavCTA) takođe zatvaralo meni na klik.
  navLinks?.addEventListener("click", (e) => {
    if (!e.target.closest("a")) return;
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  });
}

function addMobileNavCTA() {
  const navLinks = document.querySelector(".nav-links");
  if (!navLinks || navLinks.querySelector(".nav-cta")) return;
  const cta = document.createElement("div");
  cta.className = "nav-cta";
  const link = document.createElement("a");
  link.className = "btn btn-primary";
  link.href = SITE_CONFIG.phoneHref;
  link.textContent = `Pozovi: ${SITE_CONFIG.phone}`;
  cta.appendChild(link);
  navLinks.appendChild(cta);
}

function hydrateContactInfo() {
  const c = SITE_CONFIG;
  document.querySelectorAll(".js-phone-link").forEach((el) => (el.href = c.phoneHref));
  document.querySelectorAll(".js-phone-text").forEach((el) => (el.textContent = c.phone));
  document.querySelectorAll(".js-email-link").forEach((el) => {
    el.href = `mailto:${c.email}`;
    el.textContent = c.email;
  });
  document.querySelectorAll(".js-address-text").forEach((el) => (el.textContent = c.address));
  document.querySelectorAll(".js-founded-year").forEach((el) => (el.textContent = c.foundedYear));
  document.querySelectorAll(".js-years-count").forEach((el) => (el.textContent = new Date().getFullYear() - c.foundedYear));
  document.querySelectorAll(".js-current-year").forEach((el) => (el.textContent = new Date().getFullYear()));

  // querySelectorAll, ne querySelector — kontakt.html ima DVE .js-hours-table
  // (u kartici sa kontakt podacima i u footeru); querySelector bi popunio
  // samo prvu i ostavio footer praznu tabelu.
  document.querySelectorAll(".js-hours-table").forEach((hoursBody) => {
    hoursBody.innerHTML = c.hours.map((row) => `<tr><td>${row.day}</td><td>${row.time}</td></tr>`).join("");
  });

  const mapFrame = document.querySelector(".js-map-frame");
  if (mapFrame) {
    mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(c.mapsQuery)}&z=15&output=embed`;
  }
}

// Redosled i labele za footer ikonice — prikazuje se samo ono što je admin
// popunio u admin panelu (Linkovi), prazno polje = ikonica se ne prikazuje.
const SOCIAL_PLATFORMS = [
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["x", "X (Twitter)"],
  ["reddit", "Reddit"],
];

async function renderSocialLinks() {
  const container = document.querySelector(".js-social-row");
  if (!container) return;
  let links;
  try {
    links = await getSocialLinks();
  } catch {
    return;
  }
  container.innerHTML = SOCIAL_PLATFORMS.filter(([key]) => links[key])
    .map(([key, label]) => {
      const url = /^https?:\/\//i.test(links[key]) ? links[key] : `https://${links[key]}`;
      return `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" aria-label="${label}">${icon(key, { size: 18 })}</a>`;
    })
    .join("");
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
}

function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  addMobileNavCTA();
  hydrateContactInfo();
  initReveal();
  initHeaderScroll();
  renderSocialLinks();
});
