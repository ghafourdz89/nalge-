import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { categoryOrder, products } from '../data/products';
import { articles } from '../data/articles';
import { config } from '../config';
import { A, Breadcrumb, EmptyState, useSeo } from '../components/ui/Bits';
import { ProductGrid } from '../components/product/ProductCard';
import { ProductArt } from '../components/ui/ProductArt';
import { ContactForm } from '../components/forms/Forms';
import { Page } from '../components/layout/Layout';
import { loc, searchProducts } from '../utils';
import type { CategoryId, SkinType } from '../types';
import type { TKey } from '../locales';
import { skinTypes } from '../data/products';

export function NotFound() {
  const { t } = useApp();
  useSeo({ title: `${t('notfound.title')} | NALGÉ`, description: t('notfound.text') });
  return (
    <Page>
      <EmptyState title={t('notfound.title')} text={t('notfound.text')} action={<A to="accueil" className="btn">{t('common.home')}</A>} />
    </Page>
  );
}

export function SearchPage() {
  const { t, lang, query, setQuery } = useApp();
  const [draft, setDraft] = useState(query);
  const results = useMemo(() => searchProducts(products, query, lang), [query, lang]);
  useSeo({ title: `${t('search.title')} | NALGÉ`, description: t('search.title') });
  return (
    <Page>
      <Breadcrumb items={[{ label: t('search.title') }]} />
      <h1>{t('search.title')}</h1>
      <form role="search" className="search-inline" onSubmit={(e) => { e.preventDefault(); setQuery(draft); }}>
        <label htmlFor="sq" className="sr-only">{t('search.title')}</label>
        <input id="sq" type="search" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t('search.placeholder')} />
        <button className="btn" type="submit">{t('nav.search')}</button>
      </form>
      {query.trim() === '' ? (
        <p className="muted">{t('search.hint')}</p>
      ) : results.length === 0 ? (
        <EmptyState title={t('search.empty', { q: query })} text={t('search.hint')} />
      ) : (
        <>
          <p role="status" aria-live="polite"><strong>{t('search.results', { n: results.length, q: query })}</strong></p>
          <ProductGrid items={results} />
        </>
      )}
    </Page>
  );
}

export function RoutinesPage() {
  const { t, addToCart, showToast } = useApp();
  const [need, setNeed] = useState<CategoryId>('anti-taches');
  const [skin, setSkin] = useState<SkinType>('normale');
  const [done, setDone] = useState(false);
  useSeo({ title: `${t('routines.title')} | NALGÉ`, description: t('routines.intro') });

  const inStock = (p: (typeof products)[number]) => p.stockStatus === 'in_stock';
  const fits = (p: (typeof products)[number]) => !!p.skinTypes?.includes(skin) && inStock(p);
  const steps: { key: TKey; items: (typeof products)[number][] }[] = need === 'cheveux'
    ? [
        { key: 'routine.step.wash', items: products.filter((p) => p.category === 'cheveux' && p.type === 'capillaire' && p.slug.startsWith('shampooing') && inStock(p)) },
        { key: 'routine.step.scalp', items: products.filter((p) => p.category === 'cheveux' && !p.slug.startsWith('shampooing') && inStock(p)) },
      ]
    : [
        { key: 'routine.step.cleanse', items: products.filter((p) => p.type === 'nettoyant' && fits(p)).slice(0, 1) },
        { key: 'routine.step.treat', items: products.filter((p) => p.category === need && p.type === 'serum' && fits(p)).slice(0, 1) },
        { key: 'routine.step.moisturize', items: products.filter((p) => (p.type === 'creme') && fits(p) && (p.category === need || p.category === 'hydratation')).slice(0, 1) },
      ];
  const all = steps.flatMap((s) => s.items);

  const addAll = () => {
    all.forEach((p) => addToCart(p.id, p.variants.find((v) => v.stockStatus === 'in_stock')?.id ?? p.variants[0].id, 1));
    showToast(t('routine.added'));
  };

  return (
    <Page>
      <Breadcrumb items={[{ label: t('nav.routines') }]} />
      <h1>{t('routines.title')}</h1>
      <p className="lead">{t('routines.intro')}</p>
      <form className="form routine-form" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
        <div className="field">
          <label htmlFor="r-need">{t('routines.q1')}</label>
          <select id="r-need" value={need} onChange={(e) => { setNeed(e.target.value as CategoryId); setDone(false); }}>
            {categoryOrder.map((c) => <option key={c} value={c}>{t(`nav.${c}` as TKey)}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="r-skin">{t('routines.q2')}</label>
          <select id="r-skin" value={skin} onChange={(e) => { setSkin(e.target.value as SkinType); setDone(false); }}>
            {skinTypes.map((s) => <option key={s} value={s}>{t(`skin.${s}` as TKey)}</option>)}
          </select>
        </div>
        <button className="btn" type="submit">{t('routines.go')}</button>
      </form>
      {done && (
        <section aria-live="polite">
          <h2>{t('routines.result')}</h2>
          {all.length === 0 ? (
            <EmptyState title={t('routines.none')} action={<A to="catalogue" className="btn">{t('common.catalog')}</A>} />
          ) : (
            <>
              <ol className="routine-steps-list">
                {steps.map((st, i) => (
                  <li key={st.key}>
                    <h3><span className="num">{i + 1}</span> {t(st.key)}</h3>
                    {st.items.length ? <ProductGrid items={st.items} /> : <p className="muted">{t('routine.missing')}</p>}
                  </li>
                ))}
              </ol>
              <p><button type="button" className="btn" onClick={addAll}>{t('routine.add_all')}</button></p>
            </>
          )}
          <p className="muted small">{t('routines.note')}</p>
        </section>
      )}
    </Page>
  );
}

export function AboutPage() {
  const { t } = useApp();
  useSeo({ title: `${t('about.title')} | NALGÉ`, description: t('about.todo') });
  const blocks: TKey[] = ['about.story', 'about.vision', 'about.principles', 'about.transparency', 'about.commitments'];
  return (
    <Page>
      <Breadcrumb items={[{ label: t('nav.about') }]} />
      <h1>{t('about.title')}</h1>
      <p className="demo-note">{t('about.todo')}</p>
      <div className="prose-grid">
        {blocks.map((b) => (
          <section key={b}><h2>{t(b)}</h2><p className="muted">—</p></section>
        ))}
      </div>
    </Page>
  );
}

export function BlogPage() {
  const { t, lang } = useApp();
  useSeo({ title: `${t('blog.title')} | NALGÉ`, description: t('blog.intro') });
  const cats = Array.from(new Set(articles.map((a) => loc(a.category, lang))));
  const [cat, setCat] = useState<string>('');
  const shown = articles.filter((a) => !cat || loc(a.category, lang) === cat);
  return (
    <Page>
      <Breadcrumb items={[{ label: t('blog.title') }]} />
      <h1>{t('blog.title')}</h1>
      <p className="lead">{t('blog.intro')}</p>
      <div className="row gap wrap-row" role="group" aria-label="Catégories">
        <button type="button" className={`chip-btn ${cat === '' ? 'is-on' : ''}`} onClick={() => setCat('')} aria-pressed={cat === ''}>{t('common.all')}</button>
        {cats.map((c) => <button key={c} type="button" className={`chip-btn ${cat === c ? 'is-on' : ''}`} onClick={() => setCat(c)} aria-pressed={cat === c}>{c}</button>)}
      </div>
      <div className="posts">
        {shown.map((a) => (
          <A key={a.slug} to={`article-${a.slug}`} className="post">
            <div className="post-cover" aria-hidden><ProductArt kind={products.find((p) => p.slug === a.related[0])?.images[0] ?? 'jar'} view={1} /></div>
            <span className="eyebrow">{loc(a.category, lang)}</span>
            <h2>{loc(a.title, lang)}</h2>
            <p className="muted">{loc(a.excerpt, lang)}</p>
            <span className="link-arrow">{t('blog.read')}</span>
          </A>
        ))}
      </div>
    </Page>
  );
}

export function ArticlePage({ slug }: { slug: string }) {
  const { t, lang } = useApp();
  const a = articles.find((x) => x.slug === slug);
  useSeo({ title: a ? `${loc(a.title, lang)} | NALGÉ` : 'NALGÉ', description: a ? loc(a.excerpt, lang) : '' });
  if (!a) return <NotFound />;
  const rel = a.related.map((s) => products.find((p) => p.slug === s)).filter((p): p is (typeof products)[number] => !!p);
  const others = articles.filter((x) => x.slug !== a.slug);
  return (
    <Page>
      <Breadcrumb items={[{ label: t('blog.title'), to: 'blog' }, { label: loc(a.title, lang) }]} />
      <article className="article">
        <span className="eyebrow">{loc(a.category, lang)}</span>
        <h1>{loc(a.title, lang)}</h1>
        <p className="demo-note small">{t('blog.intro')}</p>
        <div className="post-cover big" aria-label={t('blog.cover')}><ProductArt kind={rel[0]?.images[0] ?? 'jar'} view={1} /></div>
        <nav className="toc" aria-label={t('blog.toc')}>
          <strong>{t('blog.toc')}</strong>
          <ol>{a.sections.map((s, i) => <li key={i}><a href={`#${a.slug}`} onClick={(e) => { e.preventDefault(); document.getElementById(`s-${i}`)?.scrollIntoView({ behavior: 'smooth' }); }}>{loc(s.heading, lang)}</a></li>)}</ol>
        </nav>
        {a.sections.map((s, i) => (<section key={i} id={`s-${i}`}><h2>{loc(s.heading, lang)}</h2><p>{loc(s.body, lang)}</p></section>))}
      </article>
      {rel.length > 0 && (<section className="section tight"><h2>{t('blog.related_products')}</h2><ProductGrid items={rel} /></section>)}
      {others.length > 0 && (
        <section className="section tight"><h2>{t('blog.related_posts')}</h2>
          <ul className="plain">{others.map((o) => <li key={o.slug}><A to={`article-${o.slug}`}>{loc(o.title, lang)}</A></li>)}</ul>
        </section>
      )}
    </Page>
  );
}

export function ContactPage() {
  const { t } = useApp();
  useSeo({ title: `${t('contact.title')} | NALGÉ`, description: t('contact.intro') });
  const c = config.contact;
  const has = c.phone || c.whatsapp || c.email || c.address;
  return (
    <Page>
      <Breadcrumb items={[{ label: t('contact.title') }]} />
      <h1>{t('contact.title')}</h1>
      <p className="lead">{t('contact.intro')}</p>
      <div className="two-col">
        <ContactForm />
        <aside className="summary">
          {has ? (
            <ul className="plain">
              {c.phone && <li dir="ltr">{c.phone}</li>}
              {c.whatsapp && <li><a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
              {c.email && <li dir="ltr">{c.email}</li>}
              {c.address && <li>{c.address}</li>}
            </ul>
          ) : <p className="muted">{t('contact.info_empty')}</p>}
        </aside>
      </div>
    </Page>
  );
}

export function FaqPage() {
  const { t } = useApp();
  useSeo({ title: `${t('faq.title')} | NALGÉ`, description: t('faq.title') });
  return (
    <Page>
      <Breadcrumb items={[{ label: t('faq.title') }]} />
      <h1>{t('faq.title')}</h1>
      <details className="acc" open><summary>{t('faq.q1')}</summary><p>{t('faq.a1')}</p></details>
      <details className="acc"><summary>{t('faq.q2')}</summary><p>{t('faq.a2')}</p></details>
      <details className="acc"><summary>{t('ship.title')}</summary><p><A to="livraison-retours">{t('ship.title')}</A></p></details>
    </Page>
  );
}

export function ShippingPage() {
  const { t, lang } = useApp();
  useSeo({ title: `${t('ship.title')} | NALGÉ`, description: t('ship.title') });
  const d = config.delivery;
  const rows: [TKey, { fr: string; ar: string } | null][] = [['ship.coverage', d.coverage], ['ship.delay', d.delay], ['ship.fees', d.fees], ['ship.returns', d.returns]];
  return (
    <Page>
      <Breadcrumb items={[{ label: t('ship.title') }]} />
      <h1>{t('ship.title')}</h1>
      {rows.map(([k, v]) => (
        <section key={k}><h2>{t(k)}</h2><p className={v ? '' : 'muted'}>{v ? loc(v, lang) : t('ship.empty')}</p></section>
      ))}
    </Page>
  );
}

const legalText: Record<'privacy' | 'cgv' | 'legal', { fr: string[]; ar: string[] }> = {
  privacy: {
    fr: ['Responsable du traitement : à renseigner (identité de la société).', 'Données collectées : celles que vous saisissez (commande, contact, newsletter). En mode démonstration, rien n\'est transmis.', 'Stockage local : le panier, la langue et le choix de cookies sont conservés dans votre navigateur.', 'Vos droits (accès, rectification, suppression) : coordonnées de contact à renseigner.'],
    ar: ['المسؤول عن المعالجة: يُحدَّد (هوية الشركة).', 'البيانات المجمعة: ما تدخله (طلب، اتصال، نشرة). في الوضع التجريبي لا يُرسل شيء.', 'التخزين المحلي: تحفظ السلة واللغة واختيار ملفات الارتباط في متصفحك.', 'حقوقك (الاطلاع، التصحيح، الحذف): بيانات الاتصال تُحدَّد.'],
  },
  cgv: {
    fr: ['Objet : conditions applicables aux ventes de la boutique (à rédiger).', 'Prix : exprimés en dinars algériens (DZD), à confirmer.', 'Livraison, paiement et retours : conditions à définir par la boutique.', 'Droit applicable et litiges : à définir selon la réglementation algérienne en vigueur.'],
    ar: ['الموضوع: الشروط المطبقة على مبيعات المتجر (تُكتب لاحقًا).', 'الأسعار: بالدينار الجزائري، تُؤكد لاحقًا.', 'التوصيل والدفع والإرجاع: شروط يحددها المتجر.', 'القانون المطبق والنزاعات: تُحدَّد وفق التنظيم الجزائري الساري.'],
  },
  legal: {
    fr: ['Éditeur du site : à renseigner (raison sociale, forme juridique, adresse).', 'Registre du commerce / identifiants fiscaux : à renseigner.', 'Hébergeur : à renseigner.', 'Direction de la publication : à renseigner.'],
    ar: ['ناشر الموقع: يُحدَّد (الاسم التجاري، الشكل القانوني، العنوان).', 'السجل التجاري / المعرفات الجبائية: تُحدَّد.', 'المستضيف: يُحدَّد.', 'مدير النشر: يُحدَّد.'],
  },
};

export function LegalPage({ kind }: { kind: 'privacy' | 'cgv' | 'legal' }) {
  const { t, lang } = useApp();
  const title = t(`${kind === 'legal' ? 'legal' : kind}.title` as TKey);
  useSeo({ title: `${title} | NALGÉ`, description: title });
  return (
    <Page>
      <Breadcrumb items={[{ label: title }]} />
      <h1>{title}</h1>
      <p className="demo-note">{t('legal.warning')}</p>
      <ul className="plain legal">{legalText[kind][lang].map((l, i) => <li key={i}>{l}</li>)}</ul>
    </Page>
  );
}

export function AccountPage() {
  const { t } = useApp();
  useSeo({ title: `${t('account.title')} | NALGÉ`, description: t('account.text') });
  return (
    <Page>
      <Breadcrumb items={[{ label: t('account.title') }]} />
      <h1>{t('account.title')}</h1>
      <EmptyState title={t('account.title')} text={t('account.text')} action={<A to="catalogue" className="btn">{t('common.catalog')}</A>} />
    </Page>
  );
}
