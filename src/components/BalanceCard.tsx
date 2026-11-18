import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import { useMemo } from 'react';
import { CARD_STYLES } from '../lib/cardColors';
import { periodRange, balance, totalOf } from '../lib/stats';
import { useApp } from '../state/AppState';
import { Masked } from './ui';

/** The "plastic": the one surface coloured by the person's chosen card colour. */
export default function BalanceCard() {
  const { data, t, money, updateProfile, today } = useApp();
  const { hideBalance, cardColor, firstName, lastName } = data.profile;
  const month = periodRange('month', today);
  const { bal, inc, out } = useMemo(
    () => ({
      bal: balance(data.transactions),
      inc: totalOf(data.transactions, 'income', month),
      out: totalOf(data.transactions, 'expense', month),
    }),
    [data.transactions, month.start, month.end], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <section
      className="relative overflow-hidden rounded-[1.5rem] p-5 text-white shadow-[0_18px_40px_-18px_rgb(0_40_120/0.55)] sm:p-6"
      style={{ background: CARD_STYLES[cardColor].bg }}
      aria-label={t('balance')}
    >
      {/* Light catching the material: one soft highlight, no decorative blobs. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgb(255_255_255/0.18),transparent_55%)]" aria-hidden="true" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/80">{t('balance')}</p>
          <button
            type="button"
            className="press -mr-2 grid h-10 w-10 place-items-center rounded-full text-white/85 hover:bg-white/10"
            onClick={() => updateProfile({ hideBalance: !hideBalance })}
            aria-label={hideBalance ? t('showBalance') : t('hideBalance')}
            aria-pressed={hideBalance}
          >
            {hideBalance ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
          </button>
        </div>
        <p className={`num display mt-1 text-[2.5rem] font-semibold sm:text-[2.75rem] ${bal < 0 ? 'text-[#ffd5d5]' : ''}`}>
          <Masked hidden={hideBalance}>{money(bal)}</Masked>
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-4">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-white/75">
              <ArrowDownLeft size={14} strokeWidth={2} aria-hidden="true" />
              {t('inThisMonth')}
            </p>
            <p className="num mt-0.5 text-base font-semibold">
              <Masked hidden={hideBalance}>{money(inc)}</Masked>
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-white/75">
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              {t('outThisMonth')}
            </p>
            <p className="num mt-0.5 text-base font-semibold">
              <Masked hidden={hideBalance}>{money(out)}</Masked>
            </p>
          </div>
        </div>
        <p className="mt-4 truncate text-xs font-medium uppercase tracking-[0.08em] text-white/60">
          {[firstName, lastName].filter(Boolean).join(' ')}
        </p>
      </div>
    </section>
  );
}
