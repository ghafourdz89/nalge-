import { config } from '../config';
import type { DemoOrder, Lang } from '../types';
import { formatPrice } from './index';

/** Évalués à chaque lecture : les réglages peuvent être chargés après l'import du module. */
export const channels = {
  get whatsapp() { return !!(config.orderByWhatsapp && config.contact.whatsapp); },
  get email() { return !!(config.orderByEmail && config.contact.email); },
};
export const ordersLive = () => channels.whatsapp || channels.email;

export function orderText(o: DemoOrder, lang: Lang): string {
  const head = lang === 'ar' ? `طلب جديد ${o.ref}` : `Nouvelle commande ${o.ref}`;
  const lines = o.lines.map((l) => `- ${l.name} (${l.variant}) x${l.qty} : ${formatPrice(l.unit * l.qty, lang)}`).join('\n');
  const c = o.customer;
  const cust = lang === 'ar'
    ? `الاسم: ${c.name}\nالهاتف: ${c.phone}\nالولاية: ${c.wilaya}\nالعنوان: ${c.address}`
    : `Nom : ${c.name}\nTéléphone : ${c.phone}\nWilaya : ${c.wilaya}\nAdresse : ${c.address}`;
  const total = `${lang === 'ar' ? 'المجموع الفرعي' : 'Sous-total'} : ${formatPrice(o.subtotal, lang)}`;
  const pay = lang === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison';
  return `${head}\n\n${lines}\n\n${total}\n${pay}\n\n${cust}`;
}

export const whatsappLink = (o: DemoOrder, lang: Lang) =>
  `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(orderText(o, lang))}`;
export const mailLink = (o: DemoOrder, lang: Lang) =>
  `mailto:${config.contact.email}?subject=${encodeURIComponent(`${config.brand} — ${o.ref}`)}&body=${encodeURIComponent(orderText(o, lang))}`;
