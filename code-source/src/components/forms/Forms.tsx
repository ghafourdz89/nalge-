import { useState, type FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import { isValidEmail } from '../../utils';
import { submitContact, submitNewsletter } from '../../services/api';
import { config } from '../../config';

type Status = 'idle' | 'loading' | 'ok' | 'error';

export function NewsletterForm() {
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setErr(t('nl.invalid'));
      return;
    }
    setErr('');
    setStatus('loading');
    try {
      const r = await submitNewsletter(email);
      setSent(r.sent);
      setStatus('ok');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form className="nl-form" onSubmit={onSubmit} noValidate>
      <label htmlFor="nl-email" className="sr-only">{t('nl.email')}</label>
      <input id="nl-email" type="email" inputMode="email" autoComplete="email" placeholder={t('nl.email')} value={email}
        onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err} aria-describedby="nl-msg" />
      <button className="btn" type="submit" disabled={status === 'loading'}>{status === 'loading' ? t('common.loading') : t('nl.cta')}</button>
      <p id="nl-msg" className={`form-msg ${err || status === 'error' ? 'is-err' : ''}`} role="status" aria-live="polite">
        {err || (status === 'error' ? t('common.error') : status === 'ok' ? (sent ? t('nl.ok') : t('nl.ok_demo')) : '')}
      </p>
    </form>
  );
}

export function ContactForm() {
  const { t } = useApp();
  const [f, setF] = useState({ name: '', email: '', message: '' });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!f.name.trim()) n.name = t('common.required');
    if (!isValidEmail(f.email)) n.email = t('nl.invalid');
    if (f.message.trim().length < 5) n.message = t('common.required');
    setErrs(n);
    if (Object.keys(n).length) return;
    setStatus('loading');
    try {
      const r = await submitContact({ name: f.name, email: f.email, message: f.message });
      setSent(r.sent);
      setStatus('ok');
      setF({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const field = (id: keyof typeof f, label: string, el: 'input' | 'textarea', type = 'text') => (
    <div className="field">
      <label htmlFor={`c-${id}`}>{label}</label>
      {el === 'input' ? (
        <input id={`c-${id}`} type={type} value={f[id]} onChange={set(id)} aria-invalid={!!errs[id]} aria-describedby={errs[id] ? `c-${id}-e` : undefined} autoComplete={id === 'email' ? 'email' : id === 'name' ? 'name' : undefined} />
      ) : (
        <textarea id={`c-${id}`} rows={5} value={f[id]} onChange={set(id)} aria-invalid={!!errs[id]} aria-describedby={errs[id] ? `c-${id}-e` : undefined} />
      )}
      {errs[id] && <p className="field-err" id={`c-${id}-e`}>{errs[id]}</p>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="form">
      {field('name', t('contact.name'), 'input')}
      {field('email', t('contact.email'), 'input', 'email')}
      {field('message', t('contact.msg'), 'textarea')}
      <button className="btn" type="submit" disabled={status === 'loading'}>{status === 'loading' ? t('common.loading') : t('contact.send')}</button>
      <p className={`form-msg ${status === 'error' ? 'is-err' : ''}`} role="status" aria-live="polite">
        {status === 'error' ? t('common.error') : status === 'ok' ? (sent ? t('contact.ok') : t('contact.ok_demo')) : ''}
      </p>
      {!config.apiBaseUrl && status === 'idle' && <p className="muted small">{t('demo.notice')}</p>}
    </form>
  );
}
