// ===================================================================
// Admin panel — prijava (Supabase Auth) + CRUD upravljanje proizvodima
// i uslugama preko Supabase-a (vidi js/store.js).
// ===================================================================
import { icon } from "./icons.js";
import {
  getItems,
  addItem,
  updateItem,
  deleteItem,
  resetItems,
  formatPrice,
  login,
  logout,
  checkSession,
  uploadImage,
  deleteImage,
  getSocialLinks,
  updateSocialLink,
} from "./store.js";
import { escapeHTML } from "./utils.js";

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
const loginPasswordInput = document.getElementById("loginPassword");

// ---- Zaključavanje prijave posle 3 pogrešna pokušaja ----
// Napomena: ovo je zaštita na nivou pregledača (localStorage) — odvraća
// slučajno/ponovljeno pogađanje lozinke sa istog telefona/računara, ali
// napadač koji obriše localStorage ili koristi drugi uređaj je zaobilazi.
// Stvarna zaštita od "brute force" napada dolazi od Supabase Auth-a, koji
// već sam po sebi ograničava broj pokušaja prijave na nivou servera.
const LOGIN_LOCK_KEY = "spectrum_admin_login_lock";
const MAX_LOGIN_ATTEMPTS = 3;
const LOGIN_LOCKOUT_MS = 12 * 60 * 60 * 1000; // 12h

function getLoginLockState() {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_LOCK_KEY)) || { attempts: 0, lockedUntil: 0 };
  } catch {
    return { attempts: 0, lockedUntil: 0 };
  }
}
function setLoginLockState(state) {
  try {
    localStorage.setItem(LOGIN_LOCK_KEY, JSON.stringify(state));
  } catch {
    // privatni mod / localStorage nedostupan — zaključavanje jednostavno neće trajati kroz osveženje
  }
}
function formatLockRemaining(ms) {
  const h = Math.ceil(ms / (60 * 60 * 1000));
  return h <= 1 ? "manje od sat vremena" : `oko ${h}h`;
}
function applyLoginLockUI() {
  const state = getLoginLockState();
  const locked = state.lockedUntil > Date.now();
  loginPasswordInput.disabled = locked;
  loginForm.querySelector('button[type="submit"]').disabled = locked;
  if (locked) {
    loginError.textContent = `Previše pogrešnih pokušaja. Pokušajte ponovo za ${formatLockRemaining(state.lockedUntil - Date.now())}.`;
    loginError.classList.add("show");
  }
  return locked;
}
function registerFailedLoginAttempt() {
  const state = getLoginLockState();
  state.attempts = (state.attempts || 0) + 1;
  if (state.attempts >= MAX_LOGIN_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOGIN_LOCKOUT_MS;
    state.attempts = 0;
  }
  setLoginLockState(state);
  return state.lockedUntil > Date.now();
}
function clearLoginAttempts() {
  setLoginLockState({ attempts: 0, lockedUntil: 0 });
}

// ---- Automatska odjava posle neaktivnosti ----
// 30 minuta neaktivnosti (miš/tastatura/dodir) — standardna vrednost za
// admin panele; kraće od 2h da bi zaboravljena/otvorena sesija na telefonu
// ili deljenom računaru brže prestala da bude bezbednosni rizik. Tajmer se
// resetuje na svaku interakciju dok je admin ulogovan.
const IDLE_LOGOUT_MS = 30 * 60 * 1000;
let idleTimer = null;
async function handleIdleLogout() {
  try {
    await logout();
  } catch {
    // ignorišemo
  }
  showLogin();
  loginError.textContent = "Odjavljeni ste zbog neaktivnosti.";
  loginError.classList.add("show");
}
function resetIdleTimer() {
  clearTimeout(idleTimer);
  if (adminShell.classList.contains("active")) {
    idleTimer = setTimeout(handleIdleLogout, IDLE_LOGOUT_MS);
  }
}
["mousemove", "mousedown", "keydown", "touchstart", "scroll"].forEach((ev) =>
  document.addEventListener(ev, resetIdleTimer, { passive: true })
);

async function showAdmin() {
  loginScreen.style.display = "none";
  adminShell.classList.add("active");
  resetIdleTimer();
  await Promise.all([refreshAll(), loadSocialLinks()]);
}

function showLogin() {
  adminShell.classList.remove("active");
  loginScreen.style.display = "grid";
  clearTimeout(idleTimer);
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (applyLoginLockUI()) return;
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const value = document.getElementById("loginPassword").value;
  submitBtn.disabled = true;
  try {
    await login(value);
    clearLoginAttempts();
    loginError.classList.remove("show");
    loginForm.reset();
    await showAdmin();
    submitBtn.disabled = false;
  } catch (err) {
    // Samo stvarno pogrešna lozinka se broji u zaključavanje — mrežne/server
    // greške ne treba da zaključaju admina napolje.
    const isWrongPassword = err.message === "Pogrešna lozinka.";
    const locked = isWrongPassword && registerFailedLoginAttempt();
    if (locked) {
      applyLoginLockUI();
    } else {
      loginError.textContent = err.message || "Pogrešna lozinka.";
      loginError.classList.add("show");
      submitBtn.disabled = false;
    }
  }
});

applyLoginLockUI();

logoutBtn.addEventListener("click", async () => {
  try {
    await logout();
  } catch {
    // ignorišemo — u svakom slučaju vraćamo na ekran za prijavu
  }
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

/* ---------------- Društvene mreže ---------------- */
const socialForm = document.getElementById("socialForm");
const SOCIAL_FIELDS = [
  ["instagram", "socialInstagram"],
  ["facebook", "socialFacebook"],
  ["x", "socialX"],
  ["reddit", "socialReddit"],
];

async function loadSocialLinks() {
  try {
    const links = await getSocialLinks();
    SOCIAL_FIELDS.forEach(([platform, fieldId]) => {
      document.getElementById(fieldId).value = links[platform] || "";
    });
  } catch (err) {
    showToast(err.message || "Ne mogu da učitam društvene mreže.");
  }
}

socialForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const submitBtn = socialForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    await Promise.all(
      SOCIAL_FIELDS.map(([platform, fieldId]) => updateSocialLink(platform, document.getElementById(fieldId).value.trim()))
    );
    showToast("Linkovi su sačuvani.");
  } catch (err) {
    showToast(err.message || "Čuvanje linkova nije uspelo.");
  }
  submitBtn.disabled = false;
});

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
const imagesInput = document.getElementById("fieldImages");
const imageGrid = document.getElementById("imageGrid");
const imageUploadStatus = document.getElementById("imageUploadStatus");
const addImagesBtn = document.getElementById("addImagesBtn");

iconSelect.innerHTML = ICON_OPTIONS.map(([val, label]) => `<option value="${val}">${label}</option>`).join("");

let currentType = "prodaja";
let editingId = null;
let currentImages = [];
let removedImages = [];
let currentItems = [];
// Slike otpremljene u OVOJ (još nesačuvanoj) izmeni — ako se izmena otkaže
// ili se pređe na drugu stavku pre čuvanja, ove treba obrisati iz Storage-a
// da ne ostanu kao siročad. Brišu se iz praćenja (bez brisanja fajla) tek
// kad se forma uspešno sačuva, jer su tada trajno vezane za stavku.
let uploadedThisSession = [];
// Sprečava prebacivanje na drugu stavku/otkazivanje dok je otpremanje u toku
// — inače bi se currentImages zamenio ispod otpremanja koje je još u toku i
// nova slika bi tiho završila na pogrešnoj stavci.
let isUploadingImages = false;

/* ---------------- Image upload ---------------- */
// Max dimenzija/kvalitet koji se čuva u Supabase Storage-u — dovoljno veliko
// za oštar prikaz na svim ekranima (uključujući retina telefone), a i dalje
// razumna veličina fajla za brzo učitavanje na mobilnom internetu.
const MAX_IMAGE_DIM = 1600;
const IMAGE_QUALITY = 0.86;

// createImageBitmap sa imageOrientation:"from-image" ispravno okreće slike
// snimljene telefonom (EXIF orijentacija) — stari pristup (Image + canvas)
// je ignorisao EXIF, pa su portretne fotografije znale da ispadnu rotirane
// ili razvučene nakon smanjivanja. Podržano u svim savremenim pregledačima.
async function resizeImageFile(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error(`„${file.name}” nije slika.`);
  }
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(`„${file.name}” nije moguće obraditi (nepodržan format slike).`);
  }
  const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(`„${file.name}” nije moglo da se obradi.`))),
      "image/jpeg",
      IMAGE_QUALITY
    );
  });
}

function renderImageGrid() {
  imageGrid.innerHTML = currentImages
    .map(
      (url, i) => `
      <div class="image-grid-item${i === 0 ? " cover" : ""}" data-i="${i}">
        <img src="${escapeHTML(url)}" alt="Slika ${i + 1}">
        ${i === 0 ? `<span class="image-cover-badge">Naslovna</span>` : `<button type="button" class="image-make-cover js-make-cover" data-i="${i}" title="Postavi kao naslovnu">${icon("star", { size: 13 })}</button>`}
        <button type="button" class="image-remove js-remove-image" data-i="${i}" aria-label="Ukloni sliku">${icon("close", { size: 13 })}</button>
      </div>`
    )
    .join("");
}

imageGrid.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".js-remove-image");
  const coverBtn = e.target.closest(".js-make-cover");
  if (removeBtn) {
    const i = Number(removeBtn.dataset.i);
    const [removed] = currentImages.splice(i, 1);
    if (removed) removedImages.push(removed);
    renderImageGrid();
  } else if (coverBtn) {
    const i = Number(coverBtn.dataset.i);
    const [chosen] = currentImages.splice(i, 1);
    currentImages.unshift(chosen);
    renderImageGrid();
  }
});

imagesInput.addEventListener("change", async () => {
  const files = [...(imagesInput.files || [])];
  if (!files.length) return;
  addImagesBtn.classList.add("disabled");
  isUploadingImages = true;
  imageUploadStatus.textContent = files.length > 1 ? `Otpremanje ${files.length} slika…` : "Otpremanje slike…";
  await Promise.all(
    files.map(async (file) => {
      try {
        const blob = await resizeImageFile(file);
        const url = await uploadImage(blob);
        currentImages.push(url);
        uploadedThisSession.push(url);
        renderImageGrid();
      } catch (err) {
        showToast(err.message || "Slika nije mogla da se otpremi.");
      }
    })
  );
  imageUploadStatus.textContent = "";
  addImagesBtn.classList.remove("disabled");
  isUploadingImages = false;
  imagesInput.value = "";
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
  currentImages = [];
  removedImages = [];
  uploadedThisSession = [];
  renderImageGrid();
}

// Slike otpremljene u ovoj izmeni koje se nikad ne sačuvaju (otkazano ili
// prelazak na drugu stavku) treba obrisati iz Storage-a — best effort.
function discardUnsavedUploads() {
  uploadedThisSession.forEach((url) => deleteImage(url));
  uploadedThisSession = [];
}

cancelEditBtn.addEventListener("click", () => {
  if (isUploadingImages) {
    showToast("Sačekajte da se otpremanje slika završi.");
    return;
  }
  discardUnsavedUploads();
  resetForm();
});

function fillForm(item) {
  discardUnsavedUploads();
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
  currentImages = [...(item.images || [])];
  removedImages = [];
  renderImageGrid();

  window.scrollTo({ top: document.getElementById("adminPanel").offsetTop - 100, behavior: "smooth" });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isUploadingImages) {
    showToast("Sačekajte da se otpremanje slika završi.");
    return;
  }

  const base = {
    type: currentType,
    name: document.getElementById("fieldName").value.trim(),
    category: document.getElementById("fieldCategory").value.trim(),
    description: document.getElementById("fieldDescription").value.trim(),
    icon: document.getElementById("fieldIcon").value,
    featured: document.getElementById("fieldFeatured").checked,
    images: currentImages,
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

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    if (editingId) {
      await updateItem(editingId, base);
      showToast("Izmene su sačuvane.");
    } else {
      await addItem(base);
      showToast("Stavka je dodata.");
    }
  } catch (err) {
    showToast(err.message || "Čuvanje nije uspelo.");
    submitBtn.disabled = false;
    return;
  }
  submitBtn.disabled = false;

  // Stavka je uspešno sačuvana bez uklonjenih slika — sad ih možemo obrisati
  // iz Storage-a (best effort, ne blokira ništa ako neka od ovoga ne uspe).
  removedImages.forEach((url) => deleteImage(url));

  resetForm();
  await refreshAll();
});

/* ---------------- Table ---------------- */
const tableBody = document.getElementById("adminTableBody");
const tableWrap = document.getElementById("adminTableWrap");
const emptyState = document.getElementById("adminEmpty");
const searchInput = document.getElementById("adminSearch");
const typeFilter = document.getElementById("adminTypeFilter");

function renderTable(items) {
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
      <tr data-id="${escapeHTML(item.id)}">
        <td>
          <div class="row-name">
            <span class="icon-wrap">${item.images?.[0] ? `<img src="${escapeHTML(item.images[0])}" alt="">` : icon(item.icon, { size: 17 })}</span>
            <div>
              <strong>${escapeHTML(item.name)}</strong>
              <span>${escapeHTML(item.category)}${item.brand ? " · " + escapeHTML(item.brand) : ""}</span>
            </div>
          </div>
        </td>
        <td>${item.type === "prodaja" ? "Proizvod" : "Usluga"}</td>
        <td>${escapeHTML(formatPrice(item))}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="row-actions">
            <button type="button" class="js-edit" data-id="${escapeHTML(item.id)}" aria-label="Izmeni">${icon("edit", { size: 15 })}</button>
            <button type="button" class="danger js-delete" data-id="${escapeHTML(item.id)}" aria-label="Obriši">${icon("trash", { size: 15 })}</button>
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
    if (isUploadingImages) {
      showToast("Sačekajte da se otpremanje slika završi.");
      return;
    }
    const item = currentItems.find((i) => i.id === editBtn.dataset.id);
    if (item) fillForm(item);
  }
  if (delBtn) {
    const item = currentItems.find((i) => i.id === delBtn.dataset.id);
    if (!item) return;
    const ok = await askConfirm(`Da li sigurno želite da obrišete „${item.name}“? Ova akcija se ne može poništiti.`);
    if (ok) {
      try {
        await deleteItem(item.id);
        (item.images || []).forEach((url) => deleteImage(url));
        showToast("Stavka je obrisana.");
        await refreshAll();
      } catch (err) {
        showToast(err.message || "Brisanje nije uspelo.");
      }
    }
  }
});

searchInput.addEventListener("input", () => renderTable(currentItems));
typeFilter.addEventListener("change", () => renderTable(currentItems));

/* ---------------- Stats ---------------- */
function renderStats(items) {
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
    try {
      await resetItems();
      resetForm();
      showToast("Podaci su vraćeni na podrazumevane.");
      await refreshAll();
    } catch (err) {
      showToast(err.message || "Resetovanje nije uspelo.");
    }
  }
});

/* ---------------- Datalists for category/brand ---------------- */
function refreshDatalists(items) {
  categoryList.innerHTML = [...new Set(items.map((i) => i.category).filter(Boolean))]
    .map((v) => `<option value="${escapeHTML(v)}"></option>`)
    .join("");
  brandList.innerHTML = [...new Set(items.filter((i) => i.type === "prodaja").map((i) => i.brand).filter(Boolean))]
    .map((v) => `<option value="${escapeHTML(v)}"></option>`)
    .join("");
}

async function refreshAll() {
  try {
    currentItems = await getItems();
  } catch (err) {
    showToast(err.message || "Greška pri učitavanju podataka.");
    currentItems = [];
  }
  renderStats(currentItems);
  renderTable(currentItems);
  refreshDatalists(currentItems);
}

/* ---------------- Init ---------------- */
try {
  const loggedIn = await checkSession();
  if (loggedIn) {
    await showAdmin();
  } else {
    showLogin();
  }
} catch {
  showLogin();
}
