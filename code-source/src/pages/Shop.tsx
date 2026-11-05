import { useState, type FormEvent } from 'react';
import { useApp } from '../context/AppContext';
import { WILAYAS, config } from '../config';
import { A, Breadcrumb, EmptyState, useSeo } from '../components/ui/Bits';
import { CartLineView, Page } from '../components/layout/Layout';
import { products } from '../data/products';
import { formatPrice, isValidPhoneDZ, loc } from '../utils';
import { getLastOrder, submitOrder } from '../services/api';
import type { DemoOrder } from '../types';
import { channels, mailLink, ordersLive, whatsappLink } from '../utils/order';

export function CartPage() {
  const { t, cart, setQty, removeLine, subtotal, lang, go } = useApp();
  useSeo({ title: `${t('cart.title')} | NALGÉ`, description: t('cart.title') });
  return (
    <Page>
      <Breadcrumb items={[{ label: t('cart.title') }]} />
      <h1>{t('cart.title')}</h1>
      {cart.length === 0 ? (
        <EmptyState title={t('cart.empty')} action={<A to="catalogue" className="btn">{t('cart.empty.cta')}</A>} />
      ) : (
        <div className="cart-layout">
          <ul className="lines">
            {cart.map((l) => <CartLineView key={l.productId + l.variantId} line={l} setQty={setQty} removeLine={removeLine} />)}
          </ul>
          <aside className="summary">
            <p className="row between"><strong>{t('cart.subtotal')}</strong><strong>{formatPrice(subtotal, lang)}</strong></p>
            <p className="muted small">{t('cart.shipping_note')}</p>
            <button type="button" className="btn btn-block" onClick={() => go('commande')}>{t('cart.checkout')}</button>
            <A to="catalogue" className="btn btn-ghost btn-block">{t('cart.continue')}</A>
          </aside>
        </div>
      )}
    </Page>
  );
}

export function CheckoutPage() {
  const { t, cart, subtotal, lang, clearCart, go } = useApp();
  const [f, setF] = useState({ name: '', phone: '', wilaya: '', address: '' });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(false);
  useSeo({ title: `${t('checkout.title')} | NALGÉ`, description: t('checkout.title') });

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!f.name.trim()) n.name = t('common.required');
    if (!isValidPhoneDZ(f.phone)) n.phone = t('checkout.phone_err');
    if (!f.wilaya) n.wilaya = t('common.required');
    if (f.address.trim().length < 5) n.address = t('common.required');
    setErrs(n);
    if (Object.keys(n).length) return;
    const lines = cart.flatMap((l) => {
      const p = products.find((x) => x.id === l.productId);
      const v = p?.variants.find((x) => x.id === l.variantId);
      return p && v ? [{ name: loc(p.name, lang), variant: v.label, qty: l.qty, unit: v.price ?? 0 }] : [];
    });
    const order: DemoOrder = { ref: `${ordersLive() ? "NAL" : "DEMO"}-${Date.now().toString(36).toUpperCase()}`, lines, subtotal, customer: f, createdAt: new Date().toISOString() };
    setBusy(true);
    setFail(false);
    try {
      await submitOrder(order);
      clearCart();
      go('confirmation');
    } catch {
      setFail(true);
    } finally {
      setBusy(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Page>
        <Breadcrumb items={[{ label: t('checkout.title') }]} />
        <EmptyState title={t('cart.empty')} action={<A to="catalogue" className="btn">{t('cart.empty.cta')}</A>} />
      </Page>
    );
  }

  const field = (id: keyof typeof f, label: string, node: React.ReactNode) => (
    <div className="field">
      <label htmlFor={`o-${id}`}>{label}</label>
      {node}
      {errs[id] && <p className="field-err" id={`o-${id}-e`}>{errs[id]}</p>}
    </div>
  );

  return (
    <Page>
      <Breadcrumb items={[{ label: t('cart.title'), to: 'panier' }, { label: t('checkout.title') }]} />
      <h1>{t('checkout.title')}</h1>
      {!config.apiBaseUrl && !ordersLive() && <p className="demo-note" role="note">{t('checkout.demo')}</p>}
      <div className="cart-layout">
        <form className="form" onSubmit={onSubmit} noValidate>
          {field('name', t('checkout.name'), <input id="o-name" value={f.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errs.name} aria-describedby={errs.name ? 'o-name-e' : undefined} />)}
          {field('phone', t('checkout.phone'), <input id="o-phone" type="tel" inputMode="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" dir="ltr" aria-invalid={!!errs.phone} aria-describedby={errs.phone ? 'o-phone-e' : undefined} />)}
          {field('wilaya', t('checkout.wilaya'), (
            <select id="o-wilaya" value={f.wilaya} onChange={set('wilaya')} aria-invalid={!!errs.wilaya} aria-describedby={errs.wilaya ? 'o-wilaya-e' : undefined}>
              <option value="">{t('checkout.choose')}</option>
              {WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          ))}
          {field('address', t('checkout.address'), <textarea id="o-address" rows={3} value={f.address} onChange={set('address')} autoComplete="street-address" aria-invalid={!!errs.address} aria-describedby={errs.address ? 'o-address-e' : undefined} />)}
          <p className="muted small">{t('checkout.pay')}</p>
          <button className="btn" type="submit" disabled={busy}>{busy ? t('common.loading') : ordersLive() ? t('checkout.submit_real') : t('checkout.submit')}</button>
          {fail && <p className="form-msg is-err" role="alert">{t('common.error')}</p>}
        </form>
        <aside className="summary">
          <ul className="lines">
            {cart.map((l) => {
              const p = products.find((x) => x.id === l.productId);
              const v = p?.variants.find((x) => x.id === l.variantId);
              if (!p || !v) return null;
              return <li key={l.productId + l.variantId} className="row between small"><span>{loc(p.name, lang)} · {v.label} × {l.qty}</span><span>{formatPrice((v.price ?? 0) * l.qty, lang)}</span></li>;
            })}
          </ul>
          <p className="row between"><strong>{t('cart.subtotal')}</strong><strong>{formatPrice(subtotal, lang)}</strong></p>
          <p className="muted small">{t('cart.shipping_note')}</p>
        </aside>
      </div>
    </Page>
  );
}

export function ConfirmationPage() {
  const { t, lang } = useApp();
  const order = getLastOrder();
  useSeo({ title: `${t('confirm.title')} | NALGÉ`, description: t('confirm.text') });
  return (
    <Page>
      <h1>{ordersLive() ? t('confirm.title_real') : t('confirm.title')}</h1>
      {!order ? (
        <EmptyState title={t('confirm.none')} action={<A to="catalogue" className="btn">{t('cart.empty.cta')}</A>} />
      ) : (
        <div className="summary wide">
          <p className={ordersLive() ? 'ok-note' : 'demo-note'}>{ordersLive() ? t('confirm.text_real') : t('confirm.text')}</p>
          <p><strong>{t('confirm.ref')} :</strong> <span dir="ltr">{order.ref}</span></p>
          <ul className="lines">
            {order.lines.map((l, i) => <li key={i} className="row between small"><span>{l.name} · {l.variant} × {l.qty}</span><span>{formatPrice(l.unit * l.qty, lang)}</span></li>)}
          </ul>
          <p className="row between"><strong>{t('cart.subtotal')}</strong><strong>{formatPrice(order.subtotal, lang)}</strong></p>
          {ordersLive() && (
            <div className="send-order">
              {channels.whatsapp && <a className="btn btn-wa" href={whatsappLink(order, lang)} target="_blank" rel="noopener noreferrer">{t('confirm.wa')}</a>}
              {channels.email && <a className="btn btn-ghost" href={mailLink(order, lang)}>{t('confirm.mail')}</a>}
              {channels.email && <p className="muted small">{t('confirm.mail_note')}</p>}
            </div>
          )}
          <A to="catalogue" className="btn btn-ghost">{t('cart.continue')}</A>
        </div>
      )}
    </Page>
  );
}
