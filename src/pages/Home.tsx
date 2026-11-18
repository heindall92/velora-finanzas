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

  const recentTransactions = useMemo(() => data.transactions.slice(0, 6), [data.transactions]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);

  return (
    <div>
      <div className="px-5 pt-6 pb-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 text-lg font-semibold text-white">
              {data.profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-slate-500">Hola,</p>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                {data.profile.name}
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

        <div className="rounded-[28px] bg-gradient-to-br from-blue-500 via-violet-500 to-violet-600 p-6 text-white shadow-[0_16px_40px_rgba(124,58,237,0.35)]">
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
            <span>****3827 · este mes</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-2">
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Enviar', icon: Send, path: '/send', tone: 'bg-violet-100 text-violet-600' },
            { label: 'Recibir', icon: Download, path: '/receive', tone: 'bg-emerald-100 text-emerald-600' },
            { label: 'Recargar', icon: Plus, path: '/topup', tone: 'bg-sky-100 text-sky-600' },
            { label: 'Más', icon: MoreHorizontal, path: '/goals', tone: 'bg-slate-100 text-slate-600' },
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

      <div className="px-5 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Transacciones Recientes
          </h3>
          <button
            type="button"
            className="pressable text-sm font-medium text-violet-600"
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
