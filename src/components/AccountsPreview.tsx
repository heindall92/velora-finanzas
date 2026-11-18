import { ChevronRight, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatSigned } from '../lib/money';
import { accountBalances } from '../lib/stats';
import type { Account } from '../lib/types';
import { useApp } from '../state/AppState';
import AccountSheet from './AccountSheet';
import BankBadge from './BankBadge';
import { Masked, SectionTitle } from './ui';

/** Home: each bank and its balance, one tap from its statement. */
export default function AccountsPreview() {
  const { data, t, money, currency } = useApp();
  const [editing, setEditing] = useState<Account | 'new' | null>(null);
  const balances = useMemo(() => accountBalances(data.accounts, data.transactions), [data.accounts, data.transactions]);
  const hidden = data.profile.hideBalance;

  return (
    <section className="card p-3 sm:p-4">
      <div className="px-2 pt-1">
        <SectionTitle
          action={
            data.accounts.length > 0 && (
              <Link to="/accounts" className="press flex items-center gap-0.5 text-sm font-medium text-accent-ink">
                {t('patrimony')}
                <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
              </Link>
            )
          }
        >
          {t('accounts')}
        </SectionTitle>
      </div>

      {data.accounts.length === 0 ? (
        <div className="px-2 pb-1">
          <p className="mb-3 text-sm text-muted">{t('accountsEmptyBody')}</p>
          <button type="button" className="btn btn-secondary press w-full" onClick={() => setEditing('new')}>
            <Plus size={18} strokeWidth={2.25} aria-hidden="true" />
            {t('addAccount')}
          </button>
        </div>
      ) : (
        <ul className="space-y-0.5">
          {data.accounts.slice(0, 5).map((a) => {
            const b = balances.get(a.id) ?? 0;
            return (
              <li key={a.id}>
                <Link to={`/activity?account=${a.id}`} className="press hover-soft flex items-center gap-3 rounded-xl px-2 py-2">
                  <BankBadge account={a} size={34} />
                  <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium text-ink">{a.name}</span>
                  <span className={`num shrink-0 text-[0.9375rem] font-semibold ${b < 0 ? 'text-down' : 'text-ink'}`}>
                    <Masked hidden={hidden}>{b < 0 ? formatSigned(b, currency, '-') : money(b)}</Masked>
                  </span>
                </Link>
              </li>
            );
          })}
          <li>
            <button type="button" onClick={() => setEditing('new')} className="press hover-soft flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm font-medium text-accent-ink">
              <span className="grid h-[34px] w-[34px] place-items-center rounded-xl border border-dashed border-line-strong">
                <Plus size={16} strokeWidth={2} aria-hidden="true" />
              </span>
              {t('addAccount')}
            </button>
          </li>
        </ul>
      )}
      <AccountSheet account={editing} onClose={() => setEditing(null)} />
    </section>
  );
}
