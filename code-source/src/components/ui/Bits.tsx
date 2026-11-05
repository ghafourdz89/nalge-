import { useEffect, type ReactNode } from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/** Lien interne (routage par hash). */
export function A({ to, children, className, onClick, ...rest }: { to: string; children: ReactNode; className?: string; onClick?: () => void } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a href={`#${to}`} className={className} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}

export function Stars({ rating, count }: { rating: number | null; count: number }) {
  if (rating === null || count === 0) return null;
  return (
    <span className="stars" aria-label={`${rating}/5 (${count})`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} aria-hidden />
      ))}
      <span className="muted small">({count})</span>
    </span>
  );
}

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  const { t } = useApp();
  const all = [{ label: t('common.home'), to: 'accueil' }, ...items];
  return (
    <nav className="breadcrumb" aria-label="Fil d'Ariane">
      <ol>
        {all.map((it, i) => (
          <li key={i}>
            {it.to && i < all.length - 1 ? <A to={it.to}>{it.label}</A> : <span aria-current={i === all.length - 1 ? 'page' : undefined}>{it.label}</span>}
            {i < all.length - 1 && <ChevronRight size={14} className="chev" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="empty" role="status">
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {action}
    </div>
  );
}

interface Seo {
  title: string;
  description: string;
  jsonLd?: object | null;
}

/** Met à jour <title>, meta description, Open Graph et JSON-LD pour la page courante. */
export function useSeo({ title, description, jsonLd }: Seo) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : '';
  useEffect(() => {
    document.title = title;
    const set = (sel: string, attr: string, val: string, create: () => HTMLElement) => {
      let el = document.head.querySelector<HTMLElement>(sel);
      if (!el) {
        el = create();
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };
    set('meta[name="description"]', 'content', description, () => Object.assign(document.createElement('meta'), { name: 'description' }));
    set('meta[property="og:title"]', 'content', title, () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:title'); return m; });
    set('meta[property="og:description"]', 'content', description, () => { const m = document.createElement('meta'); m.setAttribute('property', 'og:description'); return m; });
    const old = document.getElementById('ld-json');
    if (old) old.remove();
    if (ld) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.id = 'ld-json';
      s.textContent = ld;
      document.head.appendChild(s);
    }
    return () => document.getElementById('ld-json')?.remove();
  }, [title, description, ld]);
}
