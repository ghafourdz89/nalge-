import type { Collection, Product, ArtKind, CategoryId, CollectionId, ProductType, SkinType, L, Variant } from '../types';

/** Produits de DÉMONSTRATION. Ni noms, ni prix, ni formules ne sont confirmés. */

function v(id: string, label: string, price: number, stock: 'in_stock' | 'out_of_stock' = 'in_stock'): Variant {
  return { id, label, price, compareAtPrice: null, stockStatus: stock };
}

interface Seed {
  slug: string;
  name: L;
  subtitle: L;
  category: CategoryId;
  type: ProductType;
  collection: CollectionId;
  desc: L;
  benefits: L[];
  how: L;
  skin: SkinType[];
  texture: L;
  art: ArtKind;
  variants: Variant[];
  flags?: Partial<Pick<Product, 'isFeatured' | 'isNew' | 'isBestseller'>>;
  pop: number;
}

const seeds: Seed[] = [
  {
    slug: 'serum-eclat', category: 'anti-taches', type: 'serum', collection: 'eclat', art: 'dropper', pop: 98,
    name: { fr: 'Sérum Éclat', ar: 'سيروم الإشراقة' },
    subtitle: { fr: 'Sérum unifiant pour le teint', ar: 'سيروم لتوحيد لون البشرة' },
    desc: { fr: 'Un sérum fluide conçu pour accompagner l\'apparence d\'un teint plus uniforme au quotidien. Texte de démonstration à remplacer par la description validée.', ar: 'سيروم خفيف مصمم لمرافقة مظهر بشرة أكثر توحيدًا يوميًا. نص تجريبي يُستبدل بالوصف المعتمد.' },
    benefits: [{ fr: 'Aide à améliorer l\'apparence des taches', ar: 'يساعد على تحسين مظهر البقع' }, { fr: 'Fini frais et non gras', ar: 'ملمس منعش وغير دهني' }],
    how: { fr: 'Appliquer matin et/ou soir sur peau propre, avant la crème.', ar: 'يوضع صباحًا و/أو مساءً على بشرة نظيفة قبل الكريم.' },
    skin: ['normale', 'mixte', 'grasse'], texture: { fr: 'Fluide', ar: 'سائل خفيف' },
    variants: [v('30', '30 ml', 3800), v('50', '50 ml', 5400)], flags: { isFeatured: true, isBestseller: true },
  },
  {
    slug: 'creme-anti-taches', category: 'anti-taches', type: 'creme', collection: 'eclat', art: 'jar', pop: 80,
    name: { fr: 'Crème Unifiante', ar: 'كريم توحيد اللون' },
    subtitle: { fr: 'Soin de jour pour l\'apparence des taches', ar: 'عناية نهارية لمظهر البقع' },
    desc: { fr: 'Crème de jour de démonstration associée à la gamme Éclat. Description définitive à fournir.', ar: 'كريم نهاري تجريبي ضمن مجموعة الإشراقة. الوصف النهائي يُقدَّم لاحقًا.' },
    benefits: [{ fr: 'Hydrate la peau', ar: 'يرطب البشرة' }, { fr: 'Accompagne un teint plus régulier', ar: 'يرافق بشرة أكثر انتظامًا' }],
    how: { fr: 'Appliquer chaque matin sur le visage et le cou.', ar: 'يوضع كل صباح على الوجه والرقبة.' },
    skin: ['normale', 'mixte', 'seche'], texture: { fr: 'Crème légère', ar: 'كريم خفيف' },
    variants: [v('50', '50 ml', 3500)], flags: { isNew: true },
  },
  {
    slug: 'serum-anti-rides', category: 'anti-age', type: 'serum', collection: 'anti-age', art: 'dropper', pop: 92,
    name: { fr: 'Sérum Lissant', ar: 'سيروم التنعيم' },
    subtitle: { fr: 'Sérum ciblant l\'apparence des rides', ar: 'سيروم يستهدف مظهر التجاعيد' },
    desc: { fr: 'Sérum de démonstration pour une routine anti-âge. Aucune performance n\'est revendiquée tant qu\'elle n\'est pas démontrée.', ar: 'سيروم تجريبي لروتين مقاومة علامات التقدم في السن. لا يُدَّعى أي أداء قبل إثباته.' },
    benefits: [{ fr: 'Texture confortable', ar: 'ملمس مريح' }, { fr: 'S\'intègre facilement à la routine', ar: 'يندمج بسهولة في الروتين' }],
    how: { fr: 'Appliquer le soir sur peau propre, puis la crème.', ar: 'يوضع مساءً على بشرة نظيفة ثم الكريم.' },
    skin: ['normale', 'seche', 'mixte'], texture: { fr: 'Gel-sérum', ar: 'جل-سيروم' },
    variants: [v('30', '30 ml', 4600)], flags: { isFeatured: true, isBestseller: true },
  },
  {
    slug: 'creme-nuit-anti-age', category: 'anti-age', type: 'creme', collection: 'anti-age', art: 'jar', pop: 70,
    name: { fr: 'Crème de Nuit', ar: 'كريم الليل' },
    subtitle: { fr: 'Soin nuit confort', ar: 'عناية ليلية مريحة' },
    desc: { fr: 'Crème de nuit de démonstration, texture riche. Description validée à fournir.', ar: 'كريم ليلي تجريبي بقوام غني. الوصف المعتمد يُقدَّم لاحقًا.' },
    benefits: [{ fr: 'Nourrit et apaise la peau', ar: 'يغذي البشرة ويهدئها' }],
    how: { fr: 'Appliquer le soir en massant doucement.', ar: 'يوضع مساءً مع تدليك لطيف.' },
    skin: ['seche', 'normale'], texture: { fr: 'Crème riche', ar: 'كريم غني' },
    variants: [v('50', '50 ml', 4200, 'out_of_stock')],
  },
  {
    slug: 'contour-yeux', category: 'anti-age', type: 'contour', collection: 'anti-age', art: 'tube', pop: 60,
    name: { fr: 'Contour des Yeux', ar: 'عناية محيط العين' },
    subtitle: { fr: 'Soin ciblé pour le regard', ar: 'عناية موجهة للعينين' },
    desc: { fr: 'Soin contour des yeux de démonstration.', ar: 'عناية تجريبية لمحيط العين.' },
    benefits: [{ fr: 'Application facile', ar: 'تطبيق سهل' }],
    how: { fr: 'Tapoter du bout du doigt matin et soir, sans frotter.', ar: 'يُربَّت بطرف الإصبع صباحًا ومساءً دون فرك.' },
    skin: ['normale', 'sensible', 'seche'], texture: { fr: 'Gel-crème', ar: 'جل-كريم' },
    variants: [v('15', '15 ml', 3000)], flags: { isNew: true },
  },
  {
    slug: 'creme-hydratante', category: 'hydratation', type: 'creme', collection: 'hydratation', art: 'jar', pop: 95,
    name: { fr: 'Crème Hydratante', ar: 'كريم مرطب' },
    subtitle: { fr: 'Hydratation quotidienne', ar: 'ترطيب يومي' },
    desc: { fr: 'Crème hydratante de démonstration pour le visage.', ar: 'كريم مرطب تجريبي للوجه.' },
    benefits: [{ fr: 'Confort immédiat', ar: 'راحة فورية' }, { fr: 'Convient au quotidien', ar: 'مناسب للاستخدام اليومي' }],
    how: { fr: 'Appliquer matin et soir sur le visage.', ar: 'يوضع صباحًا ومساءً على الوجه.' },
    skin: ['normale', 'seche', 'mixte', 'sensible'], texture: { fr: 'Crème fondante', ar: 'كريم ذائب' },
    variants: [v('50', '50 ml', 3200), v('100', '100 ml', 5200)], flags: { isFeatured: true, isBestseller: true },
  },
  {
    slug: 'serum-hydratant', category: 'hydratation', type: 'serum', collection: 'hydratation', art: 'pump', pop: 75,
    name: { fr: 'Sérum Hydratant', ar: 'سيروم مرطب' },
    subtitle: { fr: 'Sérum repulpant léger', ar: 'سيروم خفيف للترطيب' },
    desc: { fr: 'Sérum hydratant de démonstration à texture aqueuse.', ar: 'سيروم مرطب تجريبي بقوام مائي.' },
    benefits: [{ fr: 'Texture fraîche', ar: 'ملمس منعش' }],
    how: { fr: 'Appliquer 2 à 3 pressions sur peau propre.', ar: 'ضغطتان إلى ثلاث على بشرة نظيفة.' },
    skin: ['normale', 'seche', 'mixte', 'grasse'], texture: { fr: 'Aqueuse', ar: 'مائي' },
    variants: [v('30', '30 ml', 3600)], flags: { isNew: true },
  },
  {
    slug: 'masque-hydratant', category: 'hydratation', type: 'masque', collection: 'hydratation', art: 'tube', pop: 40,
    name: { fr: 'Masque Confort', ar: 'ماسك الراحة' },
    subtitle: { fr: 'Masque hydratant hebdomadaire', ar: 'ماسك مرطب أسبوعي' },
    desc: { fr: 'Masque de démonstration à utiliser une à deux fois par semaine.', ar: 'ماسك تجريبي يُستعمل مرة إلى مرتين أسبوعيًا.' },
    benefits: [{ fr: 'Moment de détente', ar: 'لحظة استرخاء' }],
    how: { fr: 'Poser en couche épaisse 10 minutes, rincer.', ar: 'يوضع بطبقة سميكة 10 دقائق ثم يُشطف.' },
    skin: ['seche', 'normale', 'sensible'], texture: { fr: 'Crème', ar: 'كريم' },
    variants: [v('75', '75 ml', 2800)],
  },
  {
    slug: 'gel-nettoyant', category: 'anti-imperfections', type: 'nettoyant', collection: 'anti-imperfections', art: 'pump', pop: 85,
    name: { fr: 'Gel Nettoyant Purifiant', ar: 'جل التنظيف' },
    subtitle: { fr: 'Nettoyant quotidien visage', ar: 'منظف يومي للوجه' },
    desc: { fr: 'Gel nettoyant de démonstration pour les peaux mixtes à grasses.', ar: 'جل منظف تجريبي للبشرة المختلطة إلى الدهنية.' },
    benefits: [{ fr: 'Nettoie en douceur', ar: 'ينظف بلطف' }],
    how: { fr: 'Masser sur peau humide, rincer abondamment.', ar: 'يُدلَّك على بشرة رطبة ثم يُشطف جيدًا.' },
    skin: ['mixte', 'grasse'], texture: { fr: 'Gel', ar: 'جل' },
    variants: [v('150', '150 ml', 2400)], flags: { isBestseller: true },
  },
  {
    slug: 'soin-anti-imperfections', category: 'anti-imperfections', type: 'serum', collection: 'anti-imperfections', art: 'dropper', pop: 65,
    name: { fr: 'Soin Ciblé Imperfections', ar: 'عناية موجهة للشوائب' },
    subtitle: { fr: 'Soin pour peaux à imperfections', ar: 'عناية للبشرة ذات الشوائب' },
    desc: { fr: 'Soin de démonstration pour les peaux sujettes aux imperfections. Aucune promesse médicale.', ar: 'عناية تجريبية للبشرة المعرضة للشوائب. دون أي وعود طبية.' },
    benefits: [{ fr: 'Texture non grasse', ar: 'قوام غير دهني' }],
    how: { fr: 'Appliquer le soir sur les zones concernées.', ar: 'يوضع مساءً على المناطق المعنية.' },
    skin: ['grasse', 'mixte'], texture: { fr: 'Fluide', ar: 'سائل خفيف' },
    variants: [v('30', '30 ml', 3300)], flags: { isNew: true },
  },
  {
    slug: 'serum-anti-chute', category: 'cheveux', type: 'capillaire', collection: 'hair-care', art: 'dropper', pop: 90,
    name: { fr: 'Sérum Capillaire Fortifiant', ar: 'سيروم الشعر المقوي' },
    subtitle: { fr: 'Sérum anti-chute (démo)', ar: 'سيروم ضد التساقط (تجريبي)' },
    desc: { fr: 'Sérum capillaire de démonstration. Toute revendication « anti-chute » doit être justifiée avant publication.', ar: 'سيروم شعر تجريبي. يجب تبرير أي ادعاء «ضد التساقط» قبل النشر.' },
    benefits: [{ fr: 'Application ciblée sur le cuir chevelu', ar: 'تطبيق موجه على فروة الرأس' }],
    how: { fr: 'Appliquer sur cuir chevelu propre et masser.', ar: 'يوضع على فروة رأس نظيفة مع التدليك.' },
    skin: ['normale'], texture: { fr: 'Liquide', ar: 'سائل' },
    variants: [v('50', '50 ml', 4400)], flags: { isFeatured: true },
  },
  {
    slug: 'shampooing-doux', category: 'cheveux', type: 'capillaire', collection: 'hair-care', art: 'tube', pop: 55,
    name: { fr: 'Shampooing Doux', ar: 'شامبو لطيف' },
    subtitle: { fr: 'Usage fréquent', ar: 'للاستعمال المتكرر' },
    desc: { fr: 'Shampooing de démonstration pour usage fréquent.', ar: 'شامبو تجريبي للاستعمال المتكرر.' },
    benefits: [{ fr: 'Lavage en douceur', ar: 'غسل لطيف' }],
    how: { fr: 'Appliquer sur cheveux mouillés, masser, rincer.', ar: 'يوضع على شعر مبلل ويُدلَّك ثم يُشطف.' },
    skin: ['normale', 'sensible'], texture: { fr: 'Gel', ar: 'جل' },
    variants: [v('250', '250 ml', 2200)],
  },
];

export const products: Product[] = seeds.map((s) => {
  const first = s.variants[0];
  const inStock = s.variants.some((x) => x.stockStatus === 'in_stock');
  return {
    id: s.slug,
    slug: s.slug,
    name: s.name,
    subtitle: s.subtitle,
    category: s.category,
    type: s.type,
    collection: s.collection,
    description: s.desc,
    benefits: s.benefits,
    ingredients: null,
    howToUse: s.how,
    skinTypes: s.skin,
    texture: s.texture,
    images: [s.art, s.art, s.art, s.art, s.art],
    price: first.price,
    compareAtPrice: null,
    currency: 'DZD',
    variants: s.variants,
    stockStatus: inStock ? 'in_stock' : 'out_of_stock',
    rating: null,
    reviewCount: 0,
    isFeatured: !!s.flags?.isFeatured,
    isNew: !!s.flags?.isNew,
    isBestseller: !!s.flags?.isBestseller,
    seoTitle: { fr: `${s.name.fr} | NALGÉ`, ar: `${s.name.ar} | NALGÉ` },
    seoDescription: s.desc,
    reviews: [],
    claims: [],
    demo: true,
    popularity: s.pop,
  };
});

export const collections: Collection[] = [
  { id: 'eclat', slug: 'eclat', name: 'NALGÉ Éclat', category: 'anti-taches', accent: '#c9a96e',
    tagline: { fr: 'Un teint plus uniforme', ar: 'بشرة أكثر توحيدًا' },
    intro: { fr: 'Des soins du teint pour accompagner l\'apparence des taches. Gamme proposée à titre d\'architecture : à confirmer avant commercialisation.', ar: 'عناية بالبشرة لمرافقة مظهر البقع. مجموعة مقترحة كهيكلة: يجب تأكيدها قبل التسويق.' } },
  { id: 'anti-age', slug: 'anti-age', name: 'NALGÉ Anti-Âge', category: 'anti-age', accent: '#8b7aa8',
    tagline: { fr: 'Des soins pour l\'apparence des rides', ar: 'عناية لمظهر التجاعيد' },
    intro: { fr: 'Des soins ciblant l\'apparence des rides, sans promesse non démontrée. Gamme à confirmer.', ar: 'عناية تستهدف مظهر التجاعيد دون وعود غير مثبتة. المجموعة تحتاج إلى تأكيد.' } },
  { id: 'hydratation', slug: 'hydratation', name: 'NALGÉ Hydratation', category: 'hydratation', accent: '#8DCFD0',
    tagline: { fr: 'Confort et hydratation', ar: 'راحة وترطيب' },
    intro: { fr: 'Des soins pour le confort et l\'hydratation cutanée au quotidien. Gamme à confirmer.', ar: 'عناية لراحة البشرة وترطيبها يوميًا. المجموعة تحتاج إلى تأكيد.' } },
  { id: 'anti-imperfections', slug: 'anti-imperfections', name: 'NALGÉ Anti-Imperfections', category: 'anti-imperfections', accent: '#6fa58f',
    tagline: { fr: 'Des soins pour les peaux concernées', ar: 'عناية للبشرة المعنية' },
    intro: { fr: 'Des soins adaptés aux besoins des peaux sujettes aux imperfections. Gamme à confirmer.', ar: 'عناية مناسبة لاحتياجات البشرة المعرضة للشوائب. المجموعة تحتاج إلى تأكيد.' } },
  { id: 'hair-care', slug: 'hair-care', name: 'NALGÉ Hair Care', category: 'cheveux', accent: '#b98a6a',
    tagline: { fr: 'Soins capillaires', ar: 'العناية بالشعر' },
    intro: { fr: 'Des soins capillaires, dont un sérum anti-chute de démonstration. Gamme à confirmer.', ar: 'عناية بالشعر، منها سيروم ضد التساقط تجريبي. المجموعة تحتاج إلى تأكيد.' } },
];

export const categoryOrder: CategoryId[] = ['anti-taches', 'anti-age', 'hydratation', 'anti-imperfections', 'cheveux'];
export const productTypes: ProductType[] = ['serum', 'creme', 'nettoyant', 'contour', 'masque', 'capillaire'];
export const skinTypes: SkinType[] = ['normale', 'seche', 'mixte', 'grasse', 'sensible'];
