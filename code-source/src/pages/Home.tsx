import { ArrowRight, Droplets, FlaskConical, Layers, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { categoryOrder, collections, products } from '../data/products';
import { articles } from '../data/articles';
import { A, EmptyState, SectionHead, useSeo } from '../components/ui/Bits';
import { ProductArt } from '../components/ui/ProductArt';
import { ProductGrid } from '../components/product/ProductCard';
import { Page } from '../components/layout/Layout';
import { loc } from '../utils';
import type { TKey } from '../locales';

const catIcon = { 'anti-taches': Sparkles, 'anti-age': Layers, hydratation: Droplets, 'anti-imperfections': FlaskConical, cheveux: Layers } as const;

export function Home() {
  const { t, lang } = useApp();
  useSeo({
    title: lang === 'ar' ? 'نالجي | عناية بالوجه والشعر' : 'NALGÉ | Soins du visage et des cheveux',
    description: t('home.hero.text'),
  });
  const best = products.filter((p) => p.isBestseller).slice(0, 4);
  const fresh = products.filter((p) => p.isNew).slice(0, 4);

  return (
    <Page wide>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{t('home.hero.eyebrow')}</p>
            <h1>{t('home.hero.title')}</h1>
            <p className="lead">{t('home.hero.text')}</p>
            <div className="row gap wrap-row">
              <A to="catalogue" className="btn">{t('home.hero.cta')}</A>
              <A to="routines" className="btn btn-ghost">{t('home.hero.cta2')}</A>
            </div>
          </div>
          <div className="hero-scene" aria-hidden="true">
            <div className="scene-disc" />
            <ProductArt className="scene-a" kind="jar" accent="#8DCFD0" />
            <ProductArt className="scene-b" kind="dropper" accent="#c9a96e" />
            <ProductArt className="scene-c" kind="pump" accent="#8DCFD0" />
            <span className="ph-note">{t('prod.ph')}</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead title={t('home.best')} sub={t('home.best.sub')} action={<A to="catalogue" className="link-arrow">{t('common.see_all')} <ArrowRight size={16} aria-hidden /></A>} />
          <ProductGrid items={best} />
        </div>
      </section>

      <section className="section band-sand">
        <div className="wrap">
          <SectionHead title={t('home.needs')} />
          <div className="needs">
            {categoryOrder.map((c) => {
              const Icon = catIcon[c];
              const col = collections.find((x) => x.category === c);
              return (
                <A key={c} to={`categorie-${c}`} className="need" style={{ ['--accent' as string]: col?.accent }}>
                  <Icon size={26} aria-hidden />
                  <strong>{t(`nav.${c}` as TKey)}</strong>
                  <span className="muted small">{col ? loc(col.tagline, lang) : ''}</span>
                </A>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead title={t('home.new')} action={<A to="catalogue" className="link-arrow">{t('common.see_all')} <ArrowRight size={16} aria-hidden /></A>} />
          <ProductGrid items={fresh} />
        </div>
      </section>

      <section className="section band-blue">
        <div className="wrap">
          <SectionHead title={t('home.actives')} sub={t('home.actives.note')} />
          <div className="actives">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="active">
                <h3>{t(`active.${i}.t` as TKey)}</h3>
                <p>{t(`active.${i}.d` as TKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap routine-cta">
          <div>
            <h2>{t('home.routine')}</h2>
            <p className="lead">{t('home.routine.text')}</p>
            <A to="routines" className="btn">{t('home.hero.cta2')}</A>
          </div>
          <ol className="routine-steps" aria-hidden>
            <li>01</li><li>02</li><li>03</li>
          </ol>
        </div>
      </section>

      <section className="section band-sand">
        <div className="wrap">
          <SectionHead title={t('home.philosophy')} />
          <div className="phil">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <h3>{t(`phil.${i}.t` as TKey)}</h3>
                <p>{t(`phil.${i}.d` as TKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead title={t('home.reviews')} />
          <EmptyState title={t('prod.reviews.empty')} text={t('home.reviews.empty')} />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <SectionHead title={t('home.journal')} sub={t('home.journal.sub')} action={<A to="blog" className="link-arrow">{t('common.see_all')} <ArrowRight size={16} aria-hidden /></A>} />
          <div className="posts">
            {articles.map((a) => (
              <A key={a.slug} to={`article-${a.slug}`} className="post">
                <div className="post-cover" aria-hidden><ProductArt kind={products.find((p) => p.slug === a.related[0])?.images[0] ?? 'jar'} view={1} /></div>
                <span className="eyebrow">{loc(a.category, lang)}</span>
                <h3>{loc(a.title, lang)}</h3>
                <p className="muted small">{loc(a.excerpt, lang)}</p>
              </A>
            ))}
          </div>
        </div>
      </section>
    </Page>
  );
}
