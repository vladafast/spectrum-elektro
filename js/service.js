import { getItems } from "./store.js";
import { serviceCardHTML, emptyStateHTML } from "./cards.js";

const services = getItems().filter((i) => i.type === "servis");
const grid = document.getElementById("serviceGrid");

if (grid) {
  grid.innerHTML = services.length ? services.map(serviceCardHTML).join("") : emptyStateHTML("Trenutno nema definisanih usluga.");
}
