import { Send, Download, Plus, MoreHorizontal, Eye, EyeOff, Bell, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon, categoryStyles } from '../components/icons';

export default function Home() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [hideBalance, setHideBalance] = useState(false);

  const totalBalance = useMemo(() => {
    return data.transactions.reduce((sum, t) => {
      if (t.type === 'income') return sum + t.amount;
      if (t.type === 'expense') return sum - t.amount;
      return sum;
    }, 0);
  }, [data.transactions]);

  const monthSpending = useMemo(() => {
    const now = new Date();
    return data.transactions
      .filter((t) => {
        const d = new Date(t.date);
        return (
          t.type === 'expense' &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [data.transactions]);

  const budget = data.profile.budget || 0;
  const budgetLeft = Math.max(budget - monthSpending, 0);
  const budgetPct = budget > 0 ? Math.min((monthSpending / budget) * 100, 100) : 0;

  const recentTransactions = useMemo(() => data.transactions.slice(0, 8), [data.transactions]);
  const displayName =
    data.profile.firstName || data.profile.name.split(' ')[0] || data.profile.name;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);

  return (
    <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:p-6">
      <div className="lg:col-span-3">
        <div className="px-5 pt-6 pb-4 lg:px-0 lg:pt-0">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-semibold text-white">
                {(displayName || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-slate-500">Hola,</p>
                <p className="text-lg font-semibold tracking-tight text-slate-900">
                  {displayName}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="pressable rounded-2xl p-2.5 text-slate-600"
              aria-label="Notificaciones"
            >
              <Bell size={22} strokeWidth={1.75} />
            </button>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700 p-6 text-white shadow-[0_16px_40px_rgba(0,102,255,0.35)]">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-white/90">Saldo Total</p>
              <button
                type="button"
                className="pressable rounded-full p-1.5 hover:bg-white/15"
                onClick={() => setHideBalance((v) => !v)}
                aria-label={hideBalance ? 'Mostrar saldo' : 'Ocultar saldo'}
              >
                {hideBalance ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <h2 className="mb-2 text-4xl font-bold tracking-tight">
              {hideBalance ? '••••••' : formatCurrency(totalBalance)}
            </h2>
            <div className="flex items-center gap-2 text-sm text-white/85">
              <CreditCard size={14} strokeWidth={1.75} />
              <span>
                Presupuesto {hideBalance ? '••••' : formatCurrency(budget)} · este mes
              </span>
            </div>
          </div>

          {budget > 0 && (
            <div className="glass-card mt-4 rounded-[22px] p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">Presupuesto del mes</span>
                <span className="tabular-nums text-slate-500">
                  {formatCurrency(monthSpending)} / {formatCurrency(budget)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-[width] duration-500"
                  style={{
                    width: `${budgetPct}%`,
                    transitionTimingFunction: 'var(--ease-out)',
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Quedan {formatCurrency(budgetLeft)} este mes
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-2 lg:px-0">
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { label: 'Enviar', icon: Send, path: '/send', tone: 'bg-blue-100 text-blue-600' },
              {
                label: 'Recibir',
                icon: Download,
                path: '/receive',
                tone: 'bg-emerald-100 text-emerald-600',
              },
              { label: 'Recargar', icon: Plus, path: '/topup', tone: 'bg-sky-100 text-sky-600' },
              {
                label: 'Más',
                icon: MoreHorizontal,
                path: '/goals',
                tone: 'bg-slate-100 text-slate-600',
              },
            ].map(({ label, icon: Icon, path, tone }) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate(path)}
                className="pressable flex flex-col items-center gap-2 rounded-2xl p-3"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <span className="text-xs font-medium text-slate-700">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 lg:col-span-2 lg:px-0 lg:py-0">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Transacciones Recientes
          </h3>
          <button
            type="button"
            className="pressable text-sm font-medium text-blue-600"
            onClick={() => navigate('/analytics')}
          >
            Ver todo
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p>No hay transacciones aún</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((transaction) => (
              <button
                key={transaction.id}
                type="button"
                onClick={() => navigate(`/transaction/${transaction.id}`)}
                className="pressable glass-card flex w-full items-center gap-3 rounded-2xl p-3.5 text-left"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    categoryStyles[transaction.category] || categoryStyles.Other
                  }`}
                >
                  <CategoryIcon category={transaction.category} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {transaction.recipientName || transaction.category}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(transaction.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <p
                  className={`shrink-0 font-semibold tabular-nums ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
