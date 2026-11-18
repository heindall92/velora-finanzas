import { useId, useState } from 'react';
import { Wallet, ArrowRight, Download, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportData, importData } from '../storage';

const currencies = [
  { code: 'BRL', label: 'R$ Real', symbol: 'R$' },
  { code: 'USD', label: '$ Dólar', symbol: '$' },
  { code: 'EUR', label: '€ Euro', symbol: '€' },
] as const;

export default function Onboarding() {
  const { completeOnboarding, refreshData } = useApp();
  const formTitleId = useId();
  const firstId = useId();
  const lastId = useId();
  const budgetId = useId();
  const budgetHelpId = useId();
  const errorId = useId();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('BRL');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const symbol = currencies.find((c) => c.code === currency)?.symbol ?? 'R$';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName.trim() || !lastName.trim()) {
      setError('Indica tu nombre y apellidos.');
      return;
    }

    const budgetValue = parseFloat(budget.replace(',', '.'));
    if (budget === '' || Number.isNaN(budgetValue) || budgetValue < 0) {
      setError('Indica un presupuesto válido (puede ser 0).');
      return;
    }

    setSubmitting(true);
    try {
      await completeOnboarding({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        budget: budgetValue,
        currency,
      });
    } catch {
      setError('No se pudo guardar. Inténtalo de nuevo.');
      setSubmitting(false);
    }
  };

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
      setError('Error al exportar.');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async (ev) => {
      const file = (ev.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        await importData(await file.text());
        await refreshData();
      } catch {
        setError('JSON inválido. Revisa el archivo.');
      }
    };
    input.click();
  };

  return (
    <div className="onboarding-shell min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col lg:flex-row">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700 px-10 py-12 text-white lg:flex lg:w-[42%] lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Wallet size={28} strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight">Velora</h1>
            <p className="max-w-sm text-lg text-white/90">
              Empieza con una cuenta limpia. Solo nombre, apellidos y presupuesto.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-white/85">
            <li>· Sin datos bancarios ni dirección</li>
            <li>· Sin datos de ejemplo: tú decides qué registrar</li>
            <li>· Exporta / importa JSON cuando quieras</li>
          </ul>
        </aside>

        <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white">
                <Wallet size={22} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h1 id={formTitleId} className="text-3xl font-bold tracking-tight text-[var(--text)]">
                Velora
              </h1>
              <p className="mt-2 text-[var(--text-muted)]">
                Cuenta limpia. Nombre, apellidos y presupuesto — nada más.
              </p>
            </div>

            <div className="mb-8 hidden lg:block">
              <h2 id={formTitleId} className="text-2xl font-bold tracking-tight text-[var(--text)]">
                Configura tu perfil
              </h2>
              <p className="mt-2 text-[var(--text-muted)]">
                Empezarás sin transacciones ni metas. Sin dirección ni datos bancarios.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              aria-labelledby={formTitleId}
              aria-describedby={error ? errorId : undefined}
              className="glass-card space-y-5 rounded-[28px] p-6 sm:p-8"
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="field">
                  <label htmlFor={firstId} className="mb-2 block text-sm font-medium text-slate-600">
                    Nombre <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={firstId}
                    name="given-name"
                    type="text"
                    autoComplete="given-name"
                    enterKeyHint="next"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nombre"
                    className="field-input"
                    required
                  />
                  <p className="field-error">Indica tu nombre.</p>
                </div>
                <div className="field">
                  <label htmlFor={lastId} className="mb-2 block text-sm font-medium text-slate-600">
                    Apellidos <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id={lastId}
                    name="family-name"
                    type="text"
                    autoComplete="family-name"
                    enterKeyHint="next"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Apellidos"
                    className="field-input"
                    required
                  />
                  <p className="field-error">Indica tus apellidos.</p>
                </div>
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-600">Moneda</legend>
                <div className="grid grid-cols-3 gap-2">
                  {currencies.map((c) => (
                    <label
                      key={c.code}
                      className={`pressable flex cursor-pointer items-center justify-center rounded-2xl px-3 py-3 text-sm font-medium ${
                        currency === c.code
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : 'bg-[var(--bg)] text-[var(--text)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="currency"
                        value={c.code}
                        checked={currency === c.code}
                        onChange={() => setCurrency(c.code)}
                        className="sr-only"
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="field">
                <label htmlFor={budgetId} className="mb-2 block text-sm font-medium text-slate-600">
                  Presupuesto mensual <span aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-blue-600">
                    {symbol}
                  </span>
                  <input
                    id={budgetId}
                    name="budget"
                    type="text"
                    inputMode="decimal"
                    enterKeyHint="done"
                    autoComplete="off"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0.00"
                    aria-describedby={budgetHelpId}
                    className="field-input pl-14 text-lg font-semibold"
                    required
                  />
                </div>
                <p id={budgetHelpId} className="mt-2 text-xs text-[var(--text-muted)]">
                  Será tu saldo inicial. La cuenta queda vacía de movimientos de ejemplo.
                </p>
              </div>

              {error && (
                <p id={errorId} role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="pressable flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-700 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 disabled:opacity-60"
              >
                {submitting ? 'Guardando…' : 'Empezar'}
                {!submitting && <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleImport}
                className="pressable flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[var(--text)] shadow-sm"
              >
                <Upload size={16} strokeWidth={1.75} aria-hidden="true" />
                Importar JSON
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="pressable flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-[var(--text)] shadow-sm"
              >
                <Download size={16} strokeWidth={1.75} aria-hidden="true" />
                Exportar JSON
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
