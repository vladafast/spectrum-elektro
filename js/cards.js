// ===================================================================
// Zajedničke HTML "kartice" za proizvode i usluge — koriste ih
// index.html, prodavnica.html i servis.html.
// ===================================================================
import { icon } from "./icons.js";
import { formatPrice } from "./store.js";

export function productCardHTML(item) {
  const conditionClass = item.condition === "Polovno" ? "used" : "new";
  return `
  <article class="product-card" data-id="${item.id}">
    <div class="product-media">
      ${item.brand ? `<span class="badge badge-brand">${item.brand}</span>` : ""}
      <span class="badge badge-condition ${conditionClass}">${item.condition || "Novo"}</span>
      ${item.image ? `<img src="${item.image}" alt="${item.name}" loading="lazy">` : `<span class="icon">${icon(item.icon, { size: 64 })}</span>`}
      ${!item.stock ? `<div class="badge-out">Nema na stanju</div>` : ""}
    </div>
    <div class="product-body">
      <span class="cat">${item.category}</span>
      <h3>${item.name}</h3>
      <p class="desc">${item.description}</p>
      <div class="price-row">
        <div class="price-wrap">
          ${item.oldPrice ? `<span class="price-old">${Number(item.oldPrice).toLocaleString("sr-RS")} RSD</span>` : ""}
          <span class="price">${formatPrice(item)}</span>
        </div>
        <button type="button" class="btn btn-outline btn-sm js-view-item" data-id="${item.id}">Detalji</button>
      </div>
    </div>
  </article>`;
}

export function serviceCardHTML(item) {
  return `
  <article class="service-card glass">
    <div class="icon-wrap">${item.image ? `<img src="${item.image}" alt="${item.name}" loading="lazy">` : icon(item.icon, { size: 24 })}</div>
    <span class="cat">${item.category}</span>
    <h3>${item.name}</h3>
    <p class="desc">${item.description}</p>
    <div class="price-row">
      <span class="price">${formatPrice(item)}</span>
    </div>
  </article>`;
}

export function emptyStateHTML(message = "Nema rezultata za izabrane filtere.") {
  return `
  <div class="empty-state">
    <span class="icon">${icon("search", { size: 40 })}</span>
    <p>${message}</p>
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

export function openItemModal(item) {
  const dialog = mountItemModal();
  dialog.querySelector("#modalMedia").innerHTML = item.image
    ? `<img src="${item.image}" alt="${item.name}">`
    : `<span class="icon">${icon(item.icon, { size: 72 })}</span>`;
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
