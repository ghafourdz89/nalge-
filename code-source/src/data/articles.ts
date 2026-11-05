import type { Article } from '../types';

/** Articles de DÉMONSTRATION : conseils généraux, sans revendication sur les produits NALGÉ. */
export const articles: Article[] = [
  {
    slug: 'routine-visage-simple',
    category: { fr: 'Routines', ar: 'روتين' },
    title: { fr: 'Une routine visage simple en trois étapes', ar: 'روتين بسيط للوجه في ثلاث خطوات' },
    excerpt: { fr: 'Nettoyer, traiter, hydrater : l\'essentiel pour commencer.', ar: 'تنظيف، علاج، ترطيب: الأساسيات للبدء.' },
    sections: [
      { heading: { fr: 'Nettoyer', ar: 'التنظيف' }, body: { fr: 'Un nettoyage doux matin et soir retire l\'excès de sébum, la poussière et les résidus sans agresser la peau.', ar: 'تنظيف لطيف صباحًا ومساءً يزيل الزيوم الزائدة والغبار والرواسب دون إرهاق البشرة.' } },
      { heading: { fr: 'Traiter', ar: 'العناية المستهدفة' }, body: { fr: 'Un sérum cible un besoin précis (teint, rides, imperfections). Introduisez un seul nouveau produit à la fois.', ar: 'السيروم يستهدف حاجة محددة (اللون، التجاعيد، الشوائب). أدخل منتجًا جديدًا واحدًا في كل مرة.' } },
      { heading: { fr: 'Hydrater', ar: 'الترطيب' }, body: { fr: 'Une crème adaptée à votre type de peau aide à maintenir le confort tout au long de la journée.', ar: 'كريم مناسب لنوع بشرتك يساعد على الحفاظ على الراحة طوال اليوم.' } },
    ],
    related: ['gel-nettoyant', 'serum-eclat', 'creme-hydratante'],
  },
  {
    slug: 'protection-solaire-quotidienne',
    category: { fr: 'Conseils', ar: 'نصائح' },
    title: { fr: 'Pourquoi protéger sa peau du soleil toute l\'année', ar: 'لماذا نحمي البشرة من الشمس طوال السنة' },
    excerpt: { fr: 'Les UV agissent aussi en hiver et par temps couvert.', ar: 'الأشعة فوق البنفسجية تؤثر أيضًا في الشتاء وفي الطقس الغائم.' },
    sections: [
      { heading: { fr: 'Les UV, une exposition quotidienne', ar: 'الأشعة فوق البنفسجية تعرض يومي' }, body: { fr: 'Les rayons UV traversent les nuages. Une protection solaire quotidienne fait partie des gestes recommandés par les dermatologues.', ar: 'تخترق الأشعة فوق البنفسجية الغيوم. الحماية اليومية من الشمس من التوصيات الشائعة لأطباء الجلد.' } },
      { heading: { fr: 'Taches et protection', ar: 'البقع والحماية' }, body: { fr: 'Sans protection solaire, les soins pour le teint voient leur intérêt réduit. Pensez-y dans votre routine.', ar: 'دون حماية من الشمس تقل فائدة عناية توحيد اللون. ضعها ضمن روتينك.' } },
    ],
    related: ['serum-eclat', 'creme-anti-taches'],
  },
  {
    slug: 'prendre-soin-cuir-chevelu',
    category: { fr: 'Cheveux', ar: 'الشعر' },
    title: { fr: 'Prendre soin de son cuir chevelu', ar: 'العناية بفروة الرأس' },
    excerpt: { fr: 'Un cuir chevelu équilibré est la base de cheveux confortables.', ar: 'فروة رأس متوازنة هي أساس شعر مريح.' },
    sections: [
      { heading: { fr: 'Un lavage adapté', ar: 'غسل مناسب' }, body: { fr: 'Choisissez un shampooing doux et massez du bout des doigts, sans frotter avec les ongles.', ar: 'اختر شامبو لطيفًا ودلّك بأطراف الأصابع دون استعمال الأظافر.' } },
      { heading: { fr: 'Consulter si besoin', ar: 'استشر عند الحاجة' }, body: { fr: 'Une chute de cheveux importante ou soudaine justifie un avis médical.', ar: 'تساقط الشعر الكبير أو المفاجئ يستدعي استشارة طبية.' } },
    ],
    related: ['serum-anti-chute', 'shampooing-doux'],
  },
];
