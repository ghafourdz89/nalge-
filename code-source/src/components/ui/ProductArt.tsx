import type { ArtKind } from '../../types';

interface Props {
  kind: ArtKind;
  accent?: string;
  view?: 0 | 1 | 2 | 3 | 4;
  label?: string;
  className?: string;
}

/**
 * Illustration vectorielle de REMPLACEMENT d'un produit.
 * À remplacer par de vraies photographies (voir README, section « Images »).
 */
export function ProductArt({ kind, accent = '#8DCFD0', view = 0, label = 'NALGÉ', className }: Props) {
  const glass = accent;
  const id = `g${kind}${view}${accent.replace('#', '')}`;
  return (
    <svg className={className} viewBox="0 0 240 280" role="img" aria-label={`${label} — image de remplacement`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4efe6" />
          <stop offset="1" stopColor="#e6dccb" />
        </linearGradient>
        <linearGradient id={`${id}gl`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={glass} stopOpacity=".55" />
          <stop offset=".35" stopColor="#ffffff" stopOpacity=".75" />
          <stop offset="1" stopColor={glass} stopOpacity=".7" />
        </linearGradient>
        <radialGradient id={`${id}drop`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={glass} />
        </radialGradient>
      </defs>
      <rect width="240" height="280" fill={`url(#${id}bg)`} />
      {view === 4 ? (
        // Vue « ingrédients » : feuilles autour d'une goutte
        <g>
          <path d="M120 150 C70 130 50 80 70 50 C110 60 130 100 120 150Z" fill={glass} opacity=".7" />
          <path d="M120 150 C170 130 190 80 170 50 C130 60 110 100 120 150Z" fill="#8fae95" opacity=".7" />
          <path d="M120 120 C150 150 160 190 120 220 C80 190 90 150 120 120Z" fill={`url(#${id}drop)`} />
          <ellipse cx="120" cy="252" rx="60" ry="8" fill="#000" opacity=".1" />
        </g>
      ) : view === 1 ? (
        // Vue « texture » : goutte macro
        <g>
          <path d="M0 220 Q70 190 130 215 T240 200 V280 H0Z" fill="#fff" opacity=".6" />
          <path d="M120 60 C150 110 172 140 172 172 a52 52 0 0 1 -104 0 C68 140 90 110 120 60Z" fill={`url(#${id}drop)`} />
          <ellipse cx="102" cy="150" rx="9" ry="18" fill="#fff" opacity=".7" transform="rotate(18 102 150)" />
          <ellipse cx="120" cy="238" rx="70" ry="8" fill="#000" opacity=".1" />
        </g>
      ) : (
        <g>
          <ellipse cx="120" cy="252" rx="62" ry="9" fill="#000" opacity=".12" />
          {view === 2 && <rect x="46" y="70" width="148" height="176" rx="10" fill="#fbf9f4" stroke="#d8c9b7" />}
          {view === 2 && <text x="120" y="96" textAnchor="middle" fontFamily="Georgia,serif" fontSize="14" fill="#174A68">{label}</text>}
          <g transform={view === 2 ? 'translate(0 18) scale(.9) translate(13 6)' : undefined}>
            {kind === 'dropper' && (
              <g>
                <rect x="104" y="30" width="32" height="46" rx="14" fill="#174A68" />
                <rect x="100" y="70" width="40" height="18" rx="3" fill="#d8c9b7" />
                <path d="M84 100 q0 -12 16 -12 h40 q16 0 16 12 v128 q0 16 -16 16 h-40 q-16 0 -16 -16z" fill={`url(#${id}gl)`} stroke={glass} />
                <rect x="94" y="140" width="52" height="58" rx="4" fill="#fff" opacity=".92" />
                <text x="120" y="166" textAnchor="middle" fontFamily="Georgia,serif" fontSize="12" fill="#174A68">{label}</text>
                <line x1="104" y1="176" x2="136" y2="176" stroke="#8DCFD0" strokeWidth="2" />
              </g>
            )}
            {kind === 'jar' && (
              <g>
                <rect x="70" y="120" width="100" height="22" rx="6" fill="#174A68" />
                <path d="M66 142 h108 v72 q0 20 -20 20 h-68 q-20 0 -20 -20z" fill={`url(#${id}gl)`} stroke={glass} />
                <rect x="84" y="160" width="72" height="42" rx="4" fill="#fff" opacity=".92" />
                <text x="120" y="186" textAnchor="middle" fontFamily="Georgia,serif" fontSize="13" fill="#174A68">{label}</text>
              </g>
            )}
            {kind === 'tube' && (
              <g>
                <path d="M92 50 h56 l6 160 h-68z" fill="#fff" stroke="#d8c9b7" />
                <rect x="92" y="38" width="56" height="14" rx="3" fill={glass} />
                <rect x="86" y="206" width="68" height="34" rx="8" fill="#174A68" />
                <text x="120" y="140" textAnchor="middle" fontFamily="Georgia,serif" fontSize="14" fill="#174A68">{label}</text>
                <line x1="104" y1="152" x2="136" y2="152" stroke={glass} strokeWidth="3" />
              </g>
            )}
            {(kind === 'pump' || kind === 'spray') && (
              <g>
                <rect x="112" y="26" width="16" height="30" rx="4" fill="#174A68" />
                <rect x="96" y="22" width="48" height="12" rx="5" fill="#174A68" />
                <rect x="108" y="54" width="24" height="26" fill="#d8c9b7" />
                <path d="M82 96 q0 -16 18 -16 h40 q18 0 18 16 v124 q0 22 -18 22 h-40 q-18 0 -18 -22z" fill={`url(#${id}gl)`} stroke={glass} />
                <rect x="92" y="136" width="56" height="60" rx="4" fill="#fff" opacity=".92" />
                <text x="120" y="164" textAnchor="middle" fontFamily="Georgia,serif" fontSize="12" fill="#174A68">{label}</text>
                <line x1="104" y1="174" x2="136" y2="174" stroke="#8DCFD0" strokeWidth="2" />
              </g>
            )}
          </g>
          {view === 3 && (
            <g fontFamily="Arial,sans-serif" fontSize="13" fontWeight="700" fill="#fff">
              <circle cx="40" cy="90" r="14" fill="#174A68" /><text x="40" y="95" textAnchor="middle">1</text>
              <circle cx="40" cy="140" r="14" fill="#174A68" /><text x="40" y="145" textAnchor="middle">2</text>
              <circle cx="40" cy="190" r="14" fill="#174A68" /><text x="40" y="195" textAnchor="middle">3</text>
              <path d="M40 106 V124 M40 156 V174" stroke="#174A68" strokeWidth="2" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
}
