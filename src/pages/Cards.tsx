import { Plus, ArrowUpRight, Settings, CreditCard, Check, Palette } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomSheet from '../components/BottomSheet';
import { CARD_COLORS, resolveCardColor, type CardColorId } from '../lib/cardColors';

export default function Cards() {
  const { data, updateAccount } = useApp();
  const navigate = useNavigate();
  const [showColors, setShowColors] = useState(false);
  const primaryCard = data.accounts[0];
  const cardStyle = resolveCardColor(primaryCard?.color);

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

  const setCardColor = async (id: CardColorId) => {
    if (!primaryCard) return;
    await updateAccount(primaryCard.id, { color: id });
    setShowColors(false);
  };

  return (
    <div>
      <div className="mx-auto max-w-2xl px-5 pt-6 pb-4 lg:max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mis Tarjetas</h1>
          <button
            type="button"
            onClick={() => setShowColors(true)}
            className="pressable rounded-2xl bg-blue-100 p-2.5 text-blue-600"
            aria-label="Cambiar color de tarjeta"
          >
            <Palette size={20} strokeWidth={2} />
          </button>
        </div>

        {primaryCard && (
          <div
            className={`mb-4 rounded-[28px] bg-gradient-to-br p-6 text-white ${cardStyle.gradient} ${cardStyle.shadow}`}
          >
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
                <p className="mb-1 text-sm text-white/85">{primaryCard.name || 'Velora'}</p>
                <p className="font-mono text-lg tracking-widest">
                  **** **** **** {primaryCard.lastFour || '3827'}
                </p>
              </div>
              <div className="text-xl font-bold tracking-wide">VISA</div>
            </div>
          </div>
        )}

        {/* Selector rápido de color */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-medium text-slate-600">Color de la tarjeta</p>
          <div
            className="flex flex-wrap gap-3"
            role="radiogroup"
            aria-label="Color de la tarjeta"
          >
            {CARD_COLORS.map((c) => {
              const selected = cardStyle.id === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => setCardColor(c.id)}
                  className={`pressable relative h-11 w-11 rounded-full ${c.swatch} ${
                    selected ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                  }`}
                >
                  {selected && (
                    <span className="absolute inset-0 flex items-center justify-center text-white">
                      <Check size={16} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {cardStyle.label} · toca un color para personalizar
          </p>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Añadir Dinero', icon: Plus, path: '/topup', tone: 'bg-sky-100 text-sky-600' },
            {
              label: 'Transferir',
              icon: ArrowUpRight,
              path: '/send',
              tone: 'bg-blue-100 text-blue-600',
            },
            {
              label: 'Ajustes',
              icon: Settings,
              path: null,
              tone: 'bg-slate-100 text-slate-600',
              action: () => setShowColors(true),
            },
          ].map(({ label, icon: Icon, path, tone, action }) => (
            <button
              key={label}
              type="button"
              onClick={() => (action ? action() : path && navigate(path))}
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
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-semibold text-white ${cardStyle.gradient}`}
                >
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
      </div>

      <BottomSheet
        open={showColors}
        onClose={() => setShowColors(false)}
        title="Color de la tarjeta"
      >
        <div className="grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3">
          {CARD_COLORS.map((c) => {
            const selected = cardStyle.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCardColor(c.id)}
                className={`pressable flex flex-col items-center gap-3 rounded-2xl p-4 ${
                  selected ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-slate-50'
                }`}
              >
                <div
                  className={`h-16 w-full rounded-2xl bg-gradient-to-br ${c.gradient} ${c.shadow}`}
                />
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  {selected && <Check size={14} className="text-blue-600" strokeWidth={2.5} />}
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
