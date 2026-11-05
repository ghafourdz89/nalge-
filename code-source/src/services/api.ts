import { config } from '../config';
import type { DemoOrder } from '../types';
import { safeGet, safeSet } from '../utils';

/**
 * Couche de services : l'interface n'appelle JAMAIS directement un backend.
 * - apiBaseUrl === null : mode démonstration local (rien n'est envoyé nulle part).
 * - apiBaseUrl défini  : POST JSON vers `${apiBaseUrl}/<endpoint>`. Adaptez ces fonctions à Shopify/WooCommerce.
 * Aucune clé secrète ici : toute clé doit rester côté serveur.
 */
export interface SubmitResult { sent: boolean }

async function post(endpoint: string, body: unknown): Promise<SubmitResult> {
  if (!config.apiBaseUrl) {
    await new Promise((r) => setTimeout(r, 400)); // simule la latence pour tester l'état de chargement
    return { sent: false };
  }
  const res = await fetch(`${config.apiBaseUrl}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { sent: true };
}

export const submitNewsletter = (email: string) => post('newsletter', { email });
export const submitContact = (data: { name: string; email: string; message: string }) => post('contact', data);

export async function submitOrder(order: DemoOrder): Promise<SubmitResult> {
  const result = await post('orders', order);
  safeSet('nalge.lastOrder', order); // conservé localement pour la page de confirmation
  return result;
}
export const getLastOrder = () => safeGet<DemoOrder | null>('nalge.lastOrder', null);
