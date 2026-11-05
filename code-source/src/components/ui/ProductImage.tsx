import type { Product } from '../../types';
import { ProductArt } from './ProductArt';
import { accentOf } from '../../utils/product';
import { loc } from '../../utils';
import { useApp } from '../../context/AppContext';

/** Vraie photo si le produit en a, sinon illustration de remplacement. */
export function ProductImage({ p, view = 0 }: { p: Product; view?: number }) {
  const { lang } = useApp();
  const ph = p.photos && p.photos.length ? p.photos : null;
  if (ph) {
    return <img src={ph[view] ?? ph[0]} alt={view === 0 ? loc(p.name, lang) : `${loc(p.name, lang)} ${view + 1}`} loading="lazy" decoding="async" />;
  }
  const kinds = p.images;
  return <ProductArt kind={kinds[view] ?? kinds[0]} accent={accentOf(p)} view={Math.min(view, 4) as 0 | 1 | 2 | 3 | 4} />;
}
