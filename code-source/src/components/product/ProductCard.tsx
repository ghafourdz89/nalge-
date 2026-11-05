import { ShoppingBag } from 'lucide-react';
import type { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { ProductImage } from '../ui/ProductImage';
import { A, Stars } from '../ui/Bits';
import { defaultVariant } from '../../utils/product';
import { collections } from '../../data/products';
import { formatPrice, loc, minPrice } from '../../utils';

export function ProductCard({ p }: { p: Product }) {
  const { lang, t, addToCart, showToast } = useApp();
  const out = p.stockStatus === 'out_of_stock';
  const price = minPrice(p);
  const multi = p.variants.length > 1;
  const onAdd = () => {
    const v = defaultVariant(p);
    addToCart(p.id, v.id, 1);
    showToast(`${t('prod.added')} : ${loc(p.name, lang)}`);
  };
  return (
    <article className="card">
      <A to={`produit-${p.slug}`} className="card-media" aria-label={loc(p.name, lang)}>
        <ProductImage p={p} />
        <span className="badges">
          {p.isNew && <span className="badge b-new">{t('badge.new')}</span>}
          {p.isBestseller && <span className="badge b-best">{t('badge.bestseller')}</span>}
          {p.compareAtPrice !== null && <span className="badge b-offer">{t('badge.offer')}</span>}
          {out && <span className="badge b-out">{t('badge.out')}</span>}
        </span>
      </A>
      <div className="card-body">
        <span className="eyebrow card-range">{collections.find((c) => c.id === p.collection)?.name.replace('NALGÉ ', '')}</span>
        <h3><A to={`produit-${p.slug}`}>{loc(p.name, lang)}</A></h3>
        <p className="muted small">{loc(p.subtitle, lang)}</p>
        <Stars rating={p.rating} count={p.reviewCount} />
        <p className="small muted">{p.variants.map((v) => v.label).join(' · ')}</p>
        <p className="price">
          {price !== null ? (<>{multi && <span className="small muted">{t('common.from')} </span>}{formatPrice(price, lang)}</>) : <span className="muted small">{t('prod.price_nc')}</span>}
          {p.compareAtPrice !== null && <s className="muted small">{formatPrice(p.compareAtPrice, lang)}</s>}
        </p>
        <button type="button" className="btn btn-block" onClick={onAdd} disabled={out}>
          <ShoppingBag size={16} aria-hidden /> {out ? t('prod.out') : t('prod.add')}
        </button>
      </div>
    </article>
  );
}

export function ProductGrid({ items }: { items: Product[] }) {
  return (
    <div className="grid">
      {items.map((p) => (
        <ProductCard key={p.id} p={p} />
      ))}
    </div>
  );
}
