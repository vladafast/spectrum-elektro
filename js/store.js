// ===================================================================
// Data sloj — komunicira sa Supabase (Postgres + Auth) preko supabase-js.
// Prodavnica/Servis/Početna stranica čitaju odavde, a admin panel piše —
// sve izmene se odmah dele sa svim posetiocima, na svim uređajima.
// ===================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SITE_CONFIG, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Admin nalog ima samo jedno polje za lozinku u admin panelu — email je fiksan.
const ADMIN_EMAIL = SITE_CONFIG.adminEmail;

// Slike proizvoda/usluga žive kao fajlovi u ovom Supabase Storage bucket-u
// (ne kao base64 tekst u bazi) — vidi data/migration_multi_images.sql.
export const IMAGE_BUCKET = "product-images";

function rowToItem(row) {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    brand: row.brand,
    category: row.category,
    condition: row.item_condition,
    price: row.price !== null ? Number(row.price) : 0,
    oldPrice: row.old_price !== null ? Number(row.old_price) : null,
    priceLabel: row.price_label,
    description: row.description,
    icon: row.icon,
    images: Array.isArray(row.images) ? row.images : [],
    stock: !!row.stock,
    featured: !!row.featured,
  };
}

function itemToRow(item) {
  const row = {};
  if ("type" in item) row.type = item.type;
  if ("name" in item) row.name = item.name;
  if ("brand" in item) row.brand = item.brand;
  if ("category" in item) row.category = item.category;
  if ("condition" in item) row.item_condition = item.condition;
  if ("price" in item) row.price = Number(item.price) || 0;
  if ("oldPrice" in item) row.old_price = item.oldPrice !== null && item.oldPrice !== undefined ? Number(item.oldPrice) : null;
  if ("priceLabel" in item) row.price_label = item.priceLabel;
  if ("description" in item) row.description = item.description;
  if ("icon" in item) row.icon = item.icon;
  if ("images" in item) row.images = Array.isArray(item.images) ? item.images : [];
  if ("stock" in item) row.stock = !!item.stock;
  if ("featured" in item) row.featured = !!item.featured;
  return row;
}

// ---------------- Slike (Supabase Storage) ----------------
export async function uploadImage(blob) {
  const path = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, blob, {
    contentType: blob.type || "image/jpeg",
    cacheControl: "31536000",
  });
  if (error) friendlyError(error, "Otpremanje slike nije uspelo.");
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function deleteImage(url) {
  try {
    const marker = `/object/public/${IMAGE_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = decodeURIComponent(url.slice(idx + marker.length));
    await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  } catch {
    // best effort — ne blokiramo čuvanje/brisanje stavke zbog ovoga
  }
}

function friendlyError(error, fallback) {
  throw new Error((error && error.message) || fallback);
}

export async function getItems() {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) friendlyError(error, "Sajt ne može da se poveže sa serverom. Proverite internet konekciju.");
  return data.map(rowToItem);
}

export async function getItem(id) {
  const items = await getItems();
  return items.find((item) => item.id === id) || null;
}

export async function addItem(item) {
  const row = { id: crypto.randomUUID(), created_at: Date.now(), ...itemToRow(item) };
  const { data, error } = await supabase.from("items").insert(row).select().single();
  if (error) friendlyError(error, "Greška servera.");
  return rowToItem(data);
}

export async function updateItem(id, patch) {
  const { data, error } = await supabase
    .from("items")
    .update(itemToRow(patch))
    .eq("id", id)
    .select()
    .single();
  if (error) friendlyError(error, "Greška servera.");
  return rowToItem(data);
}

export async function deleteItem(id) {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) friendlyError(error, "Greška servera.");
  return { ok: true };
}

export async function resetItems() {
  const seedItems = await fetch("data/seed.json").then((res) => res.json());
  const { data: existing } = await supabase.from("items").select("images");
  const { error: deleteError } = await supabase.from("items").delete().neq("id", "");
  if (deleteError) friendlyError(deleteError, "Greška servera.");

  // Stare slike su vezane za obrisane stavke — brišemo ih iz Storage-a (best
  // effort) da se ne gomilaju kao siročad, isto kao kod brisanja pojedinačne
  // stavke.
  (existing || []).forEach((row) => (row.images || []).forEach((url) => deleteImage(url)));

  const now = Date.now();
  const rows = seedItems.map((item, i) => ({
    id: item.id || crypto.randomUUID(),
    type: item.type || "prodaja",
    name: item.name || "",
    brand: item.brand ?? null,
    category: item.category || "",
    item_condition: item.condition ?? null,
    price: Number(item.price) || 0,
    old_price: item.oldPrice ?? null,
    price_label: item.priceLabel ?? null,
    description: item.description || "",
    icon: item.icon || "tv",
    images: item.images ?? (item.image ? [item.image] : []),
    stock: item.stock !== false,
    featured: !!item.featured,
    created_at: now - i,
  }));
  const { error: insertError } = await supabase.from("items").insert(rows);
  if (insertError) friendlyError(insertError, "Greška servera.");
  return { ok: true };
}

export async function login(password) {
  const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
  if (error) {
    // Bez statusa (mrežna greška) ili 5xx (server pao) nije pogrešna lozinka
    // — ne treba da se broji u zaključavanje posle 3 pokušaja.
    if (!error.status || error.status >= 500) {
      throw new Error("Sajt ne može da se poveže sa serverom. Proverite internet konekciju.");
    }
    throw new Error("Pogrešna lozinka.");
  }
  return { ok: true };
}

export async function logout() {
  await supabase.auth.signOut();
  return { ok: true };
}

export async function checkSession() {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

// ---------------- Društvene mreže (footer) ----------------
export async function getSocialLinks() {
  const { data, error } = await supabase.from("social_links").select("platform, url");
  if (error) friendlyError(error, "Ne mogu da učitam društvene mreže.");
  const map = {};
  (data || []).forEach((row) => (map[row.platform] = row.url || ""));
  return map;
}

export async function updateSocialLink(platform, url) {
  const { error } = await supabase
    .from("social_links")
    .update({ url: url || null })
    .eq("platform", platform);
  if (error) friendlyError(error, "Čuvanje linka nije uspelo.");
  return { ok: true };
}

export function formatPrice(item) {
  if (item.priceLabel) return item.priceLabel;
  if (item.type === "servis") {
    if (!item.price) return "Besplatno";
    return `od ${Number(item.price).toLocaleString("sr-RS")} RSD`;
  }
  return `${Number(item.price).toLocaleString("sr-RS")} RSD`;
}
