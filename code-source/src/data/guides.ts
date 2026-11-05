import type { CategoryId, L } from '../types';

/** Conseils éditoriaux génériques (sans revendication produit), affichés sous la grille, comme sur les pages catégorie d'une marque établie. */
export const guides: Record<CategoryId, { q: L; a: L }[]> = {
  'anti-taches': [
    { q: { fr: 'Quand appliquer un soin pour le teint ?', ar: 'متى نضع عناية لون البشرة؟' }, a: { fr: 'En général matin et/ou soir sur peau propre, avant la crème. Associez toujours une protection solaire en journée.', ar: 'عادةً صباحًا و/أو مساءً على بشرة نظيفة قبل الكريم. أضف دائمًا واقي شمس نهارًا.' } },
    { q: { fr: 'Comment choisir ?', ar: 'كيف أختار؟' }, a: { fr: 'Un sérum fluide convient aux peaux mixtes à grasses ; une crème au teint plus sec. Introduisez un seul nouveau produit à la fois.', ar: 'السيروم الخفيف للبشرة المختلطة إلى الدهنية، والكريم للبشرة الأجف. أدخل منتجًا جديدًا واحدًا في كل مرة.' } },
  ],
  'anti-age': [
    { q: { fr: 'À partir de quand adopter un soin anti-âge ?', ar: 'متى نبدأ بعناية مقاومة التقدم في السن؟' }, a: { fr: 'Il n\'y a pas d\'âge imposé : la régularité de la routine et la protection solaire comptent davantage.', ar: 'لا يوجد سن محدد: انتظام الروتين والحماية من الشمس أهم.' } },
    { q: { fr: 'Sérum ou crème ?', ar: 'سيروم أم كريم؟' }, a: { fr: 'Le sérum cible, la crème confortable et protège. Ils se complètent : sérum d\'abord, crème ensuite.', ar: 'السيروم يستهدف والكريم يريح ويحمي. يكملان بعضهما: السيروم أولًا ثم الكريم.' } },
  ],
  hydratation: [
    { q: { fr: 'Pourquoi hydrater une peau grasse ?', ar: 'لماذا نرطب البشرة الدهنية؟' }, a: { fr: 'Une peau grasse peut aussi manquer d\'eau. Choisissez une texture légère et non grasse.', ar: 'البشرة الدهنية قد تفتقر إلى الماء أيضًا. اختر قوامًا خفيفًا غير دهني.' } },
    { q: { fr: 'Combien de fois par jour ?', ar: 'كم مرة في اليوم؟' }, a: { fr: 'Matin et soir, après le nettoyage. Adaptez selon le confort de votre peau.', ar: 'صباحًا ومساءً بعد التنظيف. عدّل حسب راحة بشرتك.' } },
  ],
  'anti-imperfections': [
    { q: { fr: 'Comment nettoyer une peau à imperfections ?', ar: 'كيف ننظف البشرة ذات الشوائب؟' }, a: { fr: 'Un nettoyant doux matin et soir, sans frotter. Évitez de percer les boutons.', ar: 'منظف لطيف صباحًا ومساءً دون فرك. تجنب عصر الحبوب.' } },
    { q: { fr: 'Quand consulter ?', ar: 'متى نستشير؟' }, a: { fr: 'En cas d\'acné inflammatoire ou persistante, demandez l\'avis d\'un dermatologue.', ar: 'عند حب الشباب الملتهب أو المستمر، استشر طبيب جلدية.' } },
  ],
  cheveux: [
    { q: { fr: 'À quelle fréquence laver ses cheveux ?', ar: 'كم مرة نغسل الشعر؟' }, a: { fr: 'Selon votre cuir chevelu : tous les jours avec un shampooing doux, ou 2 à 3 fois par semaine.', ar: 'حسب فروة الرأس: يوميًا بشامبو لطيف أو مرتين إلى ثلاث في الأسبوع.' } },
    { q: { fr: 'Chute de cheveux : que faire ?', ar: 'تساقط الشعر: ماذا نفعل؟' }, a: { fr: 'Une chute importante ou soudaine justifie un avis médical avant tout soin.', ar: 'التساقط الكبير أو المفاجئ يستدعي استشارة طبية قبل أي عناية.' } },
  ],
};
