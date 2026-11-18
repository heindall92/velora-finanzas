import { Plus, ArrowUpRight, Settings, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cards() {
  const { data } = useApp();
  const navigate = useNavigate();
  const primaryCard = data.accounts[0];

  const recentTransfers = useMemo(
    () => data.transactions.filter((t) => t.type === 'transfer' || t.recipientName).slice(0, 4),
    [data.transactions]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);

  const totalBalance = useMemo(
    () =>
      data.transactions.reduce((sum, t) => {
        if (t.type === 'income') return sum + t.amount;
        if (t.type === 'expense') return sum - t.amount;
        return sum;
      }, 0),
    [data.transactions]
  );

  return (
    <div>
      <div className="px-5 pt-6 pb-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mis Tarjetas</h1>
          <button
            type="button"
            className="pressable rounded-2xl bg-violet-100 p-2.5 text-violet-600"
            aria-label="Añadir tarjeta"
          >
            <Plus size={20} strokeWidth={2} />
          </button>
        </div>

        {primaryCard && (
          <div className="mb-6 rounded-[28px] bg-gradient-to-br from-blue-500 via-violet-500 to-violet-600 p-6 text-white shadow-[0_16px_40px_rgba(124,58,237,0.35)]">
            <div className="mb-10 flex items-start justify-between">
              <div className="rounded-2xl bg-white/20 px-4 py-2.5 backdrop-blur-md">
                <p className="mb-1 text-xs text-white/90">Saldo disponible</p>
                <p className="text-2xl font-bold tracking-tight tabular-nums">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                <CreditCard size={22} strokeWidth={1.75} />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="mb-1 text-sm text-white/85">Número de tarjeta</p>
                <p className="font-mono text-lg tracking-widest">
                  **** **** **** {primaryCard.lastFour || '3827'}
                </p>
              </div>
              <div className="text-xl font-bold tracking-wide">VISA</div>
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Añadir Dinero', icon: Plus, path: '/topup', tone: 'bg-sky-100 text-sky-600' },
            {
              label: 'Transferir',
              icon: ArrowUpRight,
              path: '/send',
              tone: 'bg-violet-100 text-violet-600',
            },
            { label: 'Ajustes', icon: Settings, path: '/profile', tone: 'bg-slate-100 text-slate-600' },
          ].map(({ label, icon: Icon, path, tone }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(path)}
              className="pressable glass-card flex flex-col items-center gap-2 rounded-2xl p-4"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <span className="text-center text-xs font-medium text-slate-700">{label}</span>
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Transferencias Recientes
          </h3>
        </div>

        {recentTransfers.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p>No hay transferencias aún</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentTransfers.map((transaction) => (
              <button
                key={transaction.id}
                type="button"
                onClick={() => navigate(`/transaction/${transaction.id}`)}
                className="pressable glass-card flex w-full items-center gap-3 rounded-2xl p-4 text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500 text-sm font-semibold text-white">
                  {(transaction.recipientName || 'T').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {transaction.recipientName || transaction.description}
                  </p>
                  <p className="text-sm text-slate-500">
                    {new Date(transaction.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums text-slate-900">
                    -{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-emerald-600">Completado</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="pressable mt-6 w-full rounded-2xl border-2 border-dashed border-slate-200 py-4 font-medium text-slate-500"
        >
          + Añadir nueva tarjeta
        </button>
      </div>
    </div>
  );
}
