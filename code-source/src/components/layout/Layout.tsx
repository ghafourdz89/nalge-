import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Menu, Minus, Plus, Search, ShoppingBag, Trash2, User, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { config } from '../../config';
import { A } from '../ui/Bits';
import { ProductImage } from '../ui/ProductImage';
import { NewsletterForm } from '../forms/Forms';
import { categoryOrder, products } from '../../data/products';
import { formatPrice, loc, searchProducts } from '../../utils';
import type { TKey } from '../../locales';

export function Logo({ light }: { light?: boolean }) {
  const { t } = useApp();
  return (
    <A to="accueil" className={`logo ${light ? 'logo-light' : ''}`} title={t('ph.logo')} aria-label="NALGÉ">
      NALGÉ
    </A>
  );
}

export function Header() {
  const { t, lang, setLang, cartCount, setCartOpen, query, setQuery, go } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, []);
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const nav: { to: string; label: TKey; sub?: { to: string; label: TKey }[] }[] = [
    { to: 'accueil', label: 'nav.home' },
    { to: 'categorie-visage', label: 'nav.face', sub: [{ to: 'categorie-visage', label: 'common.all' }, ...categoryOrder.filter((c) => c !== 'cheveux').map((c) => ({ to: `categorie-${c}`, label: `nav.${c}` as TKey }))] },
    { to: 'categorie-anti-taches', label: 'nav.anti-taches' },
    { to: 'categorie-anti-age', label: 'nav.anti-age' },
    { to: 'categorie-hydratation', label: 'nav.hydratation' },
    { to: 'categorie-anti-imperfections', label: 'nav.anti-imperfections' },
    { to: 'categorie-cheveux', label: 'nav.cheveux' },
    { to: 'routines', label: 'nav.routines' },
    { to: 'a-propos', label: 'nav.about' },
  ];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    go('recherche');
  };

  return (
    <>
      <a href="#contenu" className="skip" onClick={(e) => { e.preventDefault(); document.getElementById('contenu')?.focus(); }}>{t('nav.skip')}</a>
      {config.announcement && <div className="announce" role="note">{loc(config.announcement, lang)}</div>}
      <header className="header">
        <div className="wrap header-row">
          <button type="button" className="icon-btn only-mobile" onClick={() => setMobileOpen(true)} aria-label={t('nav.menu')} aria-expanded={mobileOpen}>
            <Menu size={22} />
          </button>
          <Logo />
          <div className="header-tools">
            <button type="button" className="icon-btn" onClick={() => setSearchOpen((s) => !s)} aria-label={t('nav.search')} aria-expanded={searchOpen}><Search size={20} /></button>
            <button type="button" className="lang-btn" onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')} lang={lang === 'fr' ? 'ar' : 'fr'}>{t('nav.lang')}</button>
            <A to="compte" className="icon-btn hide-mobile" aria-label={t('nav.account')}><User size={20} /></A>
            <button type="button" className="icon-btn cart-btn" onClick={() => setCartOpen(true)} aria-label={`${t('nav.cart')} (${cartCount})`}>
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-count" aria-hidden>{cartCount}</span>}
            </button>
          </div>
        </div>
        {searchOpen && (
          <form className="search-bar wrap" role="search" onSubmit={submitSearch}>
            <label htmlFor="q" className="sr-only">{t('nav.search')}</label>
            <input id="q" ref={searchRef} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('search.placeholder')} />
            <button className="btn" type="submit">{t('nav.search')}</button>
            {query.trim().length >= 2 && (
              <ul className="suggest" aria-label={t('search.suggest')}>
                {searchProducts(products, query, lang).slice(0, 4).map((p) => (
                  <li key={p.id}><A to={`produit-${p.slug}`} onClick={() => setSearchOpen(false)}>{loc(p.name, lang)}</A></li>
                ))}
              </ul>
            )}
          </form>
        )}
        <nav className="main-nav hide-mobile" aria-label="Navigation principale">
          <ul className="wrap">
            {nav.map((n) => (
              <li key={n.to + n.label} className={n.sub ? 'has-sub' : ''}>
                <A to={n.to}>{t(n.label)}</A>
                {n.sub && (
                  <ul className="sub">
                    {n.sub.map((s) => (<li key={s.to}><A to={s.to}>{t(s.label)}</A></li>))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {mobileOpen && <div className="scrim" onClick={() => setMobileOpen(false)} aria-hidden />}
      <aside className={`drawer drawer-nav ${mobileOpen ? 'is-open' : ''}`} aria-hidden={!mobileOpen} aria-label={t('nav.menu')}>
        <div className="drawer-head">
          <Logo />
          <button type="button" className="icon-btn" onClick={() => setMobileOpen(false)} aria-label={t('nav.close')}><X size={22} /></button>
        </div>
        <ul className="drawer-list">
          {nav.filter((n) => n.label !== 'nav.face' || true).map((n) => (
            <li key={n.to + n.label}><A to={n.to} onClick={() => setMobileOpen(false)} tabIndex={mobileOpen ? 0 : -1}>{t(n.label)}</A></li>
          ))}
          <li><A to="blog" tabIndex={mobileOpen ? 0 : -1}>{t('nav.blog')}</A></li>
          <li><A to="compte" tabIndex={mobileOpen ? 0 : -1}>{t('nav.account')}</A></li>
          <li><A to="contact" tabIndex={mobileOpen ? 0 : -1}>{t('contact.title')}</A></li>
        </ul>
      </aside>
    </>
  );
}

export function MiniCart() {
  const { cartOpen, setCartOpen, cart, setQty, removeLine, subtotal, cartCount, lang, t, go } = useApp();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (cartOpen) closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCartOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cartOpen, setCartOpen]);

  return (
    <>
      {cartOpen && <div className="scrim" onClick={() => setCartOpen(false)} aria-hidden />}
      <aside className={`drawer drawer-cart ${cartOpen ? 'is-open' : ''}`} role="dialog" aria-modal="true" aria-label={t('cart.title')} aria-hidden={!cartOpen}>
        <div className="drawer-head">
          <h2>{t('cart.title')} <span className="muted small">{cartCount > 0 ? `(${t('cart.items', { n: cartCount })})` : ''}</span></h2>
          <button ref={closeRef} type="button" className="icon-btn" onClick={() => setCartOpen(false)} aria-label={t('nav.close')}><X size={22} /></button>
        </div>
        {cart.length === 0 ? (
          <div className="drawer-empty">
            <p>{t('cart.empty')}</p>
            <button className="btn" type="button" onClick={() => { setCartOpen(false); go('catalogue'); }}>{t('cart.empty.cta')}</button>
          </div>
        ) : (
          <>
            <ul className="mini-lines">
              {cart.map((l) => <CartLineView key={l.productId + l.variantId} line={l} compact setQty={setQty} removeLine={removeLine} />)}
            </ul>
            <div className="drawer-foot">
              {config.delivery.freeShippingFrom !== null && (
                <div className="free-ship">
                  <p className="small" role="status">{subtotal >= config.delivery.freeShippingFrom ? t('ship.free.ok') : t('ship.free.left', { x: formatPrice(config.delivery.freeShippingFrom - subtotal, lang) ?? '' })}</p>
                  <div className="bar"><span style={{ width: `${Math.min(100, (subtotal / config.delivery.freeShippingFrom) * 100)}%` }} /></div>
                </div>
              )}
              <p className="row between"><strong>{t('cart.subtotal')}</strong><strong>{formatPrice(subtotal, lang)}</strong></p>
              <p className="muted small">{t('cart.shipping_note')}</p>
              <button className="btn btn-block" type="button" onClick={() => { setCartOpen(false); go('commande'); }}>{t('cart.checkout')}</button>
              <button className="btn btn-ghost btn-block" type="button" onClick={() => { setCartOpen(false); go('panier'); }}>{t('cart.view')}</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export function CartLineView({ line, compact, setQty, removeLine }: { line: { productId: string; variantId: string; qty: number }; compact?: boolean; setQty: (p: string, v: string, q: number) => void; removeLine: (p: string, v: string) => void }) {
  const { lang, t } = useApp();
  const p = products.find((x) => x.id === line.productId);
  const v = p?.variants.find((x) => x.id === line.variantId);
  if (!p || !v) return null;
  const unit = v.price ?? 0;
  return (
    <li className={`line ${compact ? 'line-compact' : ''}`}>
      <A to={`produit-${p.slug}`} className="line-img"><ProductImage p={p} /></A>
      <div className="line-info">
        <A to={`produit-${p.slug}`} className="line-name">{loc(p.name, lang)}</A>
        <span className="muted small">{v.label}</span>
        <span className="small">{formatPrice(unit, lang)}</span>
        <div className="qty" role="group" aria-label={t('cart.line', { n: loc(p.name, lang) })}>
          <button type="button" onClick={() => setQty(p.id, v.id, line.qty - 1)} aria-label={t('cart.dec')} disabled={line.qty <= 1}><Minus size={14} /></button>
          <span aria-live="polite">{line.qty}</span>
          <button type="button" onClick={() => setQty(p.id, v.id, line.qty + 1)} aria-label={t('cart.inc')}><Plus size={14} /></button>
        </div>
      </div>
      <div className="line-end">
        <strong>{formatPrice(unit * line.qty, lang)}</strong>
        <button type="button" className="icon-btn" onClick={() => removeLine(p.id, v.id)} aria-label={`${t('cart.remove')} ${loc(p.name, lang)}`}><Trash2 size={16} /></button>
      </div>
    </li>
  );
}

export function Footer() {
  const { t, lang } = useApp();
  const social = Object.entries(config.social).filter(([, url]) => url);
  return (
    <footer className="footer">
      <div className="wrap footer-news">
        <div>
          <h2>{t('nl.title')}</h2>
          <p>{t('nl.text')}</p>
        </div>
        <NewsletterForm />
      </div>
      <div className="wrap footer-cols">
        <div>
          <Logo light />
          <p className="small">{t('foot.tag')}</p>
          <p className="small muted-light">{t('ph.logo')}</p>
        </div>
        <div>
          <h3>{t('foot.shop')}</h3>
          <ul>
            <li><A to="catalogue">{t('common.catalog')}</A></li>
            {categoryOrder.map((c) => <li key={c}><A to={`categorie-${c}`}>{t(`nav.${c}` as TKey)}</A></li>)}
          </ul>
        </div>
        <div>
          <h3>{t('foot.help')}</h3>
          <ul>
            <li><A to="contact">{t('contact.title')}</A></li>
            <li><A to="faq">{t('faq.title')}</A></li>
            <li><A to="livraison-retours">{t('ship.title')}</A></li>
            <li><A to="blog">{t('nav.blog')}</A></li>
            <li><A to="a-propos">{t('nav.about')}</A></li>
          </ul>
        </div>
        <div>
          <h3>{t('foot.legal')}</h3>
          <ul>
            <li><A to="confidentialite">{t('privacy.title')}</A></li>
            <li><A to="cgv">{t('cgv.title')}</A></li>
            <li><A to="mentions-legales">{t('legal.title')}</A></li>
            <li><A to="admin">Administration</A></li>
          </ul>
          {social.length > 0 && (
            <>
              <h3>{t('foot.follow')}</h3>
              <ul>{social.map(([k, url]) => <li key={k}><a href={url as string} rel="noopener noreferrer" target="_blank">{k}</a></li>)}</ul>
            </>
          )}
        </div>
      </div>
      <div className="wrap footer-legal small">
        <span>© {new Date().getFullYear()} {config.brand}. {t('foot.rights')}</span>
        {config.demoMode && <span className="demo-pill">{t('demo.badge')} · {lang === 'ar' ? 'بيانات تجريبية' : 'données de démonstration'}</span>}
      </div>
    </footer>
  );
}

export function CookieBanner() {
  const { cookieChoice, setCookieChoice, t } = useApp();
  if (cookieChoice) return null;
  return (
    <div className="cookie" role="region" aria-label="Cookies">
      <p>{t('cookie.text')} <A to="confidentialite">{t('cookie.more')}</A></p>
      <button className="btn btn-sm" type="button" onClick={() => setCookieChoice('essential')}>{t('cookie.ok')}</button>
    </div>
  );
}

export function Toast() {
  const { toast } = useApp();
  return <div className={`toast ${toast ? 'is-on' : ''}`} role="status" aria-live="polite">{toast}</div>;
}

export function Page({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <main id="contenu" tabIndex={-1} className={wide ? '' : 'page'}>
      {children}
    </main>
  );
}
