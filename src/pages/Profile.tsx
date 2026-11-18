import {
  ChevronRight,
  User,
  Bell,
  HelpCircle,
  Shield,
  Trash2,
  Download,
  Upload,
  Check,
  CircleDollarSign,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportData, importData, clearAllData } from '../storage';
import { useState } from 'react';
import BottomSheet from '../components/BottomSheet';
import AppleSwitch from '../components/AppleSwitch';
import { localeFor, t } from '../i18n';

const currenciesEs = [
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

const currenciesPt = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

export default function Profile() {
  const { data, updateProfile, refreshData } = useApp();
  const lang = data.profile.language;
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [firstName, setFirstName] = useState(data.profile.firstName || '');
  const [lastName, setLastName] = useState(data.profile.lastName || '');
  const [budget, setBudget] = useState(String(data.profile.budget || ''));

  const currencies = lang === 'pt' ? currenciesPt : currenciesEs;

  const handleExport = async () => {
    try {
      const jsonData = await exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `velora-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(lang === 'pt' ? 'Erro ao exportar' : 'Error al exportar los datos');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        await importData(await file.text());
        await refreshData();
      } catch {
        alert(lang === 'pt' ? 'JSON inválido' : 'Error al importar los datos.');
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (confirm(t(lang, 'clearConfirm'))) {
      await clearAllData();
      await refreshData();
    }
  };

  const openPersonal = () => {
    setFirstName(data.profile.firstName || '');
    setLastName(data.profile.lastName || '');
    setBudget(String(data.profile.budget || ''));
    setShowPersonalModal(true);
  };

  const savePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetValue = parseFloat(budget.replace(',', '.')) || 0;
    await updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      budget: budgetValue,
    });
    setShowPersonalModal(false);
  };

  const currentCurrency =
    currencies.find((c) => c.code === data.profile.currency) || currencies[0];

  const MenuRow = ({
    icon: Icon,
    tone,
    title,
    subtitle,
    onClick,
  }: {
    icon: typeof User;
    tone: string;
    title: string;
    subtitle: string;
    onClick?: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="pressable flex w-full items-center gap-3 border-b border-[var(--border)] p-4 last:border-0"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="font-medium text-[var(--text)]">{title}</p>
        <p className="truncate text-sm text-[var(--text-muted)]">{subtitle}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-[var(--text-muted)]" strokeWidth={1.75} />
    </button>
  );

  return (
    <div>
      <div className="mx-auto max-w-2xl px-5 pt-6 pb-4 lg:max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-[var(--text)]">
          {t(lang, 'profile')}
        </h1>

        <div className="mb-6 rounded-[28px] bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700 p-6 text-white shadow-[0_16px_40px_rgba(0,102,255,0.3)]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur-md">
              {(data.profile.firstName || data.profile.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold tracking-tight">
                {data.profile.name || '—'}
              </h2>
              <p className="text-sm text-white/90">
                {t(lang, 'budgetLabel')}{' '}
                {new Intl.NumberFormat(localeFor(lang), {
                  style: 'currency',
                  currency: data.profile.currency,
                }).format(data.profile.budget || 0)}
              </p>
            </div>
          </div>
        </div>

        <Section title={t(lang, 'config')}>
          <MenuRow
            icon={User}
            tone="bg-blue-100 text-blue-600"
            title={t(lang, 'personalInfo')}
            subtitle={t(lang, 'personalInfoSub')}
            onClick={openPersonal}
          />
          <MenuRow
            icon={CircleDollarSign}
            tone="bg-emerald-100 text-emerald-600"
            title={t(lang, 'currency')}
            subtitle={currentCurrency.name}
            onClick={() => setShowCurrencyModal(true)}
          />
          <MenuRow
            icon={Bell}
            tone="bg-sky-100 text-sky-600"
            title={t(lang, 'notifications')}
            subtitle={t(lang, 'notificationsSub')}
          />
        </Section>

        <Section title={t(lang, 'appearance')}>
          <div className="divide-y divide-[var(--border)]">
            <AppleSwitch
              id="lang-switch"
              checked={lang === 'pt'}
              onChange={(on) => updateProfile({ language: on ? 'pt' : 'es' })}
              label={t(lang, 'language')}
              description={`${t(lang, 'spanish')}  ↔  ${t(lang, 'portuguese')}`}
            />
            <AppleSwitch
              id="theme-switch"
              checked={data.profile.theme === 'dark'}
              onChange={(on) => updateProfile({ theme: on ? 'dark' : 'light' })}
              label={t(lang, 'darkMode')}
              description={
                data.profile.theme === 'dark' ? t(lang, 'darkMode') : t(lang, 'lightMode')
              }
            />
          </div>
        </Section>

        <Section title={t(lang, 'data')}>
          <MenuRow
            icon={Download}
            tone="bg-emerald-100 text-emerald-600"
            title={t(lang, 'exportData')}
            subtitle={t(lang, 'exportSub')}
            onClick={handleExport}
          />
          <MenuRow
            icon={Upload}
            tone="bg-sky-100 text-sky-600"
            title={t(lang, 'importData')}
            subtitle={t(lang, 'importSub')}
            onClick={handleImport}
          />
        </Section>

        <Section title={t(lang, 'support')}>
          <MenuRow
            icon={HelpCircle}
            tone="bg-orange-100 text-orange-600"
            title={t(lang, 'help')}
            subtitle={t(lang, 'helpSub')}
          />
          <MenuRow
            icon={Shield}
            tone="bg-slate-100 text-slate-600"
            title={t(lang, 'privacy')}
            subtitle={t(lang, 'privacySub')}
          />
        </Section>

        <button
          type="button"
          onClick={handleClearData}
          className="pressable mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 p-4 font-medium text-red-600"
        >
          <Trash2 size={18} strokeWidth={1.75} />
          <span>{t(lang, 'clearAll')}</span>
        </button>

        <div className="mt-4 text-center text-sm text-[var(--text-muted)]">
          <p>Velora Finanzas v{data.version}</p>
          <p className="mt-1">{t(lang, 'localOnly')}</p>
        </div>
      </div>

      <BottomSheet
        open={showPersonalModal}
        onClose={() => setShowPersonalModal(false)}
        title={t(lang, 'personalInfo')}
      >
        <form onSubmit={savePersonal} className="space-y-4 pb-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">
                {t(lang, 'firstName')}
              </label>
              <input
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="field-input"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">
                {t(lang, 'lastName')}
              </label>
              <input
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="field-input"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">
              {t(lang, 'monthlyBudgetField')}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="field-input"
            />
            <p className="mt-2 text-xs text-[var(--text-muted)]">{t(lang, 'noBankNote')}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPersonalModal(false)}
              className="pressable flex-1 rounded-2xl bg-[var(--border)] py-3 font-medium text-[var(--text)]"
            >
              {t(lang, 'cancel')}
            </button>
            <button
              type="submit"
              className="pressable flex-1 rounded-2xl bg-blue-600 py-3 font-medium text-white"
            >
              {t(lang, 'save')}
            </button>
          </div>
        </form>
      </BottomSheet>

      <BottomSheet
        open={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        title={t(lang, 'selectCurrency')}
      >
        <div className="space-y-2 pb-2">
          {currencies.map((currency) => {
            const selected = data.profile.currency === currency.code;
            return (
              <button
                key={currency.code}
                type="button"
                onClick={async () => {
                  await updateProfile({ currency: currency.code });
                  setShowCurrencyModal(false);
                }}
                className={`pressable flex w-full items-center gap-4 rounded-2xl p-4 ${
                  selected
                    ? 'bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-950'
                    : 'bg-[var(--bg)]'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-lg font-semibold text-[var(--text)] shadow-sm">
                  {currency.symbol}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-[var(--text)]">{currency.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">{currency.code}</p>
                </div>
                {selected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Check size={14} strokeWidth={2.5} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowCurrencyModal(false)}
          className="pressable mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--border)] py-3 font-medium text-[var(--text)]"
        >
          <X size={16} />
          {t(lang, 'cancel')}
        </button>
      </BottomSheet>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {title}
      </h3>
      <div className="glass-card overflow-hidden rounded-[22px]">{children}</div>
    </div>
  );
}
