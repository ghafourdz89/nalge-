import { collections } from '../data/products';
import type { Product } from '../types';

export const accentOf = (p: Product) => collections.find((c) => c.id === p.collection)?.accent ?? '#8DCFD0';

export function defaultVariant(p: Product) {
  return p.variants.find((v) => v.stockStatus === 'in_stock') ?? p.variants[0];
}
