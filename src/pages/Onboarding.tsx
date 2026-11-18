import { ArrowRight, Gauge, ReceiptText, Target, Upload, Wallet } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Segmented } from '../components/ui';
import MoneyInput from '../components/MoneyInput';
import { hasKey, makeT } from '../lib/i18n';
import { CURRENCIES, currencySymbol, parseAmount, type CurrencyCode } from '../lib/money';
import { parseBackup } from '../lib/schema';
import type { Lang } from '../lib/types';
import { useApp } from '../state/AppState';

export default function Onboarding() {
  const { data, completeOnboarding, replaceAll, updateProfile } = useApp();
  const [lang, setLang] = useState<Lang>(data.profile.language);
  const t = makeT(lang);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(data.profile.currency);
  const [budget, setBudget] = useState('');
  const [start, setStart] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const ids = { first: useId(), last: useId(), budget: useId(), budgetHint: useId(), start: useId(), startHint: useId(), err: useId(), title: useId() };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!first.trim()) {
      setError(t('obNameRequired'));
      firstRef.current?.focus();
      return;
    }
    completeOnboarding(
      { firstName: first.trim().slice(0, 60), lastName: last.trim().slice(0, 60), currency, language: lang, budget: parseAmount(budget) ?? 0 },
      parseAmount(start) ?? 0,
    );
  };

  const points = [
    { icon: ReceiptText, text: t('obPoint1') },
    { icon: Gauge, text: t('obPoint2') },
    { icon: Target, text: t('obPoint3') },
  ];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#2f80ff_0%,#0057e0_50%,#003b9e_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_100%_0%,rgb(255_255_255/0.18),transparent_60%)]" aria-hidden="true" />
        <div className="relative flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <Wallet size={20} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="text-xl font-bold tracking-tight">Velora</span>
        </div>
        <div className="relative max-w-md">
          <h1 className="display text-[2.75rem] font-bold">{t('obTitle')}</h1>
          <ul className="mt-10 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[0.9375rem] text-white/90">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/12">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/70">{t('obLead')}</p>
      </aside>

      <main className="flex items-center justify-center px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-white lg:hidden">
              <Wallet size={20} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="ml-auto w-64">
              <Segmented<Lang>
                label="Idioma"
                value={lang}
                onChange={(l) => {
                  setLang(l);
                  updateProfile({ language: l });
                }}
                options={[
                  { value: 'pt', label: 'Português' },
                  { value: 'es', label: 'Español' },
                ]}
              />
            </div>
          </div>

          <h1 id={ids.title} className="display text-[2rem] font-bold text-ink lg:hidden">
            {t('obTitle')}
          </h1>
          <p className="mb-7 mt-2 text-[0.9375rem] text-muted lg:hidden">{t('obLead')}</p>

          <form onSubmit={submit} noValidate aria-labelledby={ids.title} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={ids.first} className="label">
                  {t('firstName')}
                </label>
                <input
                  ref={firstRef}
                  id={ids.first}
                  className="field"
                  autoComplete="given-name"
                  enterKeyHint="next"
                  maxLength={60}
                  value={first}
                  onChange={(e) => {
                    setFirst(e.target.value);
                    setError('');
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? ids.err : undefined}
                />
              </div>
              <div>
                <label htmlFor={ids.last} className="label">
                  {t('lastName')}
                </label>
                <input id={ids.last} className="field" autoComplete="family-name" enterKeyHint="next" maxLength={60} value={last} onChange={(e) => setLast(e.target.value)} />
              </div>
            </div>
            {error && (
              <p id={ids.err} className="-mt-1 text-sm text-down" role="alert">
                {error}
              </p>
            )}

            <div>
              <p className="label">{t('currency')}</p>
              <Segmented<CurrencyCode>
                label={t('currency')}
                value={currency}
                onChange={setCurrency}
                options={CURRENCIES.map((c) => ({ value: c, label: `${currencySymbol(c)} ${c}` }))}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MoneyField id={ids.budget} hintId={ids.budgetHint} label={t('obBudgetLabel')} hint={t('obBudgetHint')} value={budget} onChange={setBudget} currency={currency} />
              <MoneyField id={ids.start} hintId={ids.startHint} label={t('obStartBalance')} hint={t('obStartBalanceHint')} value={start} onChange={setStart} currency={currency} />
            </div>

            <button type="submit" className="btn btn-primary press mt-2 w-full">
              {t('obStart')}
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          </form>

          <button type="button" className="press mx-auto mt-6 flex items-center gap-2 text-sm font-medium text-accent-ink" onClick={() => fileRef.current?.click()}>
            <Upload size={16} strokeWidth={1.75} aria-hidden="true" />
            {t('obRestore')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              try {
                if (f.size > 20_000_000) throw new Error('too_large');
                const d = parseBackup(await f.text());
                replaceAll({ ...d, profile: { ...d.profile, onboardingComplete: true } });
              } catch (err) {
                const code = `importErr_${(err as Error).message}`;
                setError(hasKey(code) ? t(code) : t('importErr_invalid'));
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}

function MoneyField({
  id,
  hintId,
  label,
  hint,
  value,
  onChange,
  currency,
}: {
  id: string;
  hintId: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  currency: CurrencyCode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <MoneyInput id={id} currency={currency} value={value} onChange={(e) => onChange(e.target.value)} aria-describedby={hintId} />
      <p id={hintId} className="mt-1.5 text-[0.8125rem] text-muted">
        {hint}
      </p>
    </div>
  );
}
