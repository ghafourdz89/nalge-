import { useEffect, useState } from 'react';
import { Check, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { collections, products } from '../data/products';
import { A, Breadcrumb, SectionHead, Stars, useSeo } from '../components/ui/Bits';
import { ProductImage } from '../components/ui/ProductImage';
import { ProductGrid } from '../components/product/ProductCard';
import { Page } from '../components/layout/Layout';
import { defaultVariant } from '../utils/product';
import { formatPrice, loc } from '../utils';
import { config } from '../config';
import type { TKey } from '../locales';
import { NotFound } from './Content';
import { Reviews } from '../components/product/Reviews';
import { Truck, RotateCcw, Gift } from 'lucide-react';

export function ProductPage({ slug }: { slug: string }) {
  const { t, lang, addToCart, showToast, pushRecent, recent, setCartOpen } = useApp();
  const p = products.find((x) => x.slug === slug);
  const [variantId, setVariantId] = useState(p ? defaultVariant(p).id : '');
  const [qty, setQty] = useState(1);
  const [view, setView] = useState(0);
  const [zoom, setZoom] = useState<{ on: boolean; x: number; y: number }>({ on: false, x: 50, y: 50 });
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (p) pushRecent(p.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const title = p ? p.seoTitle[lang] : 'NALGÉ';
  useSeo({
    title,
    description: p ? p.seoDescription[lang] : '',
    jsonLd: p ? productLd(p, lang) : null,
  });
  if (!p) return <NotFound />;

  const variant = p.variants.find((v) => v.id === variantId) ?? p.variants[0];
  const out = variant.stockStatus === 'out_of_stock';
  const collection = collections.find((c) => c.id === p.collection);
  const related = products.filter((x) => x.slug !== p.slug && (x.category === p.category || x.collection === p.collection)).slice(0, 4);
  const recentItems = recent.filter((s) => s !== p.slug).map((s) => products.find((x) => x.slug === s)).filter((x): x is typeof p => !!x).slice(0, 4);

  const add = () => {
    addToCart(p.id, variant.id, qty);
    showToast(`${t('prod.added')} : ${loc(p.name, lang)}`);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
    setCartOpen(true);
  };

  const wa = config.orderByWhatsapp && config.contact.whatsapp
    ? `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(`${loc(p.name, lang)} (${variant.label}) x${qty}`)}`
    : null;

  const delivery = [config.delivery.coverage, config.delivery.delay, config.delivery.fees, config.delivery.returns].filter(Boolean) as { fr: string; ar: string }[];

  return (
    <Page>
      <Breadcrumb items={[{ label: t('common.catalog'), to: 'catalogue' }, { label: t(`nav.${p.category}` as TKey), to: `categorie-${p.category}` }, { label: loc(p.name, lang) }]} />
      <div className="pdp">
        <div className="gallery">
          <div
            className={`gallery-main ${zoom.on ? 'is-zoom' : ''}`}
            onClick={() => setZoom((z) => ({ ...z, on: !z.on }))}
            onMouseMove={(e) => {
              if (!zoom.on) return;
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ on: true, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
            role="button" tabIndex={0} aria-label={t('prod.zoom')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setZoom((z) => ({ ...z, on: !z.on })); } }}
            style={{ ['--zx' as string]: `${zoom.x}%`, ['--zy' as string]: `${zoom.y}%` }}
          >
            <ProductImage p={p} view={view} />
            {!(p.photos && p.photos.length) && <span className="ph-note">{t('prod.ph')}</span>}
          </div>
          <div className="thumbs">
            {Array.from({ length: p.photos && p.photos.length ? p.photos.length : 5 }, (_, i) => i).map((i) => (
              <button key={i} type="button" className={view === i ? 'is-on' : ''} onClick={() => setView(i)} aria-label={`${i + 1}`} aria-pressed={view === i}>
                <ProductImage p={p} view={i} />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info">
          {collection && <p className="eyebrow">{collection.name}</p>}
          <h1>{loc(p.name, lang)}</h1>
          <p className="lead">{loc(p.subtitle, lang)}</p>
          <Stars rating={p.rating} count={p.reviewCount} />
          {p.demo && <p className="demo-note small">{t('demo.notice')}</p>}

          <p className="pdp-price">
            {variant.price !== null ? formatPrice(variant.price, lang) : <span className="muted">{t('prod.price_nc')}</span>}
            {variant.compareAtPrice !== null && <s className="muted"> {formatPrice(variant.compareAtPrice, lang)}</s>}
          </p>

          <fieldset className="variants">
            <legend>{t('prod.size')}</legend>
            <div className="row gap wrap-row">
              {p.variants.map((v) => (
                <label key={v.id} className={`chip ${v.id === variant.id ? 'is-on' : ''} ${v.stockStatus === 'out_of_stock' ? 'is-out' : ''}`}>
                  <input type="radio" name="variant" value={v.id} checked={v.id === variant.id} onChange={() => setVariantId(v.id)} />
                  {v.label}
                </label>
              ))}
            </div>
          </fieldset>

          <p className={`stock ${out ? 'is-out' : 'is-in'}`}>{out ? t('prod.out') : t('prod.in')}</p>

          <div className="row gap wrap-row buy">
            <div className="qty" role="group" aria-label={t('prod.qty')}>
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label={t('cart.dec')} disabled={qty <= 1}><Minus size={14} /></button>
              <span aria-live="polite" aria-label={t('prod.qty')}>{qty}</span>
              <button type="button" onClick={() => setQty(Math.min(20, qty + 1))} aria-label={t('cart.inc')}><Plus size={14} /></button>
            </div>
            <button type="button" className="btn btn-grow" onClick={add} disabled={out}>
              {added ? <Check size={18} aria-hidden /> : <ShoppingBag size={18} aria-hidden />} {added ? t('prod.added') : t('prod.add')}
            </button>
          </div>
          {wa && <a className="btn btn-ghost btn-block" href={wa} target="_blank" rel="noopener noreferrer">{t('prod.order_wa')}</a>}

          {(config.delivery.freeShippingFrom !== null || config.delivery.delay || config.delivery.returns) && (
            <ul className="reassure">
              {config.delivery.delay && <li><Truck size={18} aria-hidden /> {loc(config.delivery.delay, lang)}</li>}
              {config.delivery.freeShippingFrom !== null && <li><Gift size={18} aria-hidden /> {t('ship.free', { x: formatPrice(config.delivery.freeShippingFrom, lang) ?? '' })}</li>}
              {config.delivery.returns && <li><RotateCcw size={18} aria-hidden /> {loc(config.delivery.returns, lang)}</li>}
            </ul>
          )}

          <details className="acc" open>
            <summary>{t('prod.delivery')}</summary>
            {delivery.length ? <ul>{delivery.map((d, i) => <li key={i}>{loc(d, lang)}</li>)}</ul> : <p className="muted">{t('prod.delivery.empty')}</p>}
          </details>
        </div>
      </div>

      <div className="pdp-details">
        <section>
          <h2>{t('prod.desc')}</h2>
          <p>{loc(p.description, lang)}</p>
          {p.texture && <p><strong>{t('prod.texture')} :</strong> {loc(p.texture, lang)}</p>}
          {p.skinTypes && <p><strong>{t('prod.skin')} :</strong> {p.skinTypes.map((s) => t(`skin.${s}` as TKey)).join(', ')}</p>}
        </section>
        <section>
          <h2>{t('prod.benefits')}</h2>
          <ul className="ticks">{p.benefits.map((b, i) => <li key={i}>{loc(b, lang)}</li>)}</ul>
        </section>
        <section>
          <h2>{t('prod.how')}</h2>
          <p>{p.howToUse ? loc(p.howToUse, lang) : '—'}</p>
        </section>
        <section>
          <h2>{t('prod.inci')}</h2>
          {p.ingredients?.length ? <p className="inci" dir="ltr">{p.ingredients.join(', ')}</p> : <p className="muted">{t('prod.inci.empty')}</p>}
        </section>
        <section>
          <h2>{t('prod.reviews')}</h2>
          <Reviews reviews={p.reviews} />
        </section>
        <section>
          <h2>{t('prod.claims')}</h2>
          {p.claims.length ? (
            <ul className="plain">{p.claims.map((c, i) => <li key={i}><strong>{loc(c.text, lang)}</strong><br /><span className="muted small">{t('prod.claim.method')} : {loc(c.method, lang)}</span></li>)}</ul>
          ) : <p className="muted">{t('prod.claims.empty')}</p>}
        </section>
        <section>
          <h2>{t('prod.faq')}</h2>
          {([1, 2, 3, 4, 5, 6] as const).map((i) => (
            <details key={i} className="acc"><summary>{t(`faq.q${i}` as TKey)}</summary><p>{t(`faq.a${i}` as TKey)}</p></details>
          ))}
        </section>
      </div>

      {related.length > 0 && (<section className="section tight"><SectionHead title={t('prod.related')} /><ProductGrid items={related} /></section>)}
      {recentItems.length > 0 && (<section className="section tight"><SectionHead title={t('prod.recent')} /><ProductGrid items={recentItems} /></section>)}

      <div className="sticky-buy only-mobile" aria-hidden={false}>
        <div>
          <strong>{loc(p.name, lang)}</strong>
          <span className="small muted">{variant.price !== null ? formatPrice(variant.price, lang) : t('prod.price_nc')}</span>
        </div>
        <button type="button" className="btn" onClick={add} disabled={out}>{out ? t('prod.out') : t('prod.add')}</button>
      </div>
      <A to="catalogue" className="sr-only">{t('common.catalog')}</A>
    </Page>
  );
}

function productLd(p: (typeof products)[number], lang: 'fr' | 'ar') {
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'NALGÉ' },
      { '@type': 'ListItem', position: 2, name: p.category },
      { '@type': 'ListItem', position: 3, name: p.name[lang] },
    ],
  };
  // Données Product publiées uniquement pour des produits réels (jamais pour la démo : prix/stock/avis non confirmés).
  if (p.demo) return crumbs;
  return [
    crumbs,
    {
      '@context': 'https://schema.org', '@type': 'Product', name: p.name[lang], description: p.description[lang],
      offers: p.price !== null ? { '@type': 'Offer', priceCurrency: p.currency, price: p.price, availability: p.stockStatus === 'in_stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } : undefined,
      ...(p.rating !== null && p.reviewCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviewCount } } : {}),
    },
  ] as unknown as object;
}
