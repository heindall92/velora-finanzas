import { categoryLabel } from '../lib/categories';
import { formatSigned, sumMoney } from '../lib/money';
import type { Transaction } from '../lib/types';
import { useApp } from '../state/AppState';
import { useEntry } from './EntrySheet';
import { CategoryBadge } from './ui';
import { useDayLabel } from './useDayLabel';


export function TxRow({ tx }: { tx: Transaction }) {
  const { data, currency } = useApp();
  const { openEdit } = useEntry();
  const lang = data.profile.language;
  const label = categoryLabel(tx.category, lang);
  const title = tx.note || label;
  const income = tx.type === 'income';
  return (
    <li>
      <button
        type="button"
        onClick={() => openEdit(tx)}
        className="press hover-soft flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left"
      >
        <CategoryBadge id={tx.category} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.9375rem] font-medium text-ink">{title}</span>
          {tx.note && <span className="block truncate text-[0.8125rem] text-muted">{label}</span>}
        </span>
        <span className={`num shrink-0 text-[0.9375rem] font-semibold ${income ? 'text-money' : 'text-ink'}`}>
          {formatSigned(tx.amount, currency, income ? '+' : '-')}
        </span>
      </button>
    </li>
  );
}

/** Transactions grouped by day, newest first; each day shows its net. Input must already be sorted. */
export default function TxList({ txs, showDayTotals = true }: { txs: Transaction[]; showDayTotals?: boolean }) {
  const { currency } = useApp();
  const dayLabel = useDayLabel();
  const groups: { day: string; items: Transaction[] }[] = [];
  for (const tx of txs) {
    const last = groups[groups.length - 1];
    if (last && last.day === tx.date) last.items.push(tx);
    else groups.push({ day: tx.date, items: [tx] });
  }
  return (
    <div className="space-y-4">
      {groups.map((g) => {
        const net = sumMoney(g.items.map((x) => (x.type === 'income' ? x.amount : -x.amount)));
        return (
          <section key={g.day} aria-label={dayLabel(g.day)}>
            <div className="flex items-center justify-between px-2 pb-1">
              <h3 className="text-[0.8125rem] font-medium text-muted">{dayLabel(g.day)}</h3>
              {showDayTotals && g.items.length > 1 && (
                <span className="num text-[0.8125rem] text-muted">{formatSigned(net, currency, net >= 0 ? '+' : '-')}</span>
              )}
            </div>
            <ul className="space-y-0.5">
              {g.items.map((tx) => (
                <TxRow key={tx.id} tx={tx} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
