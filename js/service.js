import { getItems } from "./store.js";
import { serviceCardHTML, emptyStateHTML, bindImageFallbacks } from "./cards.js";

let items = [];
try {
  items = await getItems();
} catch (err) {
  console.error("Ne mogu da učitam usluge.", err);
}

const services = items.filter((i) => i.type === "servis");
const grid = document.getElementById("serviceGrid");

if (grid) {
  grid.innerHTML = services.length ? services.map(serviceCardHTML).join("") : emptyStateHTML("Trenutno nema definisanih usluga.");
  bindImageFallbacks(grid);
}
