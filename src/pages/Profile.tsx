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

const currencies = [
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
];

export default function Profile() {
  const { data, updateProfile, refreshData } = useApp();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [firstName, setFirstName] = useState(data.profile.firstName || '');
  const [lastName, setLastName] = useState(data.profile.lastName || '');
  const [budget, setBudget] = useState(String(data.profile.budget || ''));

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
      alert('Error al exportar los datos');
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
        alert('Datos importados correctamente');
      } catch {
        alert('Error al importar los datos. Verifica el archivo JSON.');
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (
      confirm(
        '¿Estás seguro de que quieres borrar todos los datos? Volverás a la pantalla inicial.'
      )
    ) {
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
      className="pressable flex w-full items-center gap-3 border-b border-slate-100 p-4 last:border-0"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={18} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="font-medium text-slate-900">{title}</p>
        <p className="truncate text-sm text-slate-500">{subtitle}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-slate-400" strokeWidth={1.75} />
    </button>
  );

  return (
    <div>
      <div className="mx-auto max-w-2xl px-5 pt-6 pb-4 lg:max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">Perfil</h1>

        <div className="mb-6 rounded-[28px] bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700 p-6 text-white shadow-[0_16px_40px_rgba(0,102,255,0.3)]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold backdrop-blur-md">
              {(data.profile.firstName || data.profile.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold tracking-tight">
                {data.profile.name || 'Tu perfil'}
              </h2>
              <p className="text-sm text-white/90">
                Presupuesto:{' '}
                {new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: data.profile.currency,
                }).format(data.profile.budget || 0)}
              </p>
            </div>
          </div>
        </div>

        <Section title="Configuración">
          <MenuRow
            icon={User}
            tone="bg-blue-100 text-blue-600"
            title="Información Personal"
            subtitle="Nombre, apellidos y presupuesto"
            onClick={openPersonal}
          />
          <MenuRow
            icon={CircleDollarSign}
            tone="bg-emerald-100 text-emerald-600"
            title="Moneda"
            subtitle={currentCurrency.name}
            onClick={() => setShowCurrencyModal(true)}
          />
          <MenuRow
            icon={Bell}
            tone="bg-sky-100 text-sky-600"
            title="Notificaciones"
            subtitle="Gestionar alertas"
          />
        </Section>

        <Section title="Datos">
          <MenuRow
            icon={Download}
            tone="bg-emerald-100 text-emerald-600"
            title="Exportar Datos"
            subtitle="Descargar backup JSON"
            onClick={handleExport}
          />
          <MenuRow
            icon={Upload}
            tone="bg-sky-100 text-sky-600"
            title="Importar Datos"
            subtitle="Restaurar desde backup JSON"
            onClick={handleImport}
          />
        </Section>

        <Section title="Soporte">
          <MenuRow
            icon={HelpCircle}
            tone="bg-orange-100 text-orange-600"
            title="Ayuda & Soporte"
            subtitle="Centro de ayuda"
          />
          <MenuRow
            icon={Shield}
            tone="bg-slate-100 text-slate-600"
            title="Seguridad & Privacidad"
            subtitle="Datos solo en tu dispositivo"
          />
        </Section>

        <button
          type="button"
          onClick={handleClearData}
          className="pressable mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 p-4 font-medium text-red-600"
        >
          <Trash2 size={18} strokeWidth={1.75} />
          <span>Borrar Todos los Datos</span>
        </button>

        <div className="mt-4 text-center text-sm text-slate-400">
          <p>Velora Finanzas v{data.version}</p>
          <p className="mt-1">Sin datos bancarios · Solo almacenamiento local</p>
        </div>
      </div>

      <BottomSheet
        open={showPersonalModal}
        onClose={() => setShowPersonalModal(false)}
        title="Información Personal"
      >
        <form onSubmit={savePersonal} className="space-y-4 pb-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Nombre</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-2xl bg-slate-50 p-4 outline-none ring-blue-500 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">Apellidos</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-2xl bg-slate-50 p-4 outline-none ring-blue-500 focus:ring-2"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Presupuesto mensual
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 p-4 outline-none ring-blue-500 focus:ring-2"
            />
            <p className="mt-2 text-xs text-slate-500">
              No pedimos dirección ni datos bancarios.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowPersonalModal(false)}
              className="pressable flex-1 rounded-2xl bg-slate-100 py-3 font-medium text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="pressable flex-1 rounded-2xl bg-blue-600 py-3 font-medium text-white"
            >
              Guardar
            </button>
          </div>
        </form>
      </BottomSheet>

      <BottomSheet
        open={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
        title="Seleccionar Moneda"
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
                  selected ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-slate-50'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-semibold text-slate-800 shadow-sm">
                  {currency.symbol}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-slate-900">{currency.name}</p>
                  <p className="text-sm text-slate-500">{currency.code}</p>
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
          className="pressable mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 font-medium text-slate-700"
        >
          <X size={16} />
          Cancelar
        </button>
      </BottomSheet>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <div className="glass-card overflow-hidden rounded-[22px]">{children}</div>
    </div>
  );
}
