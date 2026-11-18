import { Check, ChevronRight, Download, KeyRound, Lock, ShieldCheck, Smartphone, Trash2, Upload } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { InstallGuide } from '../components/InstallBanner';
import PinPad from '../components/PinPad';
import Sheet from '../components/Sheet';
import MoneyInput from '../components/MoneyInput';
import { PageHeader, Segmented } from '../components/ui';
import { CARD_STYLES } from '../lib/cardColors';
import { hasKey } from '../lib/i18n';
import { amountToInput, CURRENCIES, currencySymbol, parseAmount, type CurrencyCode } from '../lib/money';
import { CARD_COLORS, parseBackup } from '../lib/schema';
import type { Lang, ThemePref } from '../lib/types';
import { isValidPin } from '../lib/vault';
import { useApp } from '../state/AppState';


function Group({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="mb-2 px-1 text-[0.8125rem] font-medium text-muted">{title}</h2>
      <div className="card divide-y divide-line overflow-hidden">{children}</div>
    </section>
  );
}

function Row({ icon: Icon, title, hint, onClick, danger, right }: { icon: typeof Lock; title: string; hint?: string; onClick?: () => void; danger?: boolean; right?: ReactNode }) {
  const content = (
    <>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${danger ? 'bg-down/10 text-down' : 'bg-soft text-ink-2'}`}>
        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className={`block text-[0.9375rem] font-medium ${danger ? 'text-down' : 'text-ink'}`}>{title}</span>
        {hint && <span className="block text-[0.8125rem] text-muted">{hint}</span>}
      </span>
      {right ?? (onClick && <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden="true" />)}
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} className="press hover-soft flex w-full items-center gap-3 px-4 py-3">
      {content}
    </button>
  ) : (
    <div className="flex items-center gap-3 px-4 py-3">{content}</div>
  );
}

export default function Settings() {
  const app = useApp();
  const { data, t, updateProfile, toast, replaceAll, eraseAll, pinEnabled, enablePin, disablePin, lock } = app;
  const p = data.profile;
  const { hash } = useLocation();
  const [install, setInstall] = useState(false);
  const [erase, setErase] = useState(false);
  const [pinSheet, setPinSheet] = useState(false);
  const [disableSheet, setDisableSheet] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ name: string; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [hash]);

  const setTheme = (theme: ThemePref) => {
    document.documentElement.classList.add('theme-transition');
    updateProfile({ theme });
    window.setTimeout(() => document.documentElement.classList.remove('theme-transition'), 250);
  };

  const doExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `velora-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast({ message: t('exported') });
  };

  const doImport = () => {
    if (!pendingImport) return;
    try {
      const d = parseBackup(pendingImport.text);
      replaceAll({ ...d, profile: { ...d.profile, onboardingComplete: true } });
      toast({ message: t('imported', { count: d.transactions.length }) });
    } catch (e) {
      const code = `importErr_${(e as Error).message}`;
      toast({ message: hasKey(code) ? t(code) : t('importErr_invalid'), tone: 'error' });
    }
    setPendingImport(null);
  };

  return (
    <>
      <PageHeader title={t('settings')} />
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
          <ProfileForm />

          <Group title={t('appearance')}>
            <div className="space-y-4 p-4">
              <div>
                <p className="label">{t('language')}</p>
                <Segmented<Lang>
                  label={t('language')}
                  value={p.language}
                  onChange={(language) => updateProfile({ language })}
                  options={[
                    { value: 'pt', label: 'Português' },
                    { value: 'es', label: 'Español' },
                  ]}
                />
              </div>
              <div>
                <p className="label">{t('appearance')}</p>
                <Segmented<ThemePref>
                  label={t('appearance')}
                  value={p.theme}
                  onChange={setTheme}
                  options={[
                    { value: 'system', label: t('themeSystem') },
                    { value: 'light', label: t('themeLight') },
                    { value: 'dark', label: t('themeDark') },
                  ]}
                />
              </div>
              <div>
                <p className="label">{t('currency')}</p>
                <Segmented<CurrencyCode>
                  label={t('currency')}
                  value={p.currency}
                  onChange={(currency) => updateProfile({ currency })}
                  options={CURRENCIES.map((c) => ({ value: c, label: `${currencySymbol(c)} ${c}` }))}
                />
              </div>
              <div>
                <p className="label">{t('cardColor')}</p>
                <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={t('cardColor')}>
                  {CARD_COLORS.map((c) => {
                    const sel = p.cardColor === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={sel}
                        aria-label={CARD_STYLES[c].label[p.language]}
                        title={CARD_STYLES[c].label[p.language]}
                        onClick={() => updateProfile({ cardColor: c })}
                        className={`press grid h-10 w-10 place-items-center rounded-full text-white ${sel ? 'ring-2 ring-accent ring-offset-2 ring-offset-card' : ''}`}
                        style={{ background: CARD_STYLES[c].bg }}
                      >
                        {sel && <Check size={16} strokeWidth={2.5} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Group>
        </div>

        <div className="space-y-6">
          <Group title={t('security')}>
            <Row
              icon={pinEnabled ? ShieldCheck : KeyRound}
              title={t('pinLock')}
              hint={pinEnabled ? t('pinLockOnHint') : t('pinLockOffHint')}
              onClick={() => (pinEnabled ? setDisableSheet(true) : setPinSheet(true))}
              right={
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${pinEnabled ? 'bg-money/12 text-money' : 'bg-soft text-muted'}`}>
                  {pinEnabled ? 'ON' : 'OFF'}
                </span>
              }
            />
            {pinEnabled && <Row icon={Lock} title={t('lockNow')} hint={t('autoLockNote')} onClick={lock} />}
            <Row icon={Smartphone} title={t('installTitle')} onClick={() => setInstall(true)} />
          </Group>

          <Group title={t('data')}>
            <Row icon={Download} title={t('exportData')} hint={t('exportHint')} onClick={doExport} />
            <Row icon={Upload} title={t('importData')} hint={t('importHint')} onClick={() => fileRef.current?.click()} />
            <Row icon={Trash2} title={t('eraseAll')} hint={t('eraseHint')} onClick={() => setErase(true)} danger />
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f) return;
                if (f.size > 20_000_000) {
                  toast({ message: t('importErr_too_large'), tone: 'error' });
                  return;
                }
                setPendingImport({ name: f.name, text: await f.text() });
              }}
            />
          </Group>

          <section className="px-1">
            <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-ink-2">
              <ShieldCheck size={15} strokeWidth={1.75} aria-hidden="true" />
              {t('privacyTitle')}
            </p>
            <p className="mt-1 text-[0.8125rem] text-muted">{t('privacyBody')}</p>
            <p className="num mt-3 text-xs text-muted">{t('version', { v: __APP_VERSION__ })}</p>
          </section>
        </div>
      </div>

      <InstallGuide open={install} onClose={() => setInstall(false)} />

      <Sheet
        open={pendingImport !== null}
        onClose={() => setPendingImport(null)}
        title={t('importData')}
        closeLabel={t('close')}
        footer={
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary press flex-1" onClick={() => setPendingImport(null)}>
              {t('cancel')}
            </button>
            <button type="button" className="btn btn-primary press flex-1" onClick={doImport}>
              {t('importData')}
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-2">{t('importConfirm', { file: pendingImport?.name ?? '' })}</p>
      </Sheet>

      <Sheet
        open={erase}
        onClose={() => setErase(false)}
        title={t('eraseConfirmTitle')}
        closeLabel={t('close')}
        footer={
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary press flex-1" onClick={() => setErase(false)}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className="btn btn-danger press flex-1"
              onClick={async () => {
                setErase(false);
                await eraseAll();
              }}
            >
              {t('eraseConfirmCta')}
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-2">{t('eraseConfirmBody')}</p>
      </Sheet>

      <Sheet
        open={disableSheet}
        onClose={() => setDisableSheet(false)}
        title={t('pinDisable')}
        closeLabel={t('close')}
        footer={
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary press flex-1" onClick={() => setDisableSheet(false)}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className="btn btn-danger press flex-1"
              onClick={async () => {
                setDisableSheet(false);
                await disablePin();
                toast({ message: t('pinDisabledToast') });
              }}
            >
              {t('pinDisable')}
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-2">{t('pinDisableConfirm')}</p>
      </Sheet>

      <PinSetup
        key={pinSheet ? 'open' : 'closed'}
        open={pinSheet}
        onClose={() => setPinSheet(false)}
        onDone={async (pin) => {
          await enablePin(pin);
          setPinSheet(false);
          toast({ message: t('pinEnabledToast') });
        }}
      />
    </>
  );
}

function ProfileForm() {
  const { data, t, currency, updateProfile, toast } = useApp();
  const p = data.profile;
  const [first, setFirst] = useState(p.firstName);
  const [last, setLast] = useState(p.lastName);
  const [budget, setBudget] = useState(amountToInput(p.budget, currency));
  const ids = { first: useId(), last: useId(), budget: useId(), hint: useId() };
  const dirty = first.trim() !== p.firstName || last.trim() !== p.lastName || (parseAmount(budget) ?? 0) !== p.budget;

  return (
    <Group title={t('profileSection')} id="budget">
      <form
        className="space-y-4 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!first.trim()) return;
          updateProfile({ firstName: first.trim().slice(0, 60), lastName: last.trim().slice(0, 60), budget: parseAmount(budget) ?? 0 });
          toast({ message: t('profileSaved') });
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={ids.first} className="label">
              {t('firstName')}
            </label>
            <input id={ids.first} className="field" autoComplete="given-name" maxLength={60} required value={first} onChange={(e) => setFirst(e.target.value)} />
          </div>
          <div>
            <label htmlFor={ids.last} className="label">
              {t('lastName')}
            </label>
            <input id={ids.last} className="field" autoComplete="family-name" maxLength={60} value={last} onChange={(e) => setLast(e.target.value)} />
          </div>
        </div>
        <div>
          <label htmlFor={ids.budget} className="label">
            {t('monthlyBudget')}
          </label>
          <MoneyInput id={ids.budget} currency={currency} value={budget} onChange={(e) => setBudget(e.target.value)} aria-describedby={ids.hint} />
          <p id={ids.hint} className="mt-1.5 text-[0.8125rem] text-muted">
            {t('monthlyBudgetHint')}
          </p>
        </div>
        <button type="submit" className="btn btn-primary press w-full" disabled={!dirty || !first.trim()}>
          {t('save')}
        </button>
      </form>
    </Group>
  );
}

function PinSetup({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (pin: string) => Promise<void> }) {
  const { t } = useApp();
  const [step, setStep] = useState<'first' | 'confirm'>('first');
  const [first, setFirst] = useState('');
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!isValidPin(pin)) return;
    if (step === 'first') {
      setFirst(pin);
      setPin('');
      setStep('confirm');
      setErr('');
      return;
    }
    if (pin !== first) {
      setErr(t('pinMismatch'));
      setStep('first');
      setFirst('');
      setPin('');
      return;
    }
    setBusy(true);
    try {
      await onDone(pin);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={step === 'first' ? t('pinCreateTitle') : t('pinConfirmTitle')} closeLabel={t('close')}>
      <p className="mb-1 text-center text-sm text-muted">{t('pinDigits')}</p>
      <p className="mb-6 h-5 text-center text-sm text-down" role="alert">
        {busy ? t('saving') : err}
      </p>
      {open && (
        <PinPad
          value={pin}
          onChange={setPin}
          onSubmit={submit}
          disabled={busy}
          error={!!err && !pin}
          deleteLabel={t('pinDelete')}
          submitLabel={step === 'first' ? t('continue') : t('confirm')}
        />
      )}
      <p className="mt-6 rounded-xl bg-warn/10 p-3 text-[0.8125rem] text-ink">{t('pinWarning')}</p>
    </Sheet>
  );
}
