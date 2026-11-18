import { useNavigate } from 'react-router-dom';
import { budgetStatus } from '../lib/stats';
import { useApp } from '../state/AppState';
import { Gauge } from 'lucide-react';

/**
 * Target tile (dashboard-design): value, goal and what is left on one tile, with a tick bar.
 * The question it answers: "can I keep spending like this?" — pace vs the calendar, not just a total.
 */
export default function BudgetTile() {
  const { data, t, money, today } = useApp();
  const navigate = useNavigate();
  const s = budgetStatus(data.transactions, data.profile.budget, today);

  if (s.pace === 'none') {
    return (
      <section className="card flex items-center gap-3 p-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-soft text-muted">
          <Gauge size={20} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <p className="flex-1 text-sm font-medium text-ink-2">{t('noBudget')}</p>
        <button type="button" className="btn btn-secondary press min-h-10 px-3.5 text-sm" onClick={() => navigate('/settings#budget')}>
          {t('setBudget')}
        </button>
      </section>
    );
  }

  const color = s.pace === 'over' ? 'var(--color-down)' : s.pace === 'warn' ? 'var(--color-warn)' : 'var(--color-accent)';
  const paceLabel = s.pace === 'over' ? t('budgetPaceOver') : s.pace === 'warn' ? t('budgetPaceWarn') : t('budgetPaceOk');
  const tip = t('budgetPaceTip', { spent: `${Math.round(s.ratio * 100)}%`, elapsed: `${Math.round(s.elapsed * 100)}%` });

  return (
    <section className="rounded-[1.25rem] border border-line bg-soft p-1.5" aria-label={t('budget')}>
      <div className="flex items-center justify-between px-2.5 pb-2 pt-1.5">
        <h2 className="text-[0.8125rem] font-medium text-ink-2">{t('budget')}</h2>
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)` }}
          title={tip}
        >
          {paceLabel}
        </span>
      </div>
      <div className="rounded-[0.95rem] border border-line bg-card p-4">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="num display text-[1.75rem] font-semibold text-ink">{money(s.spent)}</span>
          <span className="num text-[0.8125rem] text-muted">{t('budgetOf', { total: money(s.budget) })}</span>
        </p>
        <div className="relative mt-3">
          <div
            className="ticks"
            style={{ '--fill': Math.min(s.ratio, 1), '--tick-color': color } as React.CSSProperties}
            role="meter"
            aria-valuemin={0}
            aria-valuemax={s.budget}
            aria-valuenow={Math.min(s.spent, s.budget)}
            aria-label={t('budget')}
            title={tip}
          />
          {/* Where the calendar is: spending left of this line is on pace. */}
          <div
            className="absolute -bottom-1 -top-1 w-[2px] rounded-full bg-ink/70"
            style={{ left: `calc(${(s.elapsed * 100).toFixed(2)}% - 1px)` }}
            aria-hidden="true"
            title={tip}
          />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-[0.8125rem]">
          <span className={`num font-medium ${s.left < 0 ? 'text-down' : 'text-ink'}`}>
            {s.left >= 0 ? t('budgetLeft', { amount: money(s.left) }) : t('budgetOver', { amount: money(-s.left) })}
          </span>
          {s.left > 0 && (
            <span className="num text-muted">
              {s.daysLeft === 1 ? t('budgetPerDayOne', { amount: money(s.perDay) }) : t('budgetPerDay', { amount: money(s.perDay), days: s.daysLeft })}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
