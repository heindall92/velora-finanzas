import { describe, expect, it } from 'vitest';
import { migrate } from '../lib/schema';
import { accountBalances, balance, byAccount, byCategory, netWorth, periodRange, totalBalance, totalOf } from '../lib/stats';
import type { Account, Transaction } from '../lib/types';

const acc = (id: string, kind: Account['kind'], opening: number): Account => ({ id, name: id, kind, bank: 'other', opening, createdAt: '' });
let n = 0;
const tx = (p: Partial<Transaction>): Transaction => ({
  id: `t${n++}`,
  type: 'expense',
  amount: 10,
  category: 'food',
  note: '',
  date: '2026-11-10',
  createdAt: '2026-11-10T10:00:00.000Z',
  ...p,
});

describe('accounts, transfers and patrimônio', () => {
  const accounts = [acc('nubank', 'checking', 1000), acc('card', 'credit', -300), acc('savings', 'savings', 5000)];
  const txs = [
    tx({ amount: 200, accountId: 'nubank' }), // debit purchase
    tx({ amount: 150, accountId: 'card', category: 'shopping' }), // card purchase: debt grows
    tx({ type: 'income', amount: 3000, accountId: 'nubank', category: 'salary' }),
    tx({ type: 'transfer', amount: 300, accountId: 'nubank', toAccountId: 'card', category: 'transfer' }), // pay the bill
    tx({ type: 'transfer', amount: 500, accountId: 'nubank', toAccountId: 'savings', category: 'transfer' }),
    tx({ amount: 40 }), // no account
  ];

  it('per-account balances follow the money', () => {
    const b = accountBalances(accounts, txs);
    expect(b.get('nubank')).toBe(1000 - 200 + 3000 - 300 - 500); // 3000
    expect(b.get('card')).toBe(-300 - 150 + 300); // -150: still owes this month's purchase
    expect(b.get('savings')).toBe(5500);
    expect(b.get('')).toBe(-40);
  });

  it('transfers are not income nor spending', () => {
    const r = periodRange('month', new Date(2026, 10, 18));
    expect(totalOf(txs, 'expense', r)).toBe(390);
    expect(totalOf(txs, 'income', r)).toBe(3000);
    expect(balance(txs)).toBe(2610);
    expect(byCategory(txs, 'expense', r).find((c) => c.id === 'transfer')).toBeUndefined();
  });

  it('total balance equals the sum of account balances', () => {
    const b = accountBalances(accounts, txs);
    const sum = [...b.values()].reduce((s, v) => s + v, 0);
    expect(totalBalance(accounts, txs)).toBeCloseTo(sum, 2);
    expect(totalBalance(accounts, txs)).toBe(8310);
  });

  it('net worth splits assets and liabilities', () => {
    const w = netWorth(accountBalances(accounts, txs));
    expect(w).toEqual({ assets: 8500, liabilities: 190, net: 8310 });
  });

  it('spending per bank', () => {
    const r = periodRange('month', new Date(2026, 10, 18));
    expect(byAccount(txs, 'expense', r).map((x) => [x.id, x.total])).toEqual([
      ['nubank', 200],
      ['card', 150],
      ['', 40],
    ]);
  });
});

describe('v3 migration', () => {
  it('drops the fake v1 default account and keeps v1 "transfer" as an expense', () => {
    const d = migrate({
      accounts: [{ id: '1', name: 'Velora', type: 'card', lastFour: '3827', balance: 0, color: 'blue' }],
      transactions: [{ id: 'x', type: 'transfer', amount: 10, date: '2026-11-01', category: 'Other' }],
    });
    expect(d.accounts).toEqual([]);
    expect(d.transactions[0]).toMatchObject({ type: 'expense', category: 'other' });
    expect(d.transactions[0].accountId).toBeUndefined();
  });

  it('keeps valid accounts and transfers, cleans broken references', () => {
    const d = migrate({
      accounts: [
        { id: 'a', name: 'Nubank', kind: 'checking', bank: 'nubank', opening: 10 },
        { id: 'b', name: 'Cartão', kind: 'credit', bank: 'evil<script>', opening: -50 },
        { id: 'a', name: 'dup', kind: 'checking', bank: 'nubank', opening: 0 },
      ],
      transactions: [
        { id: '1', type: 'transfer', amount: 5, accountId: 'a', toAccountId: 'b', date: '2026-11-01' },
        { id: '2', type: 'transfer', amount: 5, accountId: 'a', toAccountId: 'a', date: '2026-11-01' },
        { id: '3', type: 'expense', amount: 5, accountId: 'ghost', category: 'food', date: '2026-11-01' },
      ],
      profile: { categoryLimits: { food: 900, nonsense: 5, groceries: -1, Shopping: 100 } },
    });
    expect(d.accounts.map((a) => [a.id, a.bank, a.opening])).toEqual([
      ['a', 'nubank', 10],
      ['b', 'other', -50],
    ]);
    expect(d.transactions[0]).toMatchObject({ type: 'transfer', accountId: 'a', toAccountId: 'b', category: 'transfer' });
    expect(d.transactions[1]).toMatchObject({ type: 'expense', accountId: 'a' });
    expect(d.transactions[1].toAccountId).toBeUndefined();
    expect(d.transactions[2].accountId).toBeUndefined();
    expect(d.profile.categoryLimits).toEqual({ food: 900 });
  });
});
