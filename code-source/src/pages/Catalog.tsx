import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categoryOrder, collections, productTypes, products, skinTypes } from '../data/products';
import type { CategoryId, CollectionId, ProductType, SkinType } from '../types';
import { Breadcrumb, EmptyState, useSeo } from '../components/ui/Bits';
import { ProductGrid } from '../components/product/ProductCard';
import { Page } from '../components/layout/Layout';
import { loc, minPrice } from '../utils';
import type { TKey } from '../locales';
import { guides } from '../data/guides';

type Sort = 'popular' | 'new' | 'price_asc' | 'price_desc';
const PAGE = 6;
const computeMax = () => Math.max(1000, Math.ceil(Math.max(0, ...products.map((p) => minPrice(p) ?? 0)) / 500) * 500);

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

interface Props {
  mode: 'all' | 'face' | 'category' | 'collection';
  id?: string;
}

export function Catalog({ mode, id }: Props) {
  const { t, lang } = useApp();
  const collection = mode === 'collection' ? collections.find((c) => c.id === (id as CollectionId)) : undefined;
  const preset = mode === 'category' ? (id as CategoryId) : collection?.category;

  const [needs, setNeeds] = useState<CategoryId[]>(preset ? [preset] : []);
  const [skins, setSkins] = useState<SkinType[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);
  const MAX_PRICE = computeMax();
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<Sort>('popular');
  const [shown, setShown] = useState(PAGE);
  const [panel, setPanel] = useState(false);

  const base = useMemo(() => {
    if (mode === 'face') return products.filter((p) => p.category !== 'cheveux');
    if (mode === 'collection') return products.filter((p) => p.collection === id);
    return products;
  }, [mode, id]);

  const list = useMemo(() => {
    let r = base.filter((p) => {
      if (needs.length && !needs.includes(p.category)) return false;
      if (skins.length && !(p.skinTypes && skins.some((s) => p.skinTypes!.includes(s)))) return false;
      if (types.length && !types.includes(p.type)) return false;
      const price = minPrice(p);
      if (price !== null && price > maxPrice) return false;
      if (inStock && p.stockStatus !== 'in_stock') return false;
      return true;
    });
    r = [...r].sort((a, b) => {
      if (sort === 'popular') return b.popularity - a.popularity;
      if (sort === 'new') return Number(b.isNew) - Number(a.isNew) || b.popularity - a.popularity;
      const pa = minPrice(a) ?? 0, pb = minPrice(b) ?? 0;
      return sort === 'price_asc' ? pa - pb : pb - pa;
    });
    return r;
  }, [base, needs, skins, types, maxPrice, inStock, sort]);

  const reset = () => {
    setNeeds(preset ? [preset] : []);
    setSkins([]);
    setTypes([]);
    setMaxPrice(MAX_PRICE);
    setInStock(false);
    setShown(PAGE);
  };

  const title = collection ? collection.name : mode === 'face' ? t('nav.face') : mode === 'category' ? t(`nav.${id}` as TKey) : t('cat.title');
  const intro = collection ? loc(collection.intro, lang) : mode === 'category' ? t('cat.seo.cat', { c: title }) : t('cat.seo');
  useSeo({ title: `${title} | NALGÉ`, description: intro, jsonLd: breadcrumbLd(title) });

  const crumbs: { label: string; to?: string }[] = mode === 'all' ? [{ label: title }] : [{ label: t('common.catalog'), to: 'catalogue' }, { label: title }];

  const visible = list.slice(0, shown);
  const guideCat = preset;

  const Check = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <label className="check"><input type="checkbox" checked={checked} onChange={() => { onChange(); setShown(PAGE); }} /> <span>{label}</span></label>
  );

  return (
    <Page>
      <Breadcrumb items={crumbs} />
      <header className="cat-head">
        {collection && <p className="eyebrow">{t('coll.title')}</p>}
        <h1>{title}</h1>
        <p className="lead">{intro}</p>
        {collection && <p className="muted small">{t('coll.disclaimer')}</p>}
      </header>

      <div className="cat-bar">
        <p role="status" aria-live="polite"><strong>{t('cat.count', { n: list.length })}</strong></p>
        <button type="button" className="btn btn-ghost only-mobile" onClick={() => setPanel((s) => !s)} aria-expanded={panel} aria-controls="filters">
          <SlidersHorizontal size={16} aria-hidden /> {t('cat.filters')}
        </button>
        <div className="sort">
          <label htmlFor="sort">{t('cat.sort')}</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            {(['popular', 'new', 'price_asc', 'price_desc'] as Sort[]).map((s) => <option key={s} value={s}>{t(`sort.${s}` as TKey)}</option>)}
          </select>
        </div>
      </div>

      <div className="cat-layout">
        <aside id="filters" className={`filters ${panel ? 'is-open' : ''}`} aria-label={t('cat.filters')}>
          {mode !== 'collection' && mode !== 'category' && (
            <fieldset>
              <legend>{t('cat.need')}</legend>
              {categoryOrder.map((c) => <Check key={c} checked={needs.includes(c)} onChange={() => setNeeds(toggle(needs, c))} label={t(`nav.${c}` as TKey)} />)}
            </fieldset>
          )}
          <fieldset>
            <legend>{t('cat.skin')}</legend>
            {skinTypes.map((s) => <Check key={s} checked={skins.includes(s)} onChange={() => setSkins(toggle(skins, s))} label={t(`skin.${s}` as TKey)} />)}
          </fieldset>
          <fieldset>
            <legend>{t('cat.type')}</legend>
            {productTypes.map((x) => <Check key={x} checked={types.includes(x)} onChange={() => setTypes(toggle(types, x))} label={t(`type.${x}` as TKey)} />)}
          </fieldset>
          <fieldset>
            <legend>{t('cat.price')}</legend>
            <input type="range" min={1000} max={MAX_PRICE} step={100} value={maxPrice} onChange={(e) => { setMaxPrice(Number(e.target.value)); setShown(PAGE); }} aria-label={t('cat.price')} />
            <p className="small muted">≤ {new Intl.NumberFormat('fr-FR').format(maxPrice)} {t('common.currency')}</p>
          </fieldset>
          <fieldset>
            <legend>{t('cat.avail')}</legend>
            <Check checked={inStock} onChange={() => setInStock(!inStock)} label={t('cat.instock')} />
          </fieldset>
          <button type="button" className="btn btn-ghost btn-block" onClick={reset}>{t('cat.reset')}</button>
        </aside>

        <div>
          {list.length === 0 ? (
            <EmptyState title={t('cat.empty')} action={<button className="btn" type="button" onClick={reset}>{t('cat.empty.cta')}</button>} />
          ) : (
            <>
              <ProductGrid items={visible} />
              <div className="load-more">
                <p className="muted small">{t('cat.shown', { a: visible.length, b: list.length })}</p>
                {shown < list.length && <button type="button" className="btn btn-ghost" onClick={() => setShown(shown + PAGE)}>{t('cat.more')}</button>}
              </div>
            </>
          )}
        </div>
      </div>
      {guideCat && (
        <section className="guide" aria-labelledby="guide-t">
          <h2 id="guide-t">{t('guide.title')}</h2>
          {guides[guideCat].map((g, i) => (<details key={i} className="acc" open={i === 0}><summary>{loc(g.q, lang)}</summary><p>{loc(g.a, lang)}</p></details>))}
        </section>
      )}
    </Page>
  );
}

function breadcrumbLd(title: string) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NALGÉ' }, { '@type': 'ListItem', position: 2, name: title }] };
}
