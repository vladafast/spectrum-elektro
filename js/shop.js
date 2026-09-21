import { getItems } from "./store.js";
import { productCardHTML, emptyStateHTML, bindItemModalTriggers } from "./cards.js";

let allItems = [];
try {
  allItems = await getItems();
} catch (err) {
  console.error("Ne mogu da učitam proizvode.", err);
}
const products = allItems.filter((i) => i.type === "prodaja");

const grid = document.getElementById("productGrid");
const countEl = document.getElementById("resultsCount");
const categorySel = document.getElementById("filterCategory");
const brandSel = document.getElementById("filterBrand");
const conditionSel = document.getElementById("filterCondition");
const sortSel = document.getElementById("filterSort");
const searchInput = document.getElementById("filterSearch");

function uniqueValues(list, key) {
  return [...new Set(list.map((i) => i[key]).filter(Boolean))].sort();
}

function populateSelect(select, values, label) {
  select.innerHTML =
    `<option value="">${label}</option>` +
    values.map((v) => `<option value="${v}">${v}</option>`).join("");
}

populateSelect(categorySel, uniqueValues(products, "category"), "Sve kategorije");
populateSelect(brandSel, uniqueValues(products, "brand"), "Svi brendovi");

function applyFilters() {
  const cat = categorySel.value;
  const brand = brandSel.value;
  const cond = conditionSel.value;
  const q = searchInput.value.trim().toLowerCase();
  const sort = sortSel.value;

  let result = products.filter((item) => {
    if (cat && item.category !== cat) return false;
    if (brand && item.brand !== brand) return false;
    if (cond && item.condition !== cond) return false;
    if (q && !`${item.name} ${item.brand} ${item.description}`.toLowerCase().includes(q)) return false;
    return true;
  });

  if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
  if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name, "sr"));

  render(result);
}

function render(list) {
  countEl.textContent = `${list.length} ${list.length === 1 ? "proizvod" : "proizvoda"}`;
  grid.innerHTML = list.length ? list.map(productCardHTML).join("") : emptyStateHTML("Nema proizvoda za izabrane filtere. Pokušajte sa drugačijom pretragom.");
  bindItemModalTriggers(grid, allItems);
}

[categorySel, brandSel, conditionSel, sortSel].forEach((el) => el.addEventListener("change", applyFilters));
searchInput.addEventListener("input", applyFilters);

applyFilters();
