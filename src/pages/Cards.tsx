import { Plus, ArrowUpRight, Settings, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveCardColor } from '../lib/cardColors';
import { localeFor, t } from '../i18n';

export default function Cards() {
  const { data } = useApp();
  const navigate = useNavigate();
  const lang = data.profile.language;
  const primaryCard = data.accounts[0];
  /** Color solo para el plástico de la tarjeta — no se propaga a botones ni avatares */
  const cardStyle = resolveCardColor(primaryCard?.color);

  const recentTransfers = useMemo(
    () => data.transactions.filter((tx) => tx.type === 'transfer' || tx.recipientName).slice(0, 4),
    [data.transactions]
  );

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(localeFor(lang), {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);

  const totalBalance = useMemo(
    () =>
      data.transactions.reduce((sum, tx) => {
        if (tx.type === 'income') return sum + tx.amount;
        if (tx.type === 'expense') return sum - tx.amount;
        return sum;
      }, 0),
    [data.transactions]
  );

  return (
    <div>
      <div className="mx-auto max-w-2xl px-5 pt-6 pb-4 lg:max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            {t(lang, 'myCards')}
          </h1>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="pressable rounded-2xl bg-blue-100 p-2.5 text-blue-600"
            aria-label={t(lang, 'settings')}
          >
            <Settings size={20} strokeWidth={2} />
          </button>
        </div>

        {primaryCard ? (
          <div
            className={`mb-6 rounded-[28px] bg-gradient-to-br p-6 text-white ${cardStyle.gradient} ${cardStyle.shadow}`}
          >
            <div className="mb-10 flex items-start justify-between">
              <div className="rounded-2xl bg-white/20 px-4 py-2.5 backdrop-blur-md">
                <p className="mb-1 text-xs text-white/90">{t(lang, 'availableBalance')}</p>
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
        ) : (
          <div className="glass-card mb-6 rounded-[28px] p-6 text-center text-[var(--text-muted)]">
            <CreditCard size={32} className="mx-auto mb-2 text-blue-600" strokeWidth={1.5} />
            <p>{t(lang, 'myCards')}</p>
          </div>
        )}

        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            {
              label: t(lang, 'addMoney'),
              icon: Plus,
              path: '/topup',
              tone: 'bg-sky-100 text-sky-600',
            },
            {
              label: t(lang, 'transfer'),
              icon: ArrowUpRight,
              path: '/send',
              tone: 'bg-blue-100 text-blue-600',
            },
            {
              label: t(lang, 'settings'),
              icon: Settings,
              path: '/profile',
              tone: 'bg-slate-100 text-[var(--text-muted)]',
            },
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
              <span className="text-center text-xs font-medium text-[var(--text)]">{label}</span>
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--text)]">
            {t(lang, 'recentTransfers')}
          </h3>
        </div>

        {recentTransfers.length === 0 ? (
          <div className="py-12 text-center text-[var(--text-muted)]">
            <p>{t(lang, 'noTransfers')}</p>
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-sm font-semibold text-white">
                  {(transaction.recipientName || 'T').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--text)]">
                    {transaction.recipientName || transaction.description}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {new Date(transaction.date).toLocaleDateString(localeFor(lang), {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums text-[var(--text)]">
                    -{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-emerald-600">{t(lang, 'completed')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
