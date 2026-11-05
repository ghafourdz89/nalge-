import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Download, Eye, ImagePlus, Plus, Trash2 } from 'lucide-react';
import type { ArtKind, L, Product, SkinType, Variant } from '../types';
import { collections, productTypes, skinTypes } from '../data/products';
import { applyProducts, builtinSettings, discardDraft, loadDraft, saveDraft, setPreview, type Settings } from '../services/store';
import { products as liveProducts } from '../data/products';
import { buildZip, type ZipEntry } from '../services/zip';
import { compressImage, dataUrlToBytes } from '../utils/image';

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const TYPE_FR: Record<string, string> = { serum: 'Sérum', creme: 'Crème', nettoyant: 'Nettoyant', contour: 'Contour des yeux', masque: 'Masque', capillaire: 'Capillaire' };
const SKIN_FR: Record<SkinType, string> = { normale: 'Normale', seche: 'Sèche', mixte: 'Mixte', grasse: 'Grasse', sensible: 'Sensible' };
const ART: Record<string, ArtKind> = { serum: 'dropper', creme: 'jar', nettoyant: 'tube', contour: 'tube', masque: 'jar', capillaire: 'pump' };
const MAX_PHOTOS = 8;

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'produit';

function blankProduct(): Product {
  const col = collections[0];
  return {
    id: '', slug: '', name: { fr: '', ar: '' }, subtitle: { fr: '', ar: '' },
    category: col.category, type: 'serum', collection: col.id,
    description: { fr: '', ar: '' }, benefits: [], ingredients: null, howToUse: null, skinTypes: null, texture: null,
    images: ['dropper', 'dropper', 'dropper', 'dropper', 'dropper'], photos: [],
    price: null, compareAtPrice: null, currency: 'DZD',
    variants: [{ id: 'v1', label: '30 ml', price: null, compareAtPrice: null, stockStatus: 'in_stock' }],
    stockStatus: 'in_stock', rating: null, reviewCount: 0, isFeatured: false, isNew: true, isBestseller: false,
    seoTitle: { fr: '', ar: '' }, seoDescription: { fr: '', ar: '' }, reviews: [], claims: [], demo: false, popularity: 50,
  };
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="ad-field">
      <span>{label}</span>
      {children}
      {hint && <small className="muted">{hint}</small>}
    </label>
  );
}
const Text = ({ value, onChange, dir, ...r }: { value: string; onChange: (v: string) => void; dir?: 'rtl'; placeholder?: string; inputMode?: 'numeric' | 'tel' | 'email' }) =>
  <input type="text" value={value} dir={dir} onChange={(e) => onChange(e.target.value)} {...r} />;
const Area = ({ value, onChange, dir, rows = 3 }: { value: string; onChange: (v: string) => void; dir?: 'rtl'; rows?: number }) =>
  <textarea value={value} dir={dir} rows={rows} onChange={(e) => onChange(e.target.value)} />;
const numOrNull = (s: string): number | null => { const n = Number(s.replace(/\s/g, '')); return s.trim() === '' || !Number.isFinite(n) ? null : n; };
/** Garde les deux moitiés telles quelles pendant la saisie ; null seulement si tout est vide. */
const lOrNull = (l: L): L | null => (l.fr.trim() || l.ar.trim() ? { fr: l.fr, ar: l.ar } : null);
const fillL = (l: L | null): L | null => (l && (l.fr.trim() || l.ar.trim()) ? { fr: l.fr.trim() || l.ar.trim(), ar: l.ar.trim() || l.fr.trim() } : null);
/** Réglages prêts à publier : chaque texte bilingue est complété avec l'autre langue si l'une manque. */
export const finalizeSettings = (s: Settings): Settings => ({
  ...s,
  announcement: fillL(s.announcement),
  delivery: { ...s.delivery, coverage: fillL(s.delivery.coverage), delay: fillL(s.delivery.delay), fees: fillL(s.delivery.fees), returns: fillL(s.delivery.returns) },
});

/* ------------------------------------------------------------------ */
/* Formulaire produit                                                 */
/* ------------------------------------------------------------------ */
function ProductForm({ initial, existing, onSave, onCancel }: { initial: Product; existing: Product[]; onSave: (p: Product) => void; onCancel: () => void }) {
  const isNew = !initial.slug;
  const [p, setP] = useState<Product>(() => clone(initial));
  const [err, setErr] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));
  const setL = (k: 'name' | 'subtitle' | 'description', lang: 'fr' | 'ar', v: string) => setP((x) => ({ ...x, [k]: { ...x[k], [lang]: v } }));
  const photos = p.photos ?? [];

  const setVariant = (i: number, patch: Partial<Variant>) => setP((x) => ({ ...x, variants: x.variants.map((v, k) => (k === i ? { ...v, ...patch } : v)) }));
  const addVariant = () => setP((x) => ({ ...x, variants: [...x.variants, { id: `v${Date.now().toString(36)}`, label: '', price: null, compareAtPrice: null, stockStatus: 'in_stock' }] }));
  const delVariant = (i: number) => setP((x) => ({ ...x, variants: x.variants.filter((_, k) => k !== i) }));

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    const out: string[] = [];
    for (const f of Array.from(files)) {
      if (photos.length + out.length >= MAX_PHOTOS) break;
      if (!f.type.startsWith('image/')) continue;
      try { out.push(await compressImage(f)); } catch { setErr((e) => [...e, `Impossible de lire « ${f.name} ».`]); }
    }
    setP((x) => ({ ...x, photos: [...(x.photos ?? []), ...out] }));
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };
  const movePhoto = (i: number, d: -1 | 1) => setP((x) => {
    const a = [...(x.photos ?? [])]; const j = i + d;
    if (j < 0 || j >= a.length) return x;
    [a[i], a[j]] = [a[j], a[i]];
    return { ...x, photos: a };
  });
  const delPhoto = (i: number) => setP((x) => ({ ...x, photos: (x.photos ?? []).filter((_, k) => k !== i) }));

  const toggleSkin = (s: SkinType) => setP((x) => {
    const cur = x.skinTypes ?? [];
    const next = cur.includes(s) ? cur.filter((y) => y !== s) : [...cur, s];
    return { ...x, skinTypes: next.length ? next : null };
  });

  const submit = () => {
    const errors: string[] = [];
    if (!p.name.fr.trim()) errors.push('Le nom du produit (français) est obligatoire.');
    if (!p.variants.length) errors.push('Ajoutez au moins une contenance (ex. 30 ml).');
    p.variants.forEach((v, i) => {
      if (!v.label.trim()) errors.push(`Contenance ${i + 1} : indiquez le libellé (ex. 30 ml).`);
      if (v.price === null || v.price < 0) errors.push(`Contenance ${i + 1} : indiquez le prix en DA.`);
    });
    if (errors.length) { setErr(errors); window.scrollTo(0, 0); return; }
    let slug = p.slug;
    if (isNew) {
      const base = slugify(p.name.fr); slug = base; let n = 2;
      while (existing.some((x) => x.slug === slug)) slug = `${base}-${n++}`;
    }
    const fill = (l: L): L => ({ fr: l.fr.trim() || l.ar.trim(), ar: l.ar.trim() || l.fr.trim() });
    const variants = p.variants.map((v, i) => ({ ...v, id: v.id || `v${i + 1}`, label: v.label.trim() }));
    const inStock = variants.some((v) => v.stockStatus === 'in_stock');
    const col = collections.find((c) => c.id === p.collection) ?? collections[0];
    const art = ART[p.type] ?? 'jar';
    const name = fill(p.name);
    const desc = fill(p.description);
    const out: Product = {
      ...p, id: isNew ? slug : p.id, slug,
      name, subtitle: fill(p.subtitle), description: desc,
      category: col.category, collection: col.id,
      benefits: p.benefits.filter((b) => b.fr.trim() || b.ar.trim()).map(fill),
      howToUse: p.howToUse && (p.howToUse.fr.trim() || p.howToUse.ar.trim()) ? fill(p.howToUse) : null,
      ingredients: p.ingredients && p.ingredients.length ? p.ingredients : null,
      images: [art, art, art, art, art],
      photos: photos.length ? photos : undefined,
      variants, price: variants[0].price, stockStatus: inStock ? 'in_stock' : 'out_of_stock',
      seoTitle: { fr: `${name.fr} | NALGÉ`, ar: `${name.ar} | NALGÉ` },
      seoDescription: desc.fr || desc.ar ? desc : { fr: `${name.fr} — NALGÉ`, ar: `${name.ar} — NALGÉ` },
      demo: false,
    };
    onSave(out);
  };

  const benefitsFr = p.benefits.map((b) => b.fr).join('\n');
  const benefitsAr = p.benefits.map((b) => b.ar).join('\n');
  const setBenefits = (fr: string, ar: string) => {
    const a = fr.split('\n'), b = ar.split('\n');
    const n = Math.max(a.length, b.length);
    set('benefits', Array.from({ length: n }, (_, i) => ({ fr: a[i] ?? '', ar: b[i] ?? '' })));
  };

  return (
    <div className="ad-card">
      <h2>{isNew ? 'Nouveau produit' : `Modifier : ${initial.name.fr}`}</h2>
      {err.length > 0 && <ul className="ad-err" role="alert">{err.map((e) => <li key={e}>{e}</li>)}</ul>}

      <h3>Photos</h3>
      <p className="muted small">La première photo est la photo principale. Les photos sont réduites automatiquement (1400 px max) pour que le site reste rapide. Maximum {MAX_PHOTOS}.</p>
      <div className="ad-photos">
        {photos.map((src, i) => (
          <figure key={i} className="ad-photo">
            <img src={src} alt={`Photo ${i + 1}`} />
            {i === 0 && <span className="ad-main">Principale</span>}
            <div>
              <button type="button" className="ad-ico" onClick={() => movePhoto(i, -1)} disabled={i === 0} aria-label="Déplacer avant"><ArrowLeft size={14} /></button>
              <button type="button" className="ad-ico" onClick={() => movePhoto(i, 1)} disabled={i === photos.length - 1} aria-label="Déplacer après"><ArrowRight size={14} /></button>
              <button type="button" className="ad-ico ad-del" onClick={() => delPhoto(i)} aria-label="Supprimer cette photo"><Trash2 size={14} /></button>
            </div>
          </figure>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button type="button" className="ad-add-photo" onClick={() => fileRef.current?.click()} disabled={busy}>
            <ImagePlus size={26} /> {busy ? 'Traitement…' : 'Ajouter des photos'}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => void addPhotos(e.target.files)} data-testid="photo-input" />
      </div>

      <h3>Informations</h3>
      <div className="ad-grid">
        <Field label="Nom (français) *"><Text value={p.name.fr} onChange={(v) => setL('name', 'fr', v)} placeholder="ex. Sérum Éclat" /></Field>
        <Field label="Nom (arabe)" hint="Si vide, le français est utilisé."><Text dir="rtl" value={p.name.ar} onChange={(v) => setL('name', 'ar', v)} /></Field>
        <Field label="Sous-titre (français)"><Text value={p.subtitle.fr} onChange={(v) => setL('subtitle', 'fr', v)} placeholder="ex. Sérum unifiant pour le teint" /></Field>
        <Field label="Sous-titre (arabe)"><Text dir="rtl" value={p.subtitle.ar} onChange={(v) => setL('subtitle', 'ar', v)} /></Field>
        <Field label="Description (français)"><Area value={p.description.fr} onChange={(v) => setL('description', 'fr', v)} /></Field>
        <Field label="Description (arabe)"><Area dir="rtl" value={p.description.ar} onChange={(v) => setL('description', 'ar', v)} /></Field>
        <Field label="Gamme">
          <select value={p.collection} onChange={(e) => set('collection', e.target.value as Product['collection'])}>
            {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Type de produit">
          <select value={p.type} onChange={(e) => set('type', e.target.value as Product['type'])}>
            {productTypes.map((t) => <option key={t} value={t}>{TYPE_FR[t]}</option>)}
          </select>
        </Field>
      </div>

      <h3>Contenances et prix</h3>
      {p.variants.map((v, i) => (
        <div className="ad-variant" key={v.id || i}>
          <Field label="Contenance"><Text value={v.label} onChange={(x) => setVariant(i, { label: x })} placeholder="30 ml" /></Field>
          <Field label="Prix (DA) *"><Text inputMode="numeric" value={v.price === null ? '' : String(v.price)} onChange={(x) => setVariant(i, { price: numOrNull(x) })} placeholder="3800" /></Field>
          <Field label="Ancien prix (DA)" hint="Optionnel : affiche une promotion."><Text inputMode="numeric" value={v.compareAtPrice === null ? '' : String(v.compareAtPrice)} onChange={(x) => setVariant(i, { compareAtPrice: numOrNull(x) })} /></Field>
          <Field label="Stock">
            <select value={v.stockStatus} onChange={(e) => setVariant(i, { stockStatus: e.target.value as Variant['stockStatus'] })}>
              <option value="in_stock">Disponible</option>
              <option value="out_of_stock">Rupture</option>
            </select>
          </Field>
          {p.variants.length > 1 && <button type="button" className="ad-ico ad-del" onClick={() => delVariant(i)} aria-label="Supprimer cette contenance"><Trash2 size={16} /></button>}
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={addVariant}><Plus size={16} /> Ajouter une contenance</button>

      <h3>Détails (facultatif)</h3>
      <div className="ad-grid">
        <Field label="Bienfaits (français)" hint="Un par ligne."><Area value={benefitsFr} onChange={(v) => setBenefits(v, benefitsAr)} /></Field>
        <Field label="Bienfaits (arabe)" hint="Un par ligne, dans le même ordre."><Area dir="rtl" value={benefitsAr} onChange={(v) => setBenefits(benefitsFr, v)} /></Field>
        <Field label="Conseils d'utilisation (français)"><Area value={p.howToUse?.fr ?? ''} onChange={(v) => set('howToUse', { fr: v, ar: p.howToUse?.ar ?? '' })} /></Field>
        <Field label="Conseils d'utilisation (arabe)"><Area dir="rtl" value={p.howToUse?.ar ?? ''} onChange={(v) => set('howToUse', { fr: p.howToUse?.fr ?? '', ar: v })} /></Field>
        <Field label="Ingrédients (liste INCI)" hint="Séparés par des virgules. À renseigner seulement si vous avez la liste officielle."><Area value={(p.ingredients ?? []).join(', ')} onChange={(v) => set('ingredients', v.split(',').map((s) => s.trim()).filter(Boolean))} /></Field>
      </div>
      <fieldset className="ad-checks">
        <legend>Types de peau concernés (cochez seulement si c'est confirmé)</legend>
        {skinTypes.map((s) => <label key={s}><input type="checkbox" checked={(p.skinTypes ?? []).includes(s)} onChange={() => toggleSkin(s)} /> {SKIN_FR[s]}</label>)}
      </fieldset>
      <fieldset className="ad-checks">
        <legend>Mises en avant</legend>
        <label><input type="checkbox" checked={p.isNew} onChange={(e) => set('isNew', e.target.checked)} /> Nouveauté</label>
        <label><input type="checkbox" checked={p.isBestseller} onChange={(e) => set('isBestseller', e.target.checked)} /> Meilleure vente</label>
        <label><input type="checkbox" checked={p.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} /> Produit vedette</label>
      </fieldset>

      <div className="ad-actions">
        <button type="button" className="btn" onClick={submit} disabled={busy}>Enregistrer le produit</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Réglages                                                           */
/* ------------------------------------------------------------------ */
const normPhone = (s: string): string | null => {
  let d = s.replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = `213${d.slice(1)}`;
  return d;
};

function SettingsForm({ s, onChange }: { s: Settings; onChange: (s: Settings) => void }) {
  const up = (patch: Partial<Settings>) => onChange({ ...s, ...patch });
  const upD = (patch: Partial<Settings['delivery']>) => onChange({ ...s, delivery: { ...s.delivery, ...patch } });
  const L2 = (label: string, v: L | null, set: (l: L | null) => void, hint?: string) => (
    <div className="ad-grid">
      <Field label={`${label} (français)`} hint={hint}><Text value={v?.fr ?? ''} onChange={(x) => set(lOrNull({ fr: x, ar: v?.ar ?? '' }))} /></Field>
      <Field label={`${label} (arabe)`}><Text dir="rtl" value={v?.ar ?? ''} onChange={(x) => set(lOrNull({ fr: v?.fr ?? '', ar: x }))} /></Field>
    </div>
  );
  return (
    <div className="ad-card">
      <h2>Réglages du site</h2>
      <h3>Recevoir les commandes</h3>
      <div className="ad-grid">
        <Field label="Numéro WhatsApp" hint="Ex. 0555 12 34 56 (converti automatiquement au format international).">
          <Text inputMode="tel" value={s.whatsapp ?? ''} onChange={(v) => up({ whatsapp: normPhone(v) })} placeholder="213555123456" />
        </Field>
        <Field label="Adresse e-mail pour les commandes"><Text inputMode="email" value={s.email ?? ''} onChange={(v) => up({ email: v.trim() || null })} placeholder="commandes@exemple.com" /></Field>
        <Field label="Téléphone affiché sur le site"><Text inputMode="tel" value={s.phone ?? ''} onChange={(v) => up({ phone: v.trim() || null })} /></Field>
        <Field label="Adresse affichée sur le site"><Text value={s.address ?? ''} onChange={(v) => up({ address: v.trim() || null })} /></Field>
      </div>
      <p className="muted small">Tant que WhatsApp et e-mail sont vides, la commande reste en mode démonstration.</p>

      <h3>Bandeau d'annonce et mode démonstration</h3>
      <label className="ad-inline"><input type="checkbox" checked={s.demoMode} onChange={(e) => up({ demoMode: e.target.checked })} /> Mode démonstration (affiche « données d'exemple » sur le site)</label>
      {L2("Texte du bandeau d'annonce", s.announcement, (l) => up({ announcement: l }), 'Laissez vide pour masquer le bandeau.')}

      <h3>Livraison (ne renseignez que ce qui est vrai)</h3>
      {L2('Zone de livraison', s.delivery.coverage, (l) => upD({ coverage: l }), 'Ex. 58 wilayas')}
      {L2('Délai', s.delivery.delay, (l) => upD({ delay: l }), 'Ex. 24 à 72 h')}
      {L2('Frais', s.delivery.fees, (l) => upD({ fees: l }))}
      {L2('Retours', s.delivery.returns, (l) => upD({ returns: l }))}
      <div className="ad-grid">
        <Field label="Livraison offerte à partir de (DA)" hint="Vide = pas de seuil.">
          <Text inputMode="numeric" value={s.delivery.freeShippingFrom === null ? '' : String(s.delivery.freeShippingFrom)} onChange={(v) => upD({ freeShippingFrom: numOrNull(v) })} />
        </Field>
      </div>

      <h3>Réseaux sociaux (liens complets)</h3>
      <div className="ad-grid">
        <Field label="Facebook"><Text value={s.social.facebook ?? ''} onChange={(v) => up({ social: { ...s.social, facebook: v.trim() || null } })} placeholder="https://facebook.com/…" /></Field>
        <Field label="Instagram"><Text value={s.social.instagram ?? ''} onChange={(v) => up({ social: { ...s.social, instagram: v.trim() || null } })} /></Field>
        <Field label="TikTok"><Text value={s.social.tiktok ?? ''} onChange={(v) => up({ social: { ...s.social, tiktok: v.trim() || null } })} /></Field>
        <Field label="Adresse du site (pour Google)" hint="Ex. https://mon-site.netlify.app"><Text value={s.siteUrl ?? ''} onChange={(v) => up({ siteUrl: v.trim().replace(/\/+$/, '') || null })} /></Field>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Publication                                                        */
/* ------------------------------------------------------------------ */
async function fetchBytes(url: string): Promise<Uint8Array | null> {
  try {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) return null;
    const b = new Uint8Array(await r.arrayBuffer());
    return b;
  } catch { return null; }
}

export async function buildSite(list: Product[], settings: Settings): Promise<{ blob: Blob; full: boolean; images: number; files: string[] }> {
  const enc = new TextEncoder();
  const entries: ZipEntry[] = [];
  let images = 0;
  const outProducts = list.map((p) => {
    if (!p.photos || !p.photos.length) { const { photos: _ph, ...rest } = p; return rest as Product; }
    const paths = p.photos.map((src, i) => {
      if (!src.startsWith('data:')) return src; // déjà publiée (images/…)
      const path = `images/${p.slug}-${i + 1}.jpg`;
      entries.push({ name: path, data: dataUrlToBytes(src) });
      images++;
      return path;
    });
    return { ...p, photos: paths };
  });
  // Photos déjà publiées et conservées : on les recopie depuis le site en ligne.
  const kept = new Set<string>();
  outProducts.forEach((p) => p.photos?.forEach((x) => { if (!x.startsWith('data:') && !entries.some((e) => e.name === x)) kept.add(x); }));
  for (const path of kept) {
    const b = await fetchBytes(`./${path}`);
    if (b) { entries.push({ name: path, data: b }); images++; }
  }
  entries.push({ name: 'produits.json', data: enc.encode(JSON.stringify(outProducts, null, 1)) });
  entries.push({ name: 'reglages.json', data: enc.encode(JSON.stringify(finalizeSettings(settings), null, 1)) });
  let full = false;
  const html = location.protocol === 'file:' ? null : await fetchBytes('./index.html');
  if (html && new TextDecoder().decode(html.slice(0, 400)).toLowerCase().includes('<!doctype html')) {
    entries.unshift({ name: 'index.html', data: html });
    full = true;
    for (const extra of ['robots.txt', 'sitemap.xml']) {
      const b = await fetchBytes(`./${extra}`);
      if (b && !new TextDecoder().decode(b.slice(0, 200)).toLowerCase().includes('<!doctype')) entries.push({ name: extra, data: b });
    }
  }
  return { blob: buildZip(entries), full, images, files: entries.map((e) => e.name) };
}

function PublishTab({ list, settings }: { list: Product[]; settings: Settings }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'err'>('idle');
  const [info, setInfo] = useState<{ full: boolean; images: number; n: number } | null>(null);
  const warnings = useMemo(() => {
    const w: string[] = [];
    if (settings.demoMode) w.push('Le mode démonstration est activé : le bandeau « données d\'exemple » restera affiché. Désactivez-le dans Réglages quand vos produits sont réels.');
    if (!settings.whatsapp && !settings.email) w.push('Ni WhatsApp ni e-mail ne sont renseignés : les clients ne pourront pas vous envoyer leurs commandes.');
    if (list.some((p) => p.demo)) w.push(`${list.filter((p) => p.demo).length} produit(s) de démonstration sont encore dans la liste. Supprimez-les ou remplacez-les.`);
    if (list.some((p) => !p.photos || !p.photos.length)) w.push('Certains produits n\'ont pas de photo (une illustration neutre sera affichée).');
    if (!list.length) w.push('Aucun produit : le catalogue sera vide.');
    return w;
  }, [list, settings]);

  const download = async () => {
    setState('busy');
    try {
      const r = await buildSite(list, settings);
      const url = URL.createObjectURL(r.blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'nalge-site-a-publier.zip';
      document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      setInfo({ full: r.full, images: r.images, n: list.length });
      setState('done');
    } catch { setState('err'); }
  };

  return (
    <div className="ad-card">
      <h2>Publier mes modifications</h2>
      <p>Vos modifications sont enregistrées <strong>dans ce navigateur</strong> (brouillon). Elles ne sont visibles par vos clients qu'après publication :</p>
      <ol className="ad-steps">
        <li>Cliquez sur <strong>Télécharger le dossier à publier</strong> ci-dessous.</li>
        <li>Décompressez le fichier ZIP (clic droit → Extraire tout).</li>
        <li>Sur Netlify : votre site → onglet <strong>Deploys</strong> → glissez le dossier décompressé dans la zone « Drag and drop your site output folder here ».</li>
        <li>Patientez quelques secondes : le site est mis à jour avec la même adresse.</li>
      </ol>
      {warnings.length > 0 && <div className="ad-warn" role="note"><strong>À vérifier avant de publier</strong><ul>{warnings.map((w) => <li key={w}>{w}</li>)}</ul></div>}
      <p className="small muted">{list.length} produit(s) · {list.reduce((n, p) => n + (p.photos?.length ?? 0), 0)} photo(s)</p>
      <button type="button" className="btn" onClick={() => void download()} disabled={state === 'busy'}><Download size={18} /> {state === 'busy' ? 'Préparation…' : 'Télécharger le dossier à publier'}</button>
      {state === 'done' && info && (
        <p className="ok-note" role="status">
          {info.full ? 'Dossier prêt (site + produits + photos).' : 'Attention : le fichier du site (index.html) n\'a pas pu être inclus car cette page n\'est pas ouverte depuis votre site publié. Le ZIP contient seulement vos données (produits.json, reglages.json, images/) : ouvrez cette page depuis l\'adresse Netlify de votre site pour obtenir le dossier complet.'}
        </p>
      )}
      {state === 'err' && <p className="ad-err" role="alert">La préparation a échoué. Réessayez, ou utilisez un autre navigateur (Chrome).</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page admin                                                         */
/* ------------------------------------------------------------------ */
export function AdminPage() {
  const [ready, setReady] = useState(false);
  const [list, setList] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>(builtinSettings());
  const [tab, setTab] = useState<'produits' | 'reglages' | 'publier'>('produits');
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [saved, setSaved] = useState<'ok' | 'mem' | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    document.title = 'Administration — NALGÉ';
    void loadDraft().then((d) => {
      if (d) { setList(d.products); setSettings(d.settings); setHasDraft(true); }
      else { setList(clone(liveProducts)); setSettings(builtinSettings()); }
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (first.current) { first.current = false; return; }
    const id = window.setTimeout(() => { void saveDraft({ products: list, settings }).then((ok) => { setSaved(ok ? 'ok' : 'mem'); setHasDraft(true); }); }, 300);
    return () => window.clearTimeout(id);
  }, [list, settings, ready]);

  const preview = async () => {
    await saveDraft({ products: list, settings: finalizeSettings(settings) });
    setPreview(true);
    applyProducts(list);
    window.location.hash = 'accueil';
    window.location.reload();
  };
  const reset = async () => {
    if (!window.confirm('Abandonner toutes les modifications non publiées et revenir à la version en ligne ?')) return;
    await discardDraft(); setPreview(false); window.location.reload();
  };

  const saveProduct = (p: Product) => {
    setList((l) => (l.some((x) => x.id === p.id && x.slug === p.slug) ? l.map((x) => (x.id === p.id ? p : x)) : [p, ...l]));
    setEditing(null);
  };
  const del = (id: string) => { setList((l) => l.filter((x) => x.id !== id)); setConfirmDel(null); };

  if (!ready) return <p className="ad-wrap">Chargement…</p>;

  return (
    <div className="ad-wrap">
      <header className="ad-head">
        <div>
          <h1>Administration NALGÉ</h1>
          <p className="muted small">{saved === 'mem' ? 'Enregistrement local indisponible dans ce navigateur : vos modifications sont gardées tant que cette page reste ouverte.' : saved === 'ok' ? 'Brouillon enregistré automatiquement dans ce navigateur.' : 'Les modifications sont enregistrées automatiquement dans ce navigateur.'}</p>
        </div>
        <div className="ad-head-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => void preview()}><Eye size={16} /> Voir l'aperçu du site</button>
          <a className="btn btn-ghost btn-sm" href="#accueil">Quitter l'admin</a>
        </div>
      </header>
      <nav className="ad-tabs" aria-label="Sections de l'administration">
        {([['produits', `Produits (${list.length})`], ['reglages', 'Réglages'], ['publier', 'Publier']] as const).map(([k, label]) => (
          <button key={k} type="button" className={tab === k ? 'is-on' : ''} onClick={() => { setTab(k); setEditing(null); }} aria-current={tab === k}>{label}</button>
        ))}
      </nav>

      {tab === 'produits' && (editing ? (
        <ProductForm initial={editing} existing={list} onSave={saveProduct} onCancel={() => setEditing(null)} />
      ) : (
        <div className="ad-card">
          <div className="ad-row-head">
            <h2>Mes produits</h2>
            <button type="button" className="btn btn-sm" onClick={() => setEditing(blankProduct())}><Plus size={16} /> Ajouter un produit</button>
          </div>
          {list.length === 0 && <p className="muted">Aucun produit pour l'instant. Cliquez sur « Ajouter un produit ».</p>}
          <ul className="ad-list">
            {list.map((p) => (
              <li key={p.id}>
                <span className="ad-thumb">{p.photos && p.photos[0] ? <img src={p.photos[0]} alt="" /> : <span className="muted small">pas de photo</span>}</span>
                <span className="ad-name">
                  <strong>{p.name.fr}</strong>
                  <small className="muted">{p.variants.map((v) => `${v.label} · ${v.price ?? '—'} DA`).join('  |  ')}{p.demo ? '  — démonstration' : ''}{p.stockStatus === 'out_of_stock' ? '  — rupture' : ''}</small>
                </span>
                <span className="ad-btns">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>Modifier</button>
                  {confirmDel === p.id ? (
                    <>
                      <button type="button" className="btn btn-sm ad-danger" onClick={() => del(p.id)}>Confirmer la suppression</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(null)}>Annuler</button>
                    </>
                  ) : (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(p.id)} aria-label={`Supprimer ${p.name.fr}`}><Trash2 size={14} /> Supprimer</button>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {list.some((p) => p.demo) && (
            <p><button type="button" className="btn btn-ghost btn-sm" onClick={() => setList((l) => l.filter((p) => !p.demo))}>Supprimer tous les produits de démonstration</button></p>
          )}
        </div>
      ))}
      {tab === 'reglages' && <SettingsForm s={settings} onChange={setSettings} />}
      {tab === 'publier' && <PublishTab list={list} settings={settings} />}
      {hasDraft && <p className="small"><button type="button" className="linklike" onClick={() => void reset()}>Abandonner mes modifications non publiées</button></p>}
    </div>
  );
}
