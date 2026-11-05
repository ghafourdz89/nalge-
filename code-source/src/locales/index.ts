import { fr } from './fr';
import { ar } from './ar';
import type { Lang } from '../types';

export type TKey = keyof typeof fr;
export const dictionaries: Record<Lang, Record<TKey, string>> = { fr, ar };

export function translate(lang: Lang, key: TKey, vars?: Record<string, string | number>): string {
  let s = dictionaries[lang][key] ?? dictionaries.fr[key] ?? key;
  if (vars) for (const k of Object.keys(vars)) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}
