import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartLine, Lang, Product } from '../types';
import { config } from '../config';
import { products } from '../data/products';
import { translate, type TKey } from '../locales';
import { safeGet, safeSet, minPrice } from '../utils';

/**
 * Routage par hash simple : #accueil, #catalogue, #categorie-anti-taches, #produit-serum-eclat…
 * (fonctionne sur tout hébergement statique, sans configuration serveur).
 */
export const routeName = () => (window.location.hash.replace(/^#/, '') || 'accueil').toLowerCase();

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
  route: string;
  go: (name: string) => void;
  cart: CartLine[];
  addToCart: (productId: string, variantId: string, qty: number) => void;
  setQty: (productId: string, variantId: string, qty: number) => void;
  removeLine: (productId: string, variantId: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  cartOpen: boolean;
  setCartOpen: (o: boolean) => void;
  query: string;
  setQuery: (q: string) => void;
  recent: string[];
  pushRecent: (slug: string) => void;
  toast: string | null;
  showToast: (m: string) => void;
  cookieChoice: string | null;
  setCookieChoice: (c: string) => void;
}

const AppCtx = createContext<Ctx | null>(null);
export const useApp = () => {
  const c = useContext(AppCtx);
  if (!c) throw new Error('useApp hors provider');
  return c;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const s = safeGet<string>('nalge.lang', config.defaultLang);
    return s === 'ar' ? 'ar' : 'fr';
  });
  const [route, setRoute] = useState(routeName());
  const [cart, setCart] = useState<CartLine[]>(() => safeGet<CartLine[]>('nalge.cart', []));
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>(() => safeGet<string[]>('nalge.recent', []));
  const [toast, setToast] = useState<string | null>(null);
  const [cookieChoice, setCookieChoiceState] = useState<string | null>(() => safeGet<string | null>('nalge.cookie', null));

  useEffect(() => {
    const onHash = () => {
      setRoute(routeName());
      setCartOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    safeSet('nalge.lang', lang);
  }, [lang]);

  useEffect(() => safeSet('nalge.cart', cart), [cart]);
  useEffect(() => safeSet('nalge.recent', recent), [recent]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const t = useCallback((key: TKey, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);
  const go = useCallback((name: string) => {
    if (routeName() === name) window.scrollTo(0, 0);
    window.location.hash = name;
  }, []);

  const addToCart = useCallback((productId: string, variantId: string, qty: number) => {
    setCart((prev) => {
      const i = prev.findIndex((l) => l.productId === productId && l.variantId === variantId);
      if (i >= 0) return prev.map((l, k) => (k === i ? { ...l, qty: Math.min(20, l.qty + qty) } : l));
      return [...prev, { productId, variantId, qty: Math.min(20, qty) }];
    });
  }, []);
  const setQty = useCallback((productId: string, variantId: string, qty: number) => {
    setCart((prev) => prev.map((l) => (l.productId === productId && l.variantId === variantId ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l)));
  }, []);
  const removeLine = useCallback((productId: string, variantId: string) => {
    setCart((prev) => prev.filter((l) => !(l.productId === productId && l.variantId === variantId)));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);

  const { cartCount, subtotal } = useMemo(() => {
    let count = 0;
    let sum = 0;
    for (const l of cart) {
      const p = products.find((x) => x.id === l.productId);
      const v = p?.variants.find((x) => x.id === l.variantId);
      count += l.qty;
      sum += (v?.price ?? (p ? minPrice(p) : 0) ?? 0) * l.qty;
    }
    return { cartCount: count, subtotal: sum };
  }, [cart]);

  const pushRecent = useCallback((slug: string) => {
    setRecent((prev) => [slug, ...prev.filter((s) => s !== slug)].slice(0, 8));
  }, []);

  const value: Ctx = {
    lang, setLang: setLangState, t, route, go, cart, addToCart, setQty, removeLine, clearCart, cartCount, subtotal,
    cartOpen, setCartOpen, query, setQuery, recent, pushRecent, toast, showToast: setToast,
    cookieChoice, setCookieChoice: (c) => { setCookieChoiceState(c); safeSet('nalge.cookie', c); },
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export type { Product };
