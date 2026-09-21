// ===================================================================
// Admin panel — prijava + CRUD upravljanje proizvodima i uslugama.
//
// BEZBEDNOSNA NAPOMENA: Ova prijava je isključivo demonstrativna i
// radi u pregledaču (nema pravog servera). Lozinka je vidljiva svakom
// ko pogleda izvorni kod. Pre postavljanja sajta na internet i
// davanja pristupa klijentu, admin panel MORA dobiti pravu server
// stranu autentifikaciju (npr. Netlify Identity, Firebase Auth,
// sopstveni backend sa hešovanom lozinkom) — inače bilo ko može da
// izmeni podatke.
// ===================================================================
import { icon } from "./icons.js";
import { getItems, addItem, updateItem, deleteItem, resetItems, formatPrice } from "./store.js";

const ADMIN_PASSWORD = "spectrum2026";
const SESSION_KEY = "spectrum_admin_session";

const ICON_OPTIONS = [
  ["tv", "Televizor"],
  ["tv-old", "Polovni televizor"],
  ["remote", "Daljinski upravljač"],
  ["soundbar", "Soundbar / zvučnik"],
  ["wall-mount", "Zidni nosač"],
  ["screen", "Ekran / panel"],
  ["backlight", "Pozadinsko osvetljenje"],
  ["board", "Elektronika / ploča"],
  ["diagnostic", "Dijagnostika"],
  ["truck", "Dostava / preuzimanje"],
  ["wrench", "Servis / alat"],
  ["cable", "Kabl / adapter"],
  ["package", "Ostalo"],
];

/* ---------------- Login ---------------- */
const loginScreen = document.getElementById("loginScreen");
const adminShell = document.getElementById("adminShell");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

function showAdmin() {
  loginScreen.style.display = "none";
  adminShell.classList.add("active");
  refreshAll();
}

function showLogin() {
  adminShell.classList.remove("active");
  loginScreen.style.display = "grid";
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = document.getElementById("loginPassword").value;
  if (value === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "1");
    loginError.classList.remove("show");
    loginForm.reset();
    showAdmin();
  } else {
    loginError.classList.add("show");
  }
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
});

/* ---------------- Confirm dialog ---------------- */
const confirmDialog = document.getElementById("confirmDialog");
const confirmMessage = document.getElementById("confirmMessage");
const confirmYes = document.getElementById("confirmYes");
const confirmNo = document.getElementById("confirmNo");
let confirmResolver = null;

function askConfirm(message) {
  confirmMessage.textContent = message;
  confirmDialog.showModal();
  return new Promise((resolve) => (confirmResolver = resolve));
}
confirmYes.addEventListener("click", () => {
  confirmDialog.close();
  confirmResolver?.(true);
});
confirmNo.addEventListener("click", () => {
  confirmDialog.close();
  confirmResolver?.(false);
});

/* ---------------- Toast ---------------- */
const toast = document.getElementById("toast");
let toastTimer = null;
function showToast(message) {
  toast.querySelector("span").textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  const duration = message.length > 60 ? 5000 : 2600;
  toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
}

/* ---------------- Form ---------------- */
const form = document.getElementById("itemForm");
const typeButtons = document.querySelectorAll(".type-toggle button");
const proizvodFields = document.getElementById("proizvodFields");
const uslugaFields = document.getElementById("uslugaFields");
const formTitle = document.getElementById("formTitle");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const iconSelect = document.getElementById("fieldIcon");
const categoryList = document.getElementById("categoryOptions");
const brandList = document.getElementById("brandOptions");
const priceGroup = document.getElementById("priceGroup");
const freeCheckbox = document.getElementById("fieldFree");
const imageInput = document.getElementById("fieldImage");
const imagePreview = document.getElementById("imagePreview");
const removeImageBtn = document.getElementById("removeImageBtn");

const IMAGE_PLACEHOLDER_HTML = imagePreview.innerHTML;

iconSelect.innerHTML = ICON_OPTIONS.map(([val, label]) => `<option value="${val}">${label}</option>`).join("");

let currentType = "prodaja";
let editingId = null;
let currentImage = null;

/* ---------------- Image upload ---------------- */
const MAX_IMAGE_DIM = 900;
const IMAGE_QUALITY = 0.78;

function readAndResizeImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Izabrani fajl nije slika."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Slika nije mogla da se učita."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Slika nije mogla da se učita."));
      img.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", IMAGE_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function setPreviewImage(dataUrl) {
  currentImage = dataUrl;
  if (dataUrl) {
    imagePreview.innerHTML = `<img src="${dataUrl}" alt="Pregled slike">`;
    removeImageBtn.style.display = "inline-flex";
  } else {
    imagePreview.innerHTML = IMAGE_PLACEHOLDER_HTML;
    removeImageBtn.style.display = "none";
  }
}

imageInput.addEventListener("change", async () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  try {
    const dataUrl = await readAndResizeImage(file);
    setPreviewImage(dataUrl);
  } catch (err) {
    showToast(err.message || "Slika nije mogla da se učita.");
  } finally {
    imageInput.value = "";
  }
});

removeImageBtn.addEventListener("click", () => {
  setPreviewImage(null);
});

function updatePriceVisibility() {
  const hide = currentType === "servis" && freeCheckbox.checked;
  priceGroup.style.display = hide ? "none" : "flex";
}

freeCheckbox.addEventListener("change", updatePriceVisibility);

typeButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type;
    typeButtons.forEach((b) => b.classList.toggle("active", b === btn));
    proizvodFields.style.display = currentType === "prodaja" ? "block" : "none";
    uslugaFields.style.display = currentType === "servis" ? "block" : "none";
    updatePriceVisibility();
  })
);

function resetForm() {
  form.reset();
  editingId = null;
  formTitle.textContent = "Dodaj novu stavku";
  cancelEditBtn.style.display = "none";
  currentType = "prodaja";
  typeButtons.forEach((b) => b.classList.toggle("active", b.dataset.type === "prodaja"));
  proizvodFields.style.display = "block";
  uslugaFields.style.display = "none";
  updatePriceVisibility();
  setPreviewImage(null);
}

cancelEditBtn.addEventListener("click", resetForm);

function fillForm(item) {
  editingId = item.id;
  formTitle.textContent = "Izmeni stavku";
  cancelEditBtn.style.display = "inline-flex";
  currentType = item.type;
  typeButtons.forEach((b) => b.classList.toggle("active", b.dataset.type === item.type));
  proizvodFields.style.display = item.type === "prodaja" ? "block" : "none";
  uslugaFields.style.display = item.type === "servis" ? "block" : "none";

  document.getElementById("fieldName").value = item.name || "";
  document.getElementById("fieldCategory").value = item.category || "";
  document.getElementById("fieldPrice").value = item.price ?? "";
  document.getElementById("fieldDescription").value = item.description || "";
  document.getElementById("fieldIcon").value = item.icon || "tv";
  document.getElementById("fieldFeatured").checked = !!item.featured;

  document.getElementById("fieldBrand").value = item.brand || "";
  document.getElementById("fieldCondition").value = item.condition || "Novo";
  document.getElementById("fieldOldPrice").value = item.oldPrice ?? "";
  document.getElementById("fieldStock").checked = item.stock !== false;

  document.getElementById("fieldFree").checked = item.priceLabel === "Besplatno";
  updatePriceVisibility();
  setPreviewImage(item.image || null);

  window.scrollTo({ top: document.getElementById("adminPanel").offsetTop - 100, behavior: "smooth" });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const base = {
    type: currentType,
    name: document.getElementById("fieldName").value.trim(),
    category: document.getElementById("fieldCategory").value.trim(),
    description: document.getElementById("fieldDescription").value.trim(),
    icon: document.getElementById("fieldIcon").value,
    featured: document.getElementById("fieldFeatured").checked,
    image: currentImage,
  };

  if (currentType === "prodaja") {
    base.brand = document.getElementById("fieldBrand").value.trim();
    base.condition = document.getElementById("fieldCondition").value;
    base.price = Number(document.getElementById("fieldPrice").value) || 0;
    const oldPriceVal = document.getElementById("fieldOldPrice").value;
    base.oldPrice = oldPriceVal ? Number(oldPriceVal) : null;
    base.stock = document.getElementById("fieldStock").checked;
    base.priceLabel = null;
  } else {
    const isFree = document.getElementById("fieldFree").checked;
    base.price = isFree ? 0 : Number(document.getElementById("fieldPrice").value) || 0;
    base.priceLabel = isFree ? "Besplatno" : null;
  }

  try {
    if (editingId) {
      updateItem(editingId, base);
      showToast("Izmene su sačuvane.");
    } else {
      addItem(base);
      showToast("Stavka je dodata.");
    }
  } catch (err) {
    showToast(err.message || "Čuvanje nije uspelo.");
    return;
  }

  resetForm();
  refreshAll();
});

/* ---------------- Table ---------------- */
const tableBody = document.getElementById("adminTableBody");
const tableWrap = document.getElementById("adminTableWrap");
const emptyState = document.getElementById("adminEmpty");
const searchInput = document.getElementById("adminSearch");
const typeFilter = document.getElementById("adminTypeFilter");

function renderTable() {
  const items = getItems();
  const q = searchInput.value.trim().toLowerCase();
  const typeVal = typeFilter.value;

  const filtered = items.filter((item) => {
    if (typeVal && item.type !== typeVal) return false;
    if (q && !`${item.name} ${item.category} ${item.brand || ""}`.toLowerCase().includes(q)) return false;
    return true;
  });

  if (!filtered.length) {
    tableWrap.style.display = "none";
    emptyState.style.display = "block";
    return;
  }
  tableWrap.style.display = "block";
  emptyState.style.display = "none";

  tableBody.innerHTML = filtered
    .map((item) => {
      const statusBadge =
        item.type === "prodaja"
          ? item.stock
            ? `<span class="badge" style="color:var(--success);border-color:rgba(53,214,138,.35);">Na stanju</span>`
            : `<span class="badge" style="color:var(--danger);border-color:rgba(255,84,112,.35);">Nema na stanju</span>`
          : item.featured
          ? `<span class="badge">Istaknuto</span>`
          : "";
      return `
      <tr data-id="${item.id}">
        <td>
          <div class="row-name">
            <span class="icon-wrap">${item.image ? `<img src="${item.image}" alt="">` : icon(item.icon, { size: 17 })}</span>
            <div>
              <strong>${item.name}</strong>
              <span>${item.category}${item.brand ? " · " + item.brand : ""}</span>
            </div>
          </div>
        </td>
        <td>${item.type === "prodaja" ? "Proizvod" : "Usluga"}</td>
        <td>${formatPrice(item)}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="row-actions">
            <button type="button" class="js-edit" data-id="${item.id}" aria-label="Izmeni">${icon("edit", { size: 15 })}</button>
            <button type="button" class="danger js-delete" data-id="${item.id}" aria-label="Obriši">${icon("trash", { size: 15 })}</button>
          </div>
        </td>
      </tr>`;
    })
    .join("");
}

tableBody.addEventListener("click", async (e) => {
  const editBtn = e.target.closest(".js-edit");
  const delBtn = e.target.closest(".js-delete");
  if (editBtn) {
    const item = getItems().find((i) => i.id === editBtn.dataset.id);
    if (item) fillForm(item);
  }
  if (delBtn) {
    const item = getItems().find((i) => i.id === delBtn.dataset.id);
    if (!item) return;
    const ok = await askConfirm(`Da li sigurno želite da obrišete „${item.name}“? Ova akcija se ne može poništiti.`);
    if (ok) {
      deleteItem(item.id);
      showToast("Stavka je obrisana.");
      refreshAll();
    }
  }
});

searchInput.addEventListener("input", renderTable);
typeFilter.addEventListener("change", renderTable);

/* ---------------- Stats ---------------- */
function renderStats() {
  const items = getItems();
  const products = items.filter((i) => i.type === "prodaja");
  const services = items.filter((i) => i.type === "servis");
  const inStockValue = products.filter((p) => p.stock).reduce((sum, p) => sum + Number(p.price || 0), 0);

  document.getElementById("statProducts").textContent = products.length;
  document.getElementById("statServices").textContent = services.length;
  document.getElementById("statOutOfStock").textContent = products.filter((p) => !p.stock).length;
  document.getElementById("statValue").textContent = `${inStockValue.toLocaleString("sr-RS")} RSD`;
}

/* ---------------- Reset seed ---------------- */
document.getElementById("resetBtn").addEventListener("click", async () => {
  const ok = await askConfirm("Ovo će vratiti SVE proizvode i usluge na podrazumevanu (početnu) listu i obrisati sve vaše izmene. Nastaviti?");
  if (ok) {
    resetItems();
    resetForm();
    showToast("Podaci su vraćeni na podrazumevane.");
    refreshAll();
  }
});

/* ---------------- Datalists for category/brand ---------------- */
function refreshDatalists() {
  const items = getItems();
  categoryList.innerHTML = [...new Set(items.map((i) => i.category).filter(Boolean))]
    .map((v) => `<option value="${v}"></option>`)
    .join("");
  brandList.innerHTML = [...new Set(items.filter((i) => i.type === "prodaja").map((i) => i.brand).filter(Boolean))]
    .map((v) => `<option value="${v}"></option>`)
    .join("");
}

function refreshAll() {
  renderStats();
  renderTable();
  refreshDatalists();
}

/* ---------------- Init ---------------- */
if (isLoggedIn()) showAdmin();
else showLogin();
