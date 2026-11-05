import type { Lang, L, Product } from '../types';

export const loc = (l: L, lang: Lang) => l[lang];

export function formatPrice(n: number | null, lang: Lang): string | null {
  if (n === null) return null;
  const num = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);
  return lang === 'ar' ? `${num} د.ج` : `${num} DA`;
}

export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function searchProducts(list: Product[], query: string, lang: Lang): Product[] {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(/\s+/);
  return list.filter((p) => {
    const hay = normalize(
      [p.name.fr, p.name.ar, p.subtitle.fr, p.subtitle.ar, p.description[lang], p.category, p.type, p.collection].join(' ')
    );
    return words.every((w) => hay.includes(w));
  });
}

export function minPrice(p: Product): number | null {
  const prices = p.variants.map((v) => v.price).filter((x): x is number => x !== null);
  return prices.length ? Math.min(...prices) : p.price;
}

export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
}

export function isValidPhoneDZ(s: string): boolean {
  const d = s.replace(/[\s.\-()]/g, '').replace(/^(\+213|00213)/, '0');
  return /^0[5-7]\d{8}$/.test(d) || /^0[2-4]\d{7,8}$/.test(d);
}

export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage indisponible : on continue sans persistance */
  }
}
