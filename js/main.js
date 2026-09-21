// ===================================================================
// Zajednička logika za sve javne stranice: mobilni meni, hidratacija
// kontakt podataka iz config.js i reveal-on-scroll animacije.
// ===================================================================
import { SITE_CONFIG } from "./config.js";

function initNavToggle() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelectorAll(".nav-links a");
  if (!header || !toggle) return;

  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.innerHTML = open
      ? document.getElementById("icon-close-tpl")?.innerHTML || toggle.innerHTML
      : document.getElementById("icon-menu-tpl")?.innerHTML || toggle.innerHTML;
  });

  links.forEach((link) =>
    link.addEventListener("click", () => {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
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
  document.querySelectorAll(".js-social-instagram").forEach((el) => (el.href = c.social.instagram));
  document.querySelectorAll(".js-social-facebook").forEach((el) => (el.href = c.social.facebook));

  const hoursBody = document.querySelector(".js-hours-table");
  if (hoursBody) {
    hoursBody.innerHTML = c.hours
      .map((row) => `<tr><td>${row.day}</td><td>${row.time}</td></tr>`)
      .join("");
  }

  const mapFrame = document.querySelector(".js-map-frame");
  if (mapFrame) {
    mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(c.mapsQuery)}&z=15&output=embed`;
  }
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
  hydrateContactInfo();
  initReveal();
  initHeaderScroll();
});
