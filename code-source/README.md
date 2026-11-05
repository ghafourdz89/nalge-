# NALGÉ — boutique en ligne (démonstration)

Site e-commerce React + TypeScript + Vite, en français et en arabe (RTL), inspiré de l'expérience d'une boutique dermocosmétique haut de gamme. Design, textes et visuels sont originaux.

## Lancer
```bash
npm install
npm run dev        # développement : http://localhost:5173
npm run build      # production : dossier dist/ (à déposer sur n'importe quel hébergement statique)
SINGLE_FILE=1 npx vite build --outDir dist-single   # un seul fichier index.html autonome
```

## Où modifier quoi
| Besoin | Fichier |
|---|---|
| Barre d'annonce, livraison, retours, téléphone, WhatsApp, réseaux, mode démo | `src/config.ts` |
| Produits, prix, variantes, INCI, avis, stock | `src/data/products.ts` |
| Collections | `src/data/products.ts` (`collections`) |
| Articles | `src/data/articles.ts` |
| Textes de l'interface FR / AR | `src/locales/fr.ts`, `src/locales/ar.ts` |
| Couleurs, polices, mise en page | `src/styles/global.css` (variables en haut) |
| Appels backend (commande, contact, newsletter) | `src/services/api.ts` |

Routage par hash (`#catalogue`, `#produit-serum-eclat`, `#categorie-anti-age`, `#collection-eclat`…) : aucun réglage serveur nécessaire.

## Images
Les visuels produits sont des illustrations de remplacement (`src/components/ui/ProductArt.tsx`), signalées « Image de remplacement ». Pour utiliser de vraies photos : ajoutez un champ `photos: string[]` aux produits et remplacez `<ProductArt>` dans `ProductCard.tsx` et `pages/Product.tsx`.

## Fonctionnalités terminées
Accueil complet, menu desktop et mobile coulissant, recherche, catalogue avec filtres (besoin, type de peau, catégorie, prix, stock), tri, « charger plus », état vide, fiche produit (galerie + zoom, variantes, quantité, INCI, usage, FAQ, produits liés, récemment consultés, barre d'achat mobile), collections, routines (sélecteur), panier latéral et page panier (quantités, suppression, sous-total, persistance locale), commande de démonstration + confirmation, blog (liste, catégories, sommaire, articles liés), contact, FAQ, livraison/retours, pages légales (modèles), compte (état explicatif), 404, cookies, français/arabe avec RTL, SEO par page (title, description, Open Graph, BreadcrumbList), accessibilité (focus visible, labels, messages d'erreur, `prefers-reduced-motion`).

## À fournir ou connecter avant la mise en ligne
- Vrais produits, prix, photos, listes INCI, avis authentiques (rien n'est inventé : champs `null` = état vide affiché).
- Backend : commandes, comptes clients, contact et newsletter ne sont **pas** transmis tant que `apiBaseUrl` est `null` (mode démo local). Pour Shopify/WooCommerce, adaptez `src/services/api.ts` ; aucune clé secrète ne doit être dans le code client.
- Livraison (zones, délais, frais), retours, coordonnées, WhatsApp : `src/config.ts`.
- Textes légaux à faire valider (CGV, confidentialité, mentions légales) et page « À propos » à rédiger.
- Logo officiel (logotype typographique provisoire dans `Layout.tsx`).
- Domaine : `public/sitemap.xml` et `robots.txt`. Les données structurées Product ne sont publiées que pour des produits non démo (`demo: false`) afin de ne jamais exposer de prix, stocks ou avis inventés.
- Sur un hébergement avec URLs propres (sans `#`), remplacer le routeur par hash par React Router.
