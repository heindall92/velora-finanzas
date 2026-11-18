import { ArrowDownLeft, ArrowUpRight, ChevronRight, Lock, ReceiptText } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard';
import BudgetTile from '../components/BudgetTile';
import { CategoryBreakdown } from '../components/CategoryBreakdown';
import { useEntry } from '../components/EntrySheet';
import InstallBanner from '../components/InstallBanner';
import TxList from '../components/TxList';
import { GOAL_ICON_MAP } from '../components/goalIcons';
import { EmptyState, SectionTitle } from '../components/ui';
import { capFirst, localeOf } from '../lib/i18n';
import { byCategory, goalPlan, periodRange, sortTransactions } from '../lib/stats';
import { useApp } from '../state/AppState';

export default function Home() {
  const { data, t, today, pinEnabled, lock, money } = useApp();
  const { openNew } = useEntry();
  const navigate = useNavigate();
  const { firstName } = data.profile;
  const locale = localeOf(data.profile.language);

  const recent = useMemo(() => sortTransactions(data.transactions).slice(0, 6), [data.transactions]);
  const month = periodRange('month', today);
  const cats = useMemo(() => byCategory(data.transactions, 'expense', month), [data.transactions, month.start]); // eslint-disable-line react-hooks/exhaustive-deps
  const empty = data.transactions.length === 0;

  const dateLine = capFirst(today.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' }));

  return (
    <>
      <header className="flex items-center justify-between gap-3 pb-5 pt-2 lg:pt-0">
        <div className="min-w-0">
          <p className="text-[0.8125rem] font-medium text-muted">{dateLine}</p>
          <h1 className="display truncate text-[1.75rem] font-bold text-ink lg:text-[2rem]">
            {firstName ? t('greeting', { name: firstName }) : t('greetingNoName')}
          </h1>
        </div>
        <div className="flex items-center gap-1 lg:hidden">
          {pinEnabled && (
            <button type="button" className="icon-btn press" onClick={lock} aria-label={t('lockNow')}>
              <Lock size={19} strokeWidth={1.75} />
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="press grid h-10 w-10 place-items-center rounded-full bg-card text-[0.9375rem] font-semibold text-ink-2 shadow-[var(--shadow-card)] ring-1 ring-line"
            aria-label={t('navSettings')}
          >
            {(firstName || '?').charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      <InstallBanner />

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-7">
          <BalanceCard />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-5">
          <BudgetTile />
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="btn btn-secondary press card h-14 justify-start gap-3 border-line px-4" onClick={() => openNew('expense')} aria-label={t('addExpense')}>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-down/10 text-down">
                <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="truncate text-sm">{t('expense')}</span>
            </button>
            <button type="button" className="btn btn-secondary press card h-14 justify-start gap-3 border-line px-4" onClick={() => openNew('income')} aria-label={t('addIncome')}>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-money/10 text-money">
                <ArrowDownLeft size={17} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="truncate text-sm">{t('income')}</span>
            </button>
          </div>
        </div>

        <section className="card p-3 sm:p-4 lg:col-span-7">
          <div className="px-2 pt-1">
            <SectionTitle
              action={
                !empty && (
                  <Link to="/activity" className="press flex items-center gap-0.5 text-sm font-medium text-accent-ink">
                    {t('seeAll')}
                    <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                  </Link>
                )
              }
            >
              {t('recent')}
            </SectionTitle>
          </div>
          {empty ? (
            <EmptyState
              icon={ReceiptText}
              title={t('emptyHomeTitle')}
              body={t('emptyHomeBody')}
              action={
                <button type="button" className="btn btn-primary press" onClick={() => openNew('expense')}>
                  {t('addExpense')}
                </button>
              }
            />
          ) : (
            <TxList txs={recent} showDayTotals={false} />
          )}
        </section>

        <div className="flex flex-col gap-4 lg:col-span-5 lg:gap-6">
          {cats.length > 0 && (
            <section className="card p-3 sm:p-4">
              <div className="px-2 pt-1">
                <SectionTitle
                  action={
                    <Link to="/insights" className="press flex items-center gap-0.5 text-sm font-medium text-accent-ink">
                      {t('navInsights')}
                      <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                    </Link>
                  }
                >
                  {t('topSpending')}
                </SectionTitle>
              </div>
              <CategoryBreakdown items={cats} limit={5} />
            </section>
          )}

          {data.goals.length > 0 && (
            <section className="card p-3 sm:p-4">
              <div className="px-2 pt-1">
                <SectionTitle
                  action={
                    <Link to="/goals" className="press flex items-center gap-0.5 text-sm font-medium text-accent-ink">
                      {t('seeAll')}
                      <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
                    </Link>
                  }
                >
                  {t('goalsPreview')}
                </SectionTitle>
              </div>
              <ul className="space-y-1">
                {data.goals.slice(0, 3).map((g) => {
                  const p = goalPlan(g, today);
                  const Icon = GOAL_ICON_MAP[g.icon];
                  return (
                    <li key={g.id}>
                      <Link to="/goals" className="press hover-soft flex items-center gap-3 rounded-xl px-2 py-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-ink">
                          <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[0.9375rem] font-medium text-ink">{g.name}</span>
                            <span className="num shrink-0 text-[0.8125rem] text-muted">{Math.round(p.ratio * 100)}%</span>
                          </span>
                          <span className="mt-1.5 block h-[3px] overflow-hidden rounded-full bg-line">
                            <span className={`block h-full rounded-full ${p.done ? 'bg-money' : 'bg-accent'}`} style={{ width: `${p.ratio * 100}%` }} />
                          </span>
                          <span className="num mt-1 block text-xs text-muted">
                            {money(g.saved)} / {money(g.target)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
