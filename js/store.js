// ===================================================================
// Data sloj — komunicira sa PHP/SQLite bekendom (folder /api) preko
// fetch poziva. Prodavnica/Servis/Početna stranica čitaju odavde, a
// admin panel piše — sve izmene se odmah dele sa svim posetiocima,
// na svim uređajima.
// ===================================================================

const API_BASE = "api";

async function apiFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}/${path}`, {
      credentials: "include",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      ...options,
    });
  } catch (err) {
    throw new Error("Sajt ne može da se poveže sa serverom. Proverite internet konekciju.");
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // prazan odgovor (npr. kod grešaka bez tela) — ignorišemo
  }

  if (!res.ok) {
    throw new Error((data && data.error) || `Greška servera (${res.status}).`);
  }

  return data;
}

export function getItems() {
  return apiFetch("items.php");
}

export async function getItem(id) {
  const items = await getItems();
  return items.find((item) => item.id === id) || null;
}

export function addItem(item) {
  return apiFetch("items.php", { method: "POST", body: JSON.stringify(item) });
}

export function updateItem(id, patch) {
  return apiFetch(`items.php?id=${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
}

export function deleteItem(id) {
  return apiFetch(`items.php?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function resetItems() {
  return apiFetch("reset.php", { method: "POST" });
}

export function login(password) {
  return apiFetch("login.php", { method: "POST", body: JSON.stringify({ password }) });
}

export function logout() {
  return apiFetch("logout.php", { method: "POST" });
}

export async function checkSession() {
  const data = await apiFetch("session.php");
  return !!(data && data.loggedIn);
}

export function formatPrice(item) {
  if (item.priceLabel) return item.priceLabel;
  if (item.type === "servis") {
    if (!item.price) return "Besplatno";
    return `od ${Number(item.price).toLocaleString("sr-RS")} RSD`;
  }
  return `${Number(item.price).toLocaleString("sr-RS")} RSD`;
}
