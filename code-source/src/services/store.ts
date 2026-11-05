import { config } from '../config';
import { products as defaultList } from '../data/products';
import type { L, Product } from '../types';

/** Réglages modifiables depuis l'admin (publiés dans reglages.json). */
export interface Settings {
  demoMode: boolean;
  announcement: L | null;
  whatsapp: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  delivery: { coverage: L | null; delay: L | null; fees: L | null; returns: L | null; freeShippingFrom: number | null };
  social: { facebook: string | null; instagram: string | null; tiktok: string | null };
  siteUrl: string | null;
}

export interface Draft { products: Product[]; settings: Settings }

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

export const builtinProducts: Product[] = clone(defaultList);

export const builtinSettings = (): Settings => ({
  demoMode: config.demoMode,
  announcement: config.announcement,
  whatsapp: config.contact.whatsapp,
  email: config.contact.email,
  phone: config.contact.phone,
  address: config.contact.address,
  delivery: clone(config.delivery),
  social: clone(config.social),
  siteUrl: config.siteUrl,
});
const builtinSettingsSnapshot = builtinSettings();

export function applyProducts(list: Product[]) {
  defaultList.splice(0, defaultList.length, ...list);
}
export function applySettings(s: Settings) {
  config.demoMode = s.demoMode;
  config.announcement = s.announcement;
  config.contact.whatsapp = s.whatsapp;
  config.contact.email = s.email;
  config.contact.phone = s.phone;
  config.contact.address = s.address;
  config.delivery = clone(s.delivery);
  config.social = clone(s.social);
  config.siteUrl = s.siteUrl;
}

/* ---------- Brouillon local (IndexedDB, repli mémoire) ---------- */
const DB = 'nalge-admin';
const STORE = 'kv';
let memory: Draft | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    } catch (e) { reject(e); }
  });
}
export async function loadDraft(): Promise<Draft | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const q = db.transaction(STORE).objectStore(STORE).get('draft');
      q.onsuccess = () => resolve((q.result as Draft | undefined) ?? null);
      q.onerror = () => reject(q.error);
    });
  } catch { return memory; }
}
export async function saveDraft(d: Draft): Promise<boolean> {
  memory = d;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(d, 'draft');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch { return false; }
}
export async function discardDraft() {
  memory = null;
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete('draft');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch { /* rien */ }
}

export const isPreview = () => { try { return sessionStorage.getItem('nalge.preview') === '1'; } catch { return false; } };
export const setPreview = (on: boolean) => { try { on ? sessionStorage.setItem('nalge.preview', '1') : sessionStorage.removeItem('nalge.preview'); } catch { /* rien */ } };

async function fetchJson<T>(url: string): Promise<T | null> {
  const ctl = new AbortController();
  const id = window.setTimeout(() => ctl.abort(), 2500);
  try {
    const r = await fetch(url, { signal: ctl.signal, cache: 'no-cache' });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch { return null; } finally { window.clearTimeout(id); }
}

const validProduct = (p: unknown): p is Product => {
  const x = p as Product;
  return !!x && typeof x.slug === 'string' && !!x.name && Array.isArray(x.variants) && x.variants.length > 0;
};

/** Charge les données publiées (produits.json, reglages.json) ou, en aperçu, le brouillon. */
export async function bootData(): Promise<void> {
  if (isPreview()) {
    const d = await loadDraft();
    if (d) { applyProducts(d.products); applySettings(d.settings); return; }
    setPreview(false);
  }
  if (location.protocol === 'file:') return;
  const [prods, sets] = await Promise.all([fetchJson<unknown>('./produits.json'), fetchJson<Partial<Settings>>('./reglages.json')]);
  if (Array.isArray(prods) && prods.every(validProduct)) applyProducts(prods as Product[]);
  if (sets && typeof sets === 'object') applySettings({ ...builtinSettingsSnapshot, ...sets, delivery: { ...builtinSettingsSnapshot.delivery, ...(sets.delivery ?? {}) }, social: { ...builtinSettingsSnapshot.social, ...(sets.social ?? {}) } });
}
