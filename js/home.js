import { getItems } from "./store.js";
import { productCardHTML, serviceCardHTML, bindItemModalTriggers } from "./cards.js";

let items = [];
try {
  items = await getItems();
} catch (err) {
  console.error("Ne mogu da učitam proizvode/usluge.", err);
}

const featuredProducts = items.filter((i) => i.type === "prodaja" && i.featured).slice(0, 4);
const featuredServices = items.filter((i) => i.type === "servis" && i.featured).slice(0, 3);

const productsMount = document.getElementById("featuredProducts");
if (productsMount) {
  productsMount.innerHTML = featuredProducts.map(productCardHTML).join("");
  bindItemModalTriggers(productsMount, items);
}

const servicesMount = document.getElementById("featuredServices");
if (servicesMount) {
  servicesMount.innerHTML = featuredServices.map(serviceCardHTML).join("");
}
