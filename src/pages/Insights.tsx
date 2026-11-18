import { BarChart3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CategoryBreakdown, DeltaText } from '../components/CategoryBreakdown';
import SpendChart from '../components/SpendChart';
import { EmptyState, PageHeader, PeriodStepper, Segmented, SectionTitle } from '../components/ui';
import { diffDays, fromDayKey } from '../lib/dates';
import { capFirst, localeOf } from '../lib/i18n';
import { roundCents } from '../lib/money';
import {
  byCategory,
  comparableRanges,
  computeDelta,
  isFuturePeriod,
  periodRange,
  shiftAnchor,
  spendingSeries,
  totalOf,
  type PeriodKind,
} from '../lib/stats';
import { useApp } from '../state/AppState';

export default function Insights() {
  const { data, t, money, today } = useApp();
  const locale = localeOf(data.profile.language);
  const [kind, setKind] = useState<PeriodKind>('month');
  const [anchor, setAnchor] = useState(today);
  const txs = data.transactions;

  const s = useMemo(() => {
    const range = periodRange(kind, anchor);
    const cmp = comparableRanges(kind, anchor, today);
    const spent = totalOf(txs, 'expense', range);
    const received = totalOf(txs, 'income', range);
    const spentCmp = totalOf(txs, 'expense', cmp.current);
    const spentPrev = totalOf(txs, 'expense', cmp.previous);
    const buckets = spendingSeries(txs, kind, anchor, today);
    const elapsedDays = diffDays(fromDayKey(cmp.current.end), fromDayKey(range.start)) + 1;
    const past = buckets.filter((b) => !b.future);
    const biggest = past.reduce<(typeof buckets)[number] | null>((m, b) => (b.total > (m?.total ?? 0) ? b : m), null);
    return {
      range,
      spent,
      received,
      delta: computeDelta(spentCmp, spentPrev, 5),
      partial: cmp.partial,
      buckets,
      avg: elapsedDays > 0 ? roundCents(spentCmp / elapsedDays) : 0,
      biggest,
      cats: byCategory(txs, 'expense', range),
    };
  }, [txs, kind, anchor, today]);

  const label =
    kind === 'year'
      ? String(anchor.getFullYear())
      : kind === 'month'
        ? capFirst(anchor.toLocaleDateString(locale, { month: 'long', year: 'numeric' }))
        : `${fromDayKey(s.range.start).toLocaleDateString(locale, { day: 'numeric', month: 'short' })} – ${fromDayKey(s.range.end).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}`;

  // One short baseline on screen; the precise meaning (same elapsed days) goes in the tooltip.
  const baseline = kind === 'month' ? t('vsLastMonth') : t('vsPrevPeriod');
  const baselineTip = s.partial ? t('vsPrevSame') : t('vsPrevPeriod');
  const biggestLabel = s.biggest
    ? capFirst(kind === 'year' ? s.biggest.at.toLocaleDateString(locale, { month: 'long' }) : s.biggest.at.toLocaleDateString(locale, { weekday: 'short', day: 'numeric' }))
    : '—';

  return (
    <>
      <PageHeader title={t('navInsights')} />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-72">
          <Segmented
            label={t('navInsights')}
            value={kind}
            onChange={(k) => {
              setKind(k);
              setAnchor(today);
            }}
            options={[
              { value: 'week', label: t('week') },
              { value: 'month', label: t('month') },
              { value: 'year', label: t('year') },
            ]}
          />
        </div>
        <PeriodStepper
          label={label}
          onPrev={() => setAnchor((a) => shiftAnchor(kind, a, -1))}
          onNext={() => setAnchor((a) => shiftAnchor(kind, a, 1))}
          nextDisabled={isFuturePeriod(kind, shiftAnchor(kind, anchor, 1), today)}
          prevLabel={t('prevPeriod')}
          nextLabel={t('nextPeriod')}
        />
      </div>

      {/* KPI strip: separate tiles that only report. */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:mb-6 lg:grid-cols-4 lg:gap-4">
        <div className="card col-span-2 p-4 lg:col-span-1">
          <p className="text-[0.8125rem] font-medium text-ink-2">{t('spent')}</p>
          <p className="num display mt-1.5 text-[1.75rem] font-semibold text-ink">{money(s.spent)}</p>
          <p className="mt-1">
            <DeltaText delta={s.delta} baseline={baseline} tip={baselineTip} />
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[0.8125rem] font-medium text-ink-2">{t('received')}</p>
          <p className="num display mt-1.5 text-xl font-semibold text-money lg:text-[1.75rem]">{money(s.received)}</p>
        </div>
        <div className="card p-4">
          <p className="text-[0.8125rem] font-medium text-ink-2">{t('avgPerDay')}</p>
          <p className="num display mt-1.5 text-xl font-semibold text-ink lg:text-[1.75rem]">{s.spent > 0 ? money(s.avg) : '—'}</p>
        </div>
        <div className="card hidden p-4 lg:block">
          <p className="text-[0.8125rem] font-medium text-ink-2">{t('biggestDay')}</p>
          <p className="num display mt-1.5 text-[1.75rem] font-semibold text-ink">{s.biggest ? money(s.biggest.total) : '—'}</p>
          <p className="mt-1 text-[0.8125rem] text-muted">{biggestLabel}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start lg:gap-6">
        <section className="card p-4 sm:p-5 lg:col-span-7">
          <SectionTitle>{t('chartLabel', { unit: kind === 'year' ? t('unitMonth') : t('unitDay') })}</SectionTitle>
          <SpendChart buckets={s.buckets} kind={kind} />
        </section>
        <section className="card p-3 sm:p-4 lg:col-span-5">
          <div className="px-2 pt-1">
            <SectionTitle>{t('byCategory')}</SectionTitle>
          </div>
          {s.cats.length ? <CategoryBreakdown items={s.cats} limit={8} /> : <EmptyState icon={BarChart3} title={t('noSpendPeriod')} />}
        </section>
      </div>
    </>
  );
}
