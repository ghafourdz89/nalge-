import { useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import type { Review, SkinType } from '../../types';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../ui/Bits';
import { skinTypes } from '../../data/products';
import type { TKey } from '../../locales';

/**
 * Avis clients : résumé, répartition, filtres, liste.
 * N'affiche que de VRAIS avis (product.reviews). Tant que la liste est vide : état vide explicite.
 */
export function Reviews({ reviews }: { reviews: Review[] }) {
  const { t, lang } = useApp();
  const [rating, setRating] = useState<number>(0);
  const [skin, setSkin] = useState<SkinType | ''>('');

  const stats = useMemo(() => {
    const n = reviews.length;
    const avg = n ? reviews.reduce((s, r) => s + r.rating, 0) / n : 0;
    const dist = [5, 4, 3, 2, 1].map((k) => ({ k, c: reviews.filter((r) => r.rating === k).length }));
    return { n, avg, dist };
  }, [reviews]);

  if (!reviews.length) return <EmptyState title={t('prod.reviews.empty')} />;

  const shown = reviews.filter((r) => (!rating || r.rating === rating) && (!skin || r.skin === skin));
  const fmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ-u-nu-latn' : 'fr-FR', { dateStyle: 'medium' });

  return (
    <div className="reviews">
      <div className="rev-summary">
        <p className="rev-avg" aria-label={t('rev.summary', { r: stats.avg.toFixed(1), n: stats.n })}><strong>{stats.avg.toFixed(1)}</strong>/5</p>
        <ul className="rev-dist">
          {stats.dist.map((d) => (
            <li key={d.k}>
              <span>{t('rev.stars', { n: d.k })}</span>
              <span className="bar"><span style={{ width: `${(d.c / stats.n) * 100}%` }} /></span>
              <span className="muted small">{Math.round((d.c / stats.n) * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="row gap wrap-row rev-filters">
        <div className="field"><label htmlFor="rv-r">{t('rev.filter.rating')}</label>
          <select id="rv-r" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            <option value={0}>{t('rev.all')}</option>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{t('rev.stars', { n })}</option>)}
          </select></div>
        <div className="field"><label htmlFor="rv-s">{t('rev.filter.skin')}</label>
          <select id="rv-s" value={skin} onChange={(e) => setSkin(e.target.value as SkinType | '')}>
            <option value="">{t('rev.all')}</option>
            {skinTypes.map((s) => <option key={s} value={s}>{t(`skin.${s}` as TKey)}</option>)}
          </select></div>
      </div>
      {shown.length === 0 ? <p className="muted">{t('rev.none_match')}</p> : (
        <ul className="rev-list">
          {shown.map((r) => (
            <li key={r.id}>
              <span className="stars" aria-label={`${r.rating}/5`}>{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill={i <= r.rating ? 'currentColor' : 'none'} aria-hidden />)}</span>
              {r.title && <strong>{r.title}</strong>}
              <p>{r.body}</p>
              <p className="muted small">{r.author} · {fmt.format(new Date(r.date))}{r.skin ? ` · ${t(`skin.${r.skin}` as TKey)}` : ''}{r.verified ? ` · ${t('rev.verified')}` : ''}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
