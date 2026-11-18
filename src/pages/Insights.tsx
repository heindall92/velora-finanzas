import { PieChart, TrendingDown, TrendingUp } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import BankBadge from '../components/BankBadge';
import { DeltaText } from '../components/CategoryBreakdown';
import Donut, { type Slice } from '../components/Donut';
import { OTHERS, SERIES } from '../lib/palette';
import MoneyInput from '../components/MoneyInput';
import MonthStrip from '../components/MonthStrip';
import Sheet from '../components/Sheet';
import SpendChart from '../components/SpendChart';
import { CategoryBadge, EmptyState, PageHeader, Segmented, SectionTitle } from '../components/ui';
import { categoriesFor, categoryLabel } from '../lib/categories';
import { localeOf } from '../lib/i18n';
import { amountToInput, parseAmount } from '../lib/money';
import { byAccount, byCategory, comparableRanges, computeDelta, periodRange, spendingSeries, totalOf } from '../lib/stats';
import type { FlowType } from '../lib/types';
import { useApp } from '../state/AppState';

type Dim = 'category' | 'bank';

export default function Insights() {
  const { data, t, money, today } = useApp();
  const lang = data.profile.language;
  const locale = localeOf(lang);
  const [anchor, setAnchor] = useState(today);
  const [flow, setFlow] = useState<FlowType>('expense');
  const [dim, setDim] = useState<Dim>('category');
  const [limitFor, setLimitFor] = useState<string | null>(null);
  const txs = data.transactions;
  const accounts = data.accounts;

  const s = useMemo(() => {
    const range = periodRange('month', anchor);
    const cmp = comparableRanges('month', anchor, today);
    return {
      total: totalOf(txs, flow, range),
      delta: computeDelta(totalOf(txs, flow, cmp.current), totalOf(txs, flow, cmp.previous), 5),
      partial: cmp.partial,
      cats: byCategory(txs, flow, range),
      banks: byAccount(txs, flow, range),
      buckets: spendingSeries(txs, 'month', anchor, today, flow),
      spentByCat: new Map(byCategory(txs, 'expense', range).map((c) => [c.id, c.total])),
    };
  }, [txs, flow, anchor, today]);

  // Donut: top 5 + "outros", rank colours.
  const base =
    dim === 'category'
      ? s.cats.map((c) => ({ id: c.id, value: c.total, label: categoryLabel(c.id, lang), icon: <CategoryBadge id={c.id} size={22} /> }))
      : s.banks.map((b) => {
          const acc = accounts.find((a) => a.id === b.id) ?? null;
          return { id: b.id || 'none', value: b.total, label: acc?.name ?? t('noAccount'), icon: <BankBadge account={acc} size={22} /> };
        });
  const slices: Slice[] = base.slice(0, 5).map((x, i) => ({ ...x, color: SERIES[i] }));
  if (base.length > 5) slices.push({ id: 'rest', value: base.slice(5).reduce((a, x) => a + x.value, 0), color: OTHERS, label: t('others') });

  const title =
    dim === 'category' ? (flow === 'expense' ? t('spendingByCategory') : t('incomeByCategory')) : flow === 'expense' ? t('spendingByBank') : t('incomeByBank');

  // Every expense category that has spending this month or a limit, most spent first.
  const limits = data.profile.categoryLimits;
  const catRows = categoriesFor('expense')
    .map((c) => ({ c, spent: s.spentByCat.get(c.id) ?? 0, limit: limits[c.id] ?? 0 }))
    .filter((r) => r.spent > 0 || r.limit > 0)
    .sort((a, b) => b.spent - a.spent || b.limit - a.limit);

  return (
    <>
      <PageHeader title={t('navSpending')} />

      <div className="mb-4 lg:mb-6 lg:max-w-xl">
        <MonthStrip value={anchor} onChange={setAnchor} today={today} locale={locale} prevLabel={t('prevMonth')} nextLabel={t('nextMonth')} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-6">
        <div className="space-y-4 lg:col-span-7 lg:space-y-6">
          <section className="card p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-[0.9375rem] font-semibold text-ink">{title}</h2>
              {/* Same toggle as the apps he knows: red arrow down = spending, green up = income. */}
              <div className="flex shrink-0 gap-1 rounded-full bg-soft p-1" role="group" aria-label={t('navSpending')}>
                <button
                  type="button"
                  aria-pressed={flow === 'expense'}
                  aria-label={t('showSpending')}
                  title={t('showSpending')}
                  onClick={() => setFlow('expense')}
                  className={`press grid h-9 w-9 place-items-center rounded-full ${flow === 'expense' ? 'bg-down text-white' : 'text-ink-2'}`}
                >
                  <TrendingDown size={18} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-pressed={flow === 'income'}
                  aria-label={t('showIncome')}
                  title={t('showIncome')}
                  onClick={() => setFlow('income')}
                  className={`press grid h-9 w-9 place-items-center rounded-full ${flow === 'income' ? 'bg-money text-white' : 'text-ink-2'}`}
                >
                  <TrendingUp size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            <p className="text-[0.8125rem] text-muted">{flow === 'expense' ? t('totalSpent') : t('totalReceived')}</p>
            <p className={`num display mt-0.5 text-[1.75rem] font-semibold ${flow === 'income' ? 'text-money' : 'text-ink'}`}>{money(s.total)}</p>
            <p className="mb-4 mt-0.5">
              <DeltaText delta={s.delta} baseline={t('vsLastMonth')} tip={s.partial ? t('vsPrevSame') : t('vsPrevPeriod')} />
            </p>

            {accounts.length > 0 && (
              <div className="mb-4 w-full max-w-xs">
                <Segmented<Dim>
                  label={title}
                  value={dim}
                  onChange={setDim}
                  options={[
                    { value: 'category', label: t('byCat') },
                    { value: 'bank', label: t('byBank') },
                  ]}
                />
              </div>
            )}

            {slices.length ? (
              <Donut slices={slices} format={money} centerLabel={flow === 'expense' ? t('spent') : t('received')} centerValue={money(s.total)} />
            ) : (
              <EmptyState icon={PieChart} title={t('noSpendPeriod')} />
            )}
          </section>

          <section className="card p-4 sm:p-5">
            <SectionTitle>{t('dailySpending')}</SectionTitle>
            <SpendChart buckets={s.buckets} kind="month" />
          </section>
        </div>

        <section className="card p-2 sm:p-3 lg:col-span-5">
          <div className="px-2 pt-2">
            <SectionTitle>{t('categories')}</SectionTitle>
          </div>
          {catRows.length === 0 ? (
            <p className="px-2 pb-4 text-sm text-muted">{t('noSpendPeriod')}</p>
          ) : (
            <ul className="space-y-0.5">
              {catRows.map(({ c, spent, limit }) => {
                const ratio = limit ? spent / limit : 0;
                const over = limit > 0 && spent > limit;
                const near = limit > 0 && !over && ratio >= 0.8;
                const color = over ? 'var(--color-down)' : near ? 'var(--color-warn)' : 'var(--color-accent)';
                return (
                  <li key={c.id}>
                    <button type="button" onClick={() => setLimitFor(c.id)} className="press hover-soft flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left">
                      <CategoryBadge id={c.id} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[0.9375rem] font-medium text-ink">{c.label[lang]}</span>
                          <span className="num shrink-0 text-[0.9375rem] font-semibold text-ink">{money(spent)}</span>
                        </span>
                        {limit > 0 ? (
                          <>
                            <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line">
                              <span className="block h-full rounded-full" style={{ width: `${Math.min(ratio, 1) * 100}%`, background: color }} />
                            </span>
                            <span className="num mt-1 flex justify-between gap-2 text-xs">
                              <span className="text-muted">{t('limitOf', { spent: money(spent), limit: money(limit) })}</span>
                              <span style={{ color: over || near ? color : undefined }} className={over || near ? 'font-medium' : 'text-muted'}>
                                {over ? t('limitOver', { amount: money(spent - limit) }) : t('limitLeft', { amount: money(limit - spent) })}
                              </span>
                            </span>
                          </>
                        ) : (
                          <span className="mt-0.5 block text-[0.8125rem] font-medium text-accent-ink">+ {t('setLimit')}</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <LimitSheet category={limitFor} onClose={() => setLimitFor(null)} />
    </>
  );
}

function LimitSheet({ category, onClose }: { category: string | null; onClose: () => void }) {
  return <LimitInner key={category ?? 'closed'} category={category} onClose={onClose} />;
}

function LimitInner({ category, onClose }: { category: string | null; onClose: () => void }) {
  const { t, data, currency, setCategoryLimit, toast } = useApp();
  const current = category ? (data.profile.categoryLimits[category] ?? 0) : 0;
  const [value, setValue] = useState(amountToInput(current, currency));
  const id = useId();
  const hint = useId();
  const formId = useId();
  if (!category) return null;
  const name = categoryLabel(category, data.profile.language);

  return (
    <Sheet
      open
      onClose={onClose}
      title={t('limitTitle', { name })}
      closeLabel={t('close')}
      footer={
        <div className="flex gap-2">
          {current > 0 && (
            <button
              type="button"
              className="btn btn-secondary press flex-1"
              onClick={() => {
                setCategoryLimit(category, 0);
                onClose();
              }}
            >
              {t('removeLimit')}
            </button>
          )}
          <button type="submit" form={formId} className="btn btn-primary press flex-1">
            {t('save')}
          </button>
        </div>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setCategoryLimit(category, parseAmount(value) ?? 0);
          toast({ message: t('limitSaved') });
          onClose();
        }}
      >
        <div className="mb-4 flex items-center gap-3">
          <CategoryBadge id={category} />
          <span className="font-medium text-ink">{name}</span>
        </div>
        <label htmlFor={id} className="label">
          {t('setLimit')}
        </label>
        <MoneyInput id={id} currency={currency} size="lg" autoFocus value={value} onChange={(e) => setValue(e.target.value)} aria-describedby={hint} />
        <p id={hint} className="mt-2 text-[0.8125rem] text-muted">
          {t('limitHint')}
        </p>
      </form>
    </Sheet>
  );
}
