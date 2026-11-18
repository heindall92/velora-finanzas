import { ChevronRight, Info, Landmark, Pencil, Plus, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountSheet from '../components/AccountSheet';
import BankBadge from '../components/BankBadge';
import Donut, { type Slice } from '../components/Donut';
import { OTHERS, SERIES } from '../lib/palette';
import { EmptyState, Masked, PageHeader, Segmented, SectionTitle } from '../components/ui';
import { KIND_LABEL } from '../lib/banks';
import { formatSigned } from '../lib/money';
import { accountBalances, byAccount, netWorth, periodRange } from '../lib/stats';
import type { Account } from '../lib/types';
import { useApp } from '../state/AppState';

type Side = 'assets' | 'liabilities';

export default function Accounts() {
  const { data, t, money, currency, today } = useApp();
  const lang = data.profile.language;
  const hidden = data.profile.hideBalance;
  const [editing, setEditing] = useState<Account | 'new' | null>(null);
  const [side, setSide] = useState<Side>('assets');

  const month = periodRange('month', today);
  const { balances, worth, spentBy } = useMemo(() => {
    const balances = accountBalances(data.accounts, data.transactions);
    return {
      balances,
      worth: netWorth(balances),
      spentBy: new Map(byAccount(data.transactions, 'expense', month).map((x) => [x.id, x.total])),
    };
  }, [data.accounts, data.transactions, month.start]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = [
    ...data.accounts.map((a) => ({ id: a.id, account: a as Account | null, name: a.name, balance: balances.get(a.id) ?? 0 })),
    ...(balances.has('') ? [{ id: '', account: null, name: t('noAccount'), balance: balances.get('')! }] : []),
  ];

  const sideRows = rows
    .filter((r) => (side === 'assets' ? r.balance > 0 : r.balance < 0))
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  const slices: Slice[] = sideRows.slice(0, 5).map((r, i) => ({
    id: r.id || 'none',
    value: Math.abs(r.balance),
    color: SERIES[i],
    label: r.name,
    icon: <BankBadge account={r.account} size={20} />,
  }));
  if (sideRows.length > 5) {
    slices.push({ id: 'rest', value: sideRows.slice(5).reduce((s, r) => s + Math.abs(r.balance), 0), color: OTHERS, label: t('others') });
  }

  if (data.accounts.length === 0 && !balances.has('')) {
    return (
      <>
        <PageHeader title={t('accounts')} />
        <section className="card">
          <EmptyState
            icon={Landmark}
            title={t('accountsEmptyTitle')}
            body={t('accountsEmptyBody')}
            action={
              <button type="button" className="btn btn-primary press" onClick={() => setEditing('new')}>
                <Plus size={18} strokeWidth={2.25} aria-hidden="true" />
                {t('addAccount')}
              </button>
            }
          />
        </section>
        <GoalsLink />
        <AccountSheet account={editing} onClose={() => setEditing(null)} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t('accounts')}
        actions={
          <button type="button" className="btn btn-primary press min-h-10 px-3.5 text-sm" onClick={() => setEditing('new')}>
            <Plus size={18} strokeWidth={2.25} aria-hidden="true" />
            {t('addAccount')}
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-6">
        <div className="space-y-4 lg:col-span-5">
          <section className="card p-5" aria-label={t('patrimony')}>
            <h2 className="flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink">
              {t('patrimony')}
              <span title={t('patrimonyTip')} className="text-muted">
                <Info size={15} strokeWidth={1.75} aria-label={t('patrimonyTip')} />
              </span>
            </h2>
            <p className={`num display mt-2 text-[2rem] font-semibold ${worth.net < 0 ? 'text-down' : 'text-ink'}`}>
              <Masked hidden={hidden}>{worth.net < 0 ? formatSigned(worth.net, currency, '-') : money(worth.net)}</Masked>
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
              <div>
                <dt className="text-[0.8125rem] text-muted">{t('assets')}</dt>
                <dd className="num mt-0.5 font-semibold text-ink">
                  <Masked hidden={hidden}>{money(worth.assets)}</Masked>
                </dd>
              </div>
              <div>
                <dt className="text-[0.8125rem] text-muted">{t('liabilities')}</dt>
                <dd className={`num mt-0.5 font-semibold ${worth.liabilities > 0 ? 'text-down' : 'text-ink'}`}>
                  <Masked hidden={hidden}>{money(worth.liabilities)}</Masked>
                </dd>
              </div>
            </dl>
          </section>

          <Segmented<Side>
            label={t('patrimony')}
            value={side}
            onChange={setSide}
            options={[
              { value: 'assets', label: t('assets') },
              { value: 'liabilities', label: t('liabilities') },
            ]}
          />

          <section className="card p-4 sm:p-5">
            <SectionTitle>{side === 'assets' ? t('myAssets') : t('myLiabilities')}</SectionTitle>
            {slices.length ? (
              <Donut
                slices={slices}
                format={money}
                centerLabel={side === 'assets' ? t('assets') : t('liabilities')}
                centerValue={hidden ? '••••' : money(side === 'assets' ? worth.assets : worth.liabilities)}
              />
            ) : (
              <p className="py-6 text-center text-sm text-muted">{side === 'assets' ? t('noAssetsYet') : t('noLiabilitiesYet')}</p>
            )}
          </section>
        </div>

        <div className="space-y-4 lg:col-span-7">
          <section className="card p-2 sm:p-3">
            <div className="px-2 pt-2">
              <SectionTitle>{t('accounts')}</SectionTitle>
            </div>
            <ul className="space-y-0.5">
              {rows.map((r) => {
                const spent = spentBy.get(r.id) ?? 0;
                return (
                  <li key={r.id || 'none'} className="flex items-center gap-1">
                    <Link
                      to={`/activity?account=${r.id || 'none'}`}
                      className="press hover-soft flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2.5"
                      aria-label={`${r.name}: ${t('viewStatement')}`}
                    >
                      <BankBadge account={r.account} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.9375rem] font-medium text-ink">{r.name}</span>
                        <span className="block truncate text-[0.8125rem] text-muted">
                          {/* Phone: this month's spending matters most; the account kind also shows on wider screens. */}
                          <span className="hidden sm:inline">
                            {r.account ? KIND_LABEL[r.account.kind][lang] : ''}
                            {r.account && spent > 0 ? ' · ' : ''}
                          </span>
                          {spent > 0 ? t('spentInMonth', { amount: money(spent) }) : <span className="sm:hidden">{r.account ? KIND_LABEL[r.account.kind][lang] : '\u00a0'}</span>}
                        </span>
                      </span>
                      <span className={`num shrink-0 text-[0.9375rem] font-semibold ${r.balance < 0 ? 'text-down' : 'text-ink'}`}>
                        <Masked hidden={hidden}>{r.balance < 0 ? formatSigned(r.balance, currency, '-') : money(r.balance)}</Masked>
                      </span>
                      <ChevronRight size={16} strokeWidth={1.75} className="hidden shrink-0 text-muted sm:block" aria-hidden="true" />
                    </Link>
                    {r.account && (
                      <button type="button" className="icon-btn press hover-soft h-10 w-9 shrink-0" onClick={() => setEditing(r.account)} aria-label={`${t('editAccount')}: ${r.name}`}>
                        <Pencil size={16} strokeWidth={1.75} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
          <GoalsLink />
        </div>
      </div>

      <AccountSheet account={editing} onClose={() => setEditing(null)} />
    </>
  );
}

/** Metas live one tap away from the money they come from (the tab bar has room for five items). */
function GoalsLink() {
  const { t, data } = useApp();
  return (
    <Link to="/goals" className="card press hover-soft mt-4 flex items-center gap-3 p-4 lg:mt-0">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent-ink">
        <Target size={20} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="flex-1 font-medium text-ink">{t('goals')}</span>
      {data.goals.length > 0 && <span className="num text-sm text-muted">{data.goals.length}</span>}
      <ChevronRight size={18} strokeWidth={1.75} className="text-muted" aria-hidden="true" />
    </Link>
  );
}
