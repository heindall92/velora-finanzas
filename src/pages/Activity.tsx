import { ReceiptText, Search, SearchX } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BankBadge from '../components/BankBadge';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { useEntry } from '../components/EntrySheet';
import TxList from '../components/TxList';
import { EmptyState, PageHeader, PeriodStepper, Segmented, SectionTitle } from '../components/ui';
import { categoryLabel } from '../lib/categories';
import { addMonths, startOfMonth } from '../lib/dates';
import { capFirst, localeOf } from '../lib/i18n';
import { formatSigned, sumMoney } from '../lib/money';
import { byCategory, periodRange, sortTransactions } from '../lib/stats';
import type { TxType } from '../lib/types';
import { useApp } from '../state/AppState';

type Filter = 'all' | TxType;

/** Accent- and case-insensitive: "cafe" finds "Café". */
const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export default function Activity() {
  const { data, t, today, money, currency } = useApp();
  const { openNew } = useEntry();
  const lang = data.profile.language;
  const [anchor, setAnchor] = useState(() => startOfMonth(today));
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const q = fold(useDeferredValue(query).trim());
  // ?account=<id> | none — set by tapping an account in Contas.
  const [params, setParams] = useSearchParams();
  const acc = params.get('account') ?? '';
  const accounts = data.accounts;
  const selectedAccount = accounts.find((a) => a.id === acc) ?? null;
  const setAcc = (v: string) => setParams(v ? { account: v } : {}, { replace: true });
  const accountMatch = (x: { accountId?: string; toAccountId?: string; type: string }) =>
    !acc || (acc === 'none' ? !x.accountId && x.type !== 'transfer' : x.accountId === acc || x.toAccountId === acc);

  const range = periodRange('month', anchor);
  const isCurrent = anchor.getFullYear() === today.getFullYear() && anchor.getMonth() === today.getMonth();

  const monthTx = useMemo(
    () => sortTransactions(data.transactions.filter((x) => x.date >= range.start && x.date <= range.end)),
    [data.transactions, range.start, range.end],
  );
  const shown = useMemo(
    () =>
      monthTx.filter(
        (x) =>
          (filter === 'all' || x.type === filter) &&
          accountMatch(x) &&
          (!q || fold(x.note).includes(q) || fold(categoryLabel(x.category, lang)).includes(q) || x.amount.toFixed(2).includes(q.replace(',', '.'))),
      ),
    [monthTx, filter, q, lang, acc], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const inc = sumMoney(shown.filter((x) => x.type === 'income').map((x) => x.amount));
  const out = sumMoney(shown.filter((x) => x.type === 'expense').map((x) => x.amount));
  const cats = useMemo(() => byCategory(shown, 'expense', range), [shown, range.start]); // eslint-disable-line react-hooks/exhaustive-deps

  const monthLabel = capFirst(anchor.toLocaleDateString(localeOf(lang), { month: 'long', year: 'numeric' }));

  return (
    <>
      <PageHeader
        title={t('navActivity')}
        actions={
          <PeriodStepper
            label={monthLabel}
            onPrev={() => setAnchor((a) => addMonths(a, -1))}
            onNext={() => setAnchor((a) => addMonths(a, 1))}
            nextDisabled={isCurrent}
            prevLabel={t('prevMonth')}
            nextLabel={t('nextMonth')}
          />
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem] lg:gap-6">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">{t('searchPlaceholder')}</span>
              <Search size={18} strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                type="search"
                className="field pl-10"
                placeholder={t('searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                enterKeyHint="search"
                autoComplete="off"
              />
            </label>
            <div className="sm:w-72">
              <Segmented
                label={t('filterAll')}
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: t('filterAll') },
                  { value: 'expense', label: t('filterExpense') },
                  { value: 'income', label: t('filterIncome') },
                ]}
              />
            </div>
          </div>

          {(accounts.length > 0 || acc) && (
            <label className="relative flex items-center">
              <span className="sr-only">{t('account')}</span>
              <span className="pointer-events-none absolute left-2.5">
                <BankBadge account={selectedAccount} size={28} />
              </span>
              {/* Native select: on iPhone it opens the system wheel picker. */}
              <select className="field appearance-none pl-12 pr-9" value={acc} onChange={(e) => setAcc(e.target.value)}>
                <option value="">{t('allAccounts')}</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
                <option value="none">{t('noAccount')}</option>
              </select>
              <span className="pointer-events-none absolute right-3.5 text-muted" aria-hidden="true">▾</span>
            </label>
          )}

          {/* Totals for what is on screen; on desktop they live in the side panel. */}
          {shown.length > 0 && (
            <div className="flex items-center justify-between px-1 text-[0.8125rem] lg:hidden">
              <span className="text-muted">{shown.length === 1 ? t('entriesCountOne') : t('entriesCount', { count: shown.length })}</span>
              <span className="num space-x-3">
                {inc > 0 && <span className="font-medium text-money">{formatSigned(inc, currency, '+')}</span>}
                {out > 0 && <span className="font-medium text-ink">{formatSigned(out, currency, '-')}</span>}
              </span>
            </div>
          )}

          <section className="card p-2 sm:p-3">
            {shown.length > 0 ? (
              <TxList txs={shown} />
            ) : monthTx.length > 0 ? (
              <EmptyState icon={SearchX} title={t('noResults')} body={t('noResultsBody')} />
            ) : (
              <EmptyState
                icon={ReceiptText}
                title={t('emptyMonth')}
                action={
                  <button type="button" className="btn btn-primary press" onClick={() => openNew()}>
                    {t('newEntry')}
                  </button>
                }
              />
            )}
          </section>
        </div>

        <aside className="hidden space-y-4 lg:block">
          <section className="card divide-y divide-line">
            <div className="p-4">
              <p className="text-[0.8125rem] text-muted">{t('received')}</p>
              <p className="num display mt-1 text-2xl font-semibold text-money">{money(inc)}</p>
            </div>
            <div className="p-4">
              <p className="text-[0.8125rem] text-muted">{t('spent')}</p>
              <p className="num display mt-1 text-2xl font-semibold text-ink">{money(out)}</p>
            </div>
            <div className="p-4">
              <p className="text-[0.8125rem] text-muted">{t('net')}</p>
              <p className={`num display mt-1 text-2xl font-semibold ${inc - out < 0 ? 'text-down' : 'text-ink'}`}>
                {formatSigned(inc - out, currency, inc - out < 0 ? '-' : '+')}
              </p>
            </div>
          </section>
          {cats.length > 0 && (
            <section className="card p-3">
              <div className="px-2 pt-1">
                <SectionTitle>{t('byCategory')}</SectionTitle>
              </div>
              <CategoryBreakdown items={cats} limit={6} />
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
