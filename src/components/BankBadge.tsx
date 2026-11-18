import { Banknote, CreditCard, Landmark, PiggyBank, Wallet } from 'lucide-react';
import { getBank } from '../lib/banks';
import type { Account } from '../lib/types';

/** Bank colour + initials; falls back to an icon for the account kind (cash, other banks). */
export default function BankBadge({ account, bank, size = 40 }: { account?: Pick<Account, 'bank' | 'kind' | 'name'> | null; bank?: string; size?: number }) {
  if (!account && !bank) {
    // Movements recorded without an account.
    return (
      <span aria-hidden="true" className="inline-grid shrink-0 place-items-center rounded-xl bg-soft text-muted" style={{ width: size, height: size }}>
        <Wallet size={Math.round(size * 0.45)} strokeWidth={1.75} />
      </span>
    );
  }
  const b = getBank(account?.bank ?? bank ?? 'other');
  const Icon = account?.kind === 'credit' ? CreditCard : account?.kind === 'savings' ? PiggyBank : account?.kind === 'cash' ? Banknote : Landmark;
  const initials = b.initials || (b.id === 'other' ? (account?.name ?? '').slice(0, 2) : '');
  return (
    <span
      aria-hidden="true"
      className="relative inline-grid shrink-0 place-items-center rounded-xl font-bold tracking-tight"
      style={{ width: size, height: size, background: b.bg, color: b.fg, fontSize: Math.round(size * 0.36) }}
    >
      {initials ? initials : <Icon size={Math.round(size * 0.45)} strokeWidth={1.9} />}
      {account?.kind === 'credit' && initials && (
        <span className="absolute -bottom-1 -right-1 grid h-[18px] w-[18px] place-items-center rounded-full bg-card text-ink-2 ring-1 ring-line">
          <CreditCard size={11} strokeWidth={2} />
        </span>
      )}
    </span>
  );
}
