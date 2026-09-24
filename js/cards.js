// ===================================================================
// Zajedničke HTML "kartice" za proizvode i usluge — koriste ih
// index.html, prodavnica.html i servis.html.
// ===================================================================
import { icon } from "./icons.js";
import { formatPrice } from "./store.js";
import { escapeHTML } from "./utils.js";

// Ako slika ne uspe da se učita (oštećen fajl, spor internet i sl.), vraćamo se
// na ikonicu umesto da ostavimo polomljenu sliku. Koristimo delegaciju događaja
// (a ne inline onerror="") da bi ostalo kompatibilno sa strogim CSP header-ima.
export function bindImageFallbacks(container) {
  container.addEventListener(
    "error",
    (e) => {
      const img = e.target;
      if (img?.tagName === "IMG" && img.dataset.fallback) {
        const span = document.createElement("span");
        span.className = "icon";
        span.innerHTML = img.dataset.fallback;
        img.replaceWith(span);
      }
    },
    true
  );
}

export function productCardHTML(item) {
  const conditionClass = item.condition === "Polovno" ? "used" : "new";
  const name = escapeHTML(item.name);
  const cover = item.images?.[0];
  return `
  <article class="product-card" data-id="${escapeHTML(item.id)}">
    <div class="product-media">
      ${item.brand ? `<span class="badge badge-brand">${escapeHTML(item.brand)}</span>` : ""}
      <span class="badge badge-condition ${conditionClass}">${escapeHTML(item.condition || "Novo")}</span>
      ${
        cover
          ? `<img src="${escapeHTML(cover)}" alt="${name}" loading="lazy" decoding="async" width="400" height="300" data-fallback="${escapeHTML(icon(item.icon, { size: 64 }))}">`
          : `<span class="icon">${icon(item.icon, { size: 64 })}</span>`
      }
      ${item.images?.length > 1 ? `<span class="badge-photo-count">${icon("image", { size: 13 })} ${item.images.length}</span>` : ""}
      ${!item.stock ? `<div class="badge-out">Nema na stanju</div>` : ""}
    </div>
    <div class="product-body">
      <span class="cat">${escapeHTML(item.category)}</span>
      <h3>${name}</h3>
      <p class="desc">${escapeHTML(item.description)}</p>
      <div class="price-row">
        <div class="price-wrap">
          ${item.oldPrice ? `<span class="price-old">${Number(item.oldPrice).toLocaleString("sr-RS")} RSD</span>` : ""}
          <span class="price">${escapeHTML(formatPrice(item))}</span>
        </div>
        <button type="button" class="btn btn-outline btn-sm js-view-item" data-id="${escapeHTML(item.id)}">Detalji</button>
      </div>
    </div>
  </article>`;
}

export function serviceCardHTML(item) {
  const name = escapeHTML(item.name);
  const cover = item.images?.[0];
  return `
  <article class="service-card glass">
    <div class="icon-wrap">${
      cover
        ? `<img src="${escapeHTML(cover)}" alt="${name}" loading="lazy" decoding="async" data-fallback="${escapeHTML(icon(item.icon, { size: 24 }))}">`
        : icon(item.icon, { size: 24 })
    }</div>
    <span class="cat">${escapeHTML(item.category)}</span>
    <h3>${name}</h3>
    <p class="desc">${escapeHTML(item.description)}</p>
    <div class="price-row">
      <span class="price">${escapeHTML(formatPrice(item))}</span>
    </div>
  </article>`;
}

export function emptyStateHTML(message = "Nema rezultata za izabrane filtere.") {
  return `
  <div class="empty-state">
    <span class="icon">${icon("search", { size: 40 })}</span>
    <p>${escapeHTML(message)}</p>
  </div>`;
}

export function mountItemModal() {
  if (document.getElementById("itemModal")) return document.getElementById("itemModal");
  const dialog = document.createElement("dialog");
  dialog.id = "itemModal";
  dialog.className = "modal";
  dialog.innerHTML = `
    <div class="modal-inner">
      <button type="button" class="btn btn-ghost modal-close" aria-label="Zatvori">${icon("close", { size: 20 })}</button>
      <div class="product-detail-media" id="modalMedia"></div>
      <div class="product-detail-thumbs" id="modalThumbs"></div>
      <span class="cat" id="modalCat"></span>
      <h3 id="modalName" style="margin:0.4rem 0 0.7rem;"></h3>
      <p id="modalDesc"></p>
      <div class="price-row" style="margin-top:1.2rem;">
        <span class="price" id="modalPrice"></span>
        <a href="kontakt.html" class="btn btn-primary btn-sm">Kontaktiraj nas</a>
      </div>
    </div>`;
  document.body.appendChild(dialog);
  dialog.querySelector(".modal-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  return dialog;
}

function setModalImage(media, src, alt, fallbackIconName) {
  media.innerHTML = "";
  if (src) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.decoding = "async";
    img.onerror = () => {
      media.innerHTML = `<span class="icon">${icon(fallbackIconName, { size: 72 })}</span>`;
    };
    media.appendChild(img);
  } else {
    media.innerHTML = `<span class="icon">${icon(fallbackIconName, { size: 72 })}</span>`;
  }
}

export function openItemModal(item) {
  const dialog = mountItemModal();
  const media = dialog.querySelector("#modalMedia");
  const thumbs = dialog.querySelector("#modalThumbs");
  const images = item.images || [];

  setModalImage(media, images[0], item.name, item.icon);

  if (images.length > 1) {
    thumbs.style.display = "flex";
    thumbs.innerHTML = images
      .map(
        (src, i) =>
          `<button type="button" class="thumb-btn${i === 0 ? " active" : ""}" data-i="${i}" aria-label="Slika ${i + 1}"><img src="${escapeHTML(src)}" alt="" loading="lazy"></button>`
      )
      .join("");
    thumbs.querySelectorAll(".thumb-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        thumbs.querySelectorAll(".thumb-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        setModalImage(media, images[Number(btn.dataset.i)], item.name, item.icon);
      });
    });
  } else {
    thumbs.style.display = "none";
    thumbs.innerHTML = "";
  }

  dialog.querySelector("#modalCat").textContent = `${item.category}${item.brand ? " · " + item.brand : ""}`;
  dialog.querySelector("#modalName").textContent = item.name;
  dialog.querySelector("#modalDesc").textContent = item.description;
  dialog.querySelector("#modalPrice").textContent = formatPrice(item);
  dialog.showModal();
}

export function bindItemModalTriggers(container, items) {
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".js-view-item");
    if (!btn) return;
    const item = items.find((i) => i.id === btn.dataset.id);
    if (item) openItemModal(item);
  });
}
