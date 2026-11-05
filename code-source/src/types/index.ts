export type Lang = 'fr' | 'ar';
export type L = { fr: string; ar: string };

export type CategoryId = 'anti-taches' | 'anti-age' | 'hydratation' | 'anti-imperfections' | 'cheveux';
export type CollectionId = 'eclat' | 'anti-age' | 'hydratation' | 'anti-imperfections' | 'hair-care';
export type ProductType = 'serum' | 'creme' | 'nettoyant' | 'contour' | 'masque' | 'capillaire';
export type SkinType = 'normale' | 'seche' | 'mixte' | 'grasse' | 'sensible';
export type ArtKind = 'dropper' | 'jar' | 'tube' | 'pump' | 'spray';

export interface Variant {
  id: string;
  label: string; // ex. "30 ml"
  price: number | null;
  compareAtPrice: number | null;
  stockStatus: 'in_stock' | 'out_of_stock';
}

export interface Product {
  id: string;
  slug: string;
  name: L;
  subtitle: L;
  category: CategoryId;
  type: ProductType;
  collection: CollectionId;
  description: L;
  benefits: L[];
  ingredients: string[] | null; // liste INCI : null tant qu'elle n'est pas fournie
  howToUse: L | null;
  skinTypes: SkinType[] | null; // null tant que non confirmé
  texture: L | null;
  images: ArtKind[]; // emplacements d'images de remplacement
  photos?: string[]; // vraies photos (chemins images/… ou data: en brouillon) ; prioritaires sur images
  price: number | null;
  compareAtPrice: number | null;
  currency: 'DZD';
  variants: Variant[];
  stockStatus: 'in_stock' | 'out_of_stock';
  rating: number | null;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  seoTitle: L;
  seoDescription: L;
  reviews: Review[];
  claims: Claim[];
  demo: boolean; // true = donnée de démonstration
  popularity: number; // pour le tri
}

export interface Review {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  body: string;
  author: string;
  skin?: SkinType;
  date: string; // ISO
  verified: boolean;
}

/** Revendication chiffrée : jamais affichée sans sa méthode / source. */
export interface Claim { text: L; method: L }

export interface Collection {
  id: CollectionId;
  slug: string;
  name: string;
  tagline: L;
  intro: L;
  category: CategoryId;
  accent: string;
}

export interface Article {
  slug: string;
  category: L;
  title: L;
  excerpt: L;
  sections: { heading: L; body: L }[];
  related: string[]; // slugs produits
}

export interface CartLine {
  productId: string;
  variantId: string;
  qty: number;
}

export interface DemoOrder {
  ref: string;
  lines: { name: string; variant: string; qty: number; unit: number }[];
  subtotal: number;
  customer: { name: string; phone: string; wilaya: string; address: string };
  createdAt: string;
}
