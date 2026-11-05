/**
 * Configuration commerciale de NALGÉ.
 * Tout ce qui dépend du commerçant est ici. Les valeurs `null` signifient « non renseigné » :
 * le site affiche alors un état vide explicite au lieu d'inventer une information.
 */
export const config = {
  brand: 'NALGÉ',
  currency: 'DZD',
  defaultLang: 'fr' as 'fr' | 'ar',

  /** true tant que les produits et textes sont des exemples. Affiche un bandeau de démonstration. */
  demoMode: true,

  /** Barre d'annonce. Mettre null pour la masquer. Rien n'est affiché si le texte est null. */
  announcement: {
    fr: 'Site de démonstration : produits, prix et contenus sont des exemples.',
    ar: 'موقع تجريبي: المنتجات والأسعار والمحتوى مجرد أمثلة.',
  } as { fr: string; ar: string } | null,

  /** Livraison : à renseigner par le commerçant (ne rien inventer). */
  delivery: {
    coverage: null as { fr: string; ar: string } | null, // ex. « 58 wilayas »
    delay: null as { fr: string; ar: string } | null, // ex. « 24 à 72 h »
    fees: null as { fr: string; ar: string } | null,
    returns: null as { fr: string; ar: string } | null,
    freeShippingFrom: null as number | null,
  },

  /** Commande par téléphone / WhatsApp. Numéro au format international sans « + », ex. « 213555000000 ». */
  contact: {
    phone: null as string | null,
    whatsapp: null as string | null,
    email: null as string | null,
    address: null as string | null,
  },
  /** Canaux de réception des commandes. Activés seulement si le numéro / l'adresse correspondant est renseigné ci-dessus. */
  orderByWhatsapp: true,
  orderByEmail: true,

  /** URL de l'API (Shopify, WooCommerce, backend maison). null = mode local de démonstration. */
  apiBaseUrl: null as string | null,

  /** Réseaux sociaux : null = lien masqué. */
  social: { facebook: null as string | null, instagram: null as string | null, tiktok: null as string | null },

  /** Domaine public, utilisé pour sitemap / Open Graph une fois déployé. */
  siteUrl: null as string | null,
};

export const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M\'Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet','El M\'Ghair','El Meniaa',
];
