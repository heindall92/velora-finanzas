import { describe, expect, it } from 'vitest';
import { categoryLabel, normalizeCategory } from '../lib/categories';
import { addMonths, isDayKey, startOfWeek, toDayKey } from '../lib/dates';
import { makeT } from '../lib/i18n';
import { amountToInput, formatMoney, formatSigned, parseAmount, sumMoney } from '../lib/money';
import { migrate, parseBackup } from '../lib/schema';
import {
  balance,
  budgetStatus,
  byCategory,
  comparableRanges,
  computeDelta,
  goalPlan,
  niceTicks,
  periodRange,
  sortTransactions,
  spendingSeries,
} from '../lib/stats';
import type { Transaction } from '../lib/types';

const tx = (p: Partial<Transaction>): Transaction => ({
  id: Math.random().toString(36),
  type: 'expense',
  amount: 10,
  category: 'food',
  note: '',
  date: '2026-11-10',
  createdAt: '2026-11-10T10:00:00.000Z',
  ...p,
});

describe('parseAmount', () => {
  it.each([
    ['1.234,56', 1234.56],
    ['1,234.56', 1234.56],
    ['12,5', 12.5],
    ['12.5', 12.5],
    ['R$ 10', 10],
    ['1.000', 1000],
    ['1,000', 1000],
    ['1.000.000', 1000000],
    ['0,99', 0.99],
    ['  45 ', 45],
    ['10,', 10],
    [',5', 0.5],
    ['0', 0],
  ])('%s → %d', (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });

  it.each(['', 'abc', '-5', 'R$', '.', '1e999999'])('rejects %s', (input) => {
    expect(parseAmount(input)).toBeNull();
  });

  it('the v1 bug: "1.234,56" used to become 1.234', () => {
    expect(parseAmount('1.234,56')).not.toBe(1.234);
  });
});

describe('formatting', () => {
  it('formats BRL the Brazilian way regardless of UI language', () => {
    expect(formatMoney(3000, 'BRL')).toBe('R$ 3.000,00');
    expect(formatMoney(1234.5, 'EUR')).toBe('1.234,50 €');
    expect(formatMoney(1234.5, 'USD')).toBe('$1,234.50');
  });
  it('signed uses a real minus sign', () => {
    expect(formatSigned(-12, 'BRL', '-')).toBe('−R$ 12,00');
    expect(formatSigned(12, 'BRL', '+')).toBe('+R$ 12,00');
  });
  it('round-trips input', () => {
    expect(amountToInput(12.5, 'BRL')).toBe('12,5');
    expect(parseAmount(amountToInput(1234.56, 'BRL'))).toBe(1234.56);
    expect(amountToInput(0, 'BRL')).toBe('');
    expect(amountToInput(3000, 'BRL')).toBe('3.000');
    expect(amountToInput(3000, 'USD')).toBe('3,000');
    expect(parseAmount(amountToInput(3000, 'USD'))).toBe(3000);
    expect(parseAmount(amountToInput(1234567.8, 'EUR'))).toBe(1234567.8);
  });
  it('sums without float drift', () => {
    expect(sumMoney([0.1, 0.2])).toBe(0.3);
    expect(balance([tx({ type: 'income', amount: 0.1 }), tx({ type: 'income', amount: 0.2 })])).toBe(0.3);
  });
});

describe('dates', () => {
  it('validates day keys', () => {
    expect(isDayKey('2026-02-29')).toBe(false);
    expect(isDayKey('2028-02-29')).toBe(true);
    expect(isDayKey('2026-11-18T10:00')).toBe(false);
  });
  it('weeks start on Monday', () => {
    expect(toDayKey(startOfWeek(new Date(2026, 10, 18)))).toBe('2026-11-16'); // Wed → Mon
    expect(toDayKey(startOfWeek(new Date(2026, 10, 22)))).toBe('2026-11-16'); // Sun → Mon
  });
  it('addMonths clamps to month end', () => {
    expect(toDayKey(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28');
  });
});

describe('periods and comparison', () => {
  const today = new Date(2026, 10, 18);
  it('month range', () => {
    expect(periodRange('month', today)).toEqual({ start: '2026-11-01', end: '2026-11-30' });
  });
  it('compares the same elapsed time, not a full previous month', () => {
    const r = comparableRanges('month', today, today);
    expect(r.current).toEqual({ start: '2026-11-01', end: '2026-11-18' });
    expect(r.previous).toEqual({ start: '2026-10-01', end: '2026-10-18' });
    expect(r.partial).toBe(true);
  });
  it('a finished period compares full vs full', () => {
    const r = comparableRanges('month', new Date(2026, 8, 5), today);
    expect(r.partial).toBe(false);
    expect(r.previous).toEqual({ start: '2026-08-01', end: '2026-08-31' });
  });
  it('clamps when the previous month is shorter (31 Mar vs Feb)', () => {
    const d = new Date(2026, 2, 31);
    expect(comparableRanges('month', d, d).previous.end).toBe('2026-02-28');
  });
  it('delta: no fake percentages', () => {
    expect(computeDelta(0, 0, 5)).toEqual({ kind: 'none' });
    expect(computeDelta(0, 3, 5)).toEqual({ kind: 'small', previous: 3 });
    expect(computeDelta(110, 100, 5)).toEqual({ kind: 'pct', pct: 10, previous: 100 });
  });
});

describe('aggregations', () => {
  const today = new Date(2026, 10, 18);
  const data = [
    tx({ amount: 50, category: 'food', date: '2026-11-02' }),
    tx({ amount: 30, category: 'food', date: '2026-11-18' }),
    tx({ amount: 20, category: 'transport', date: '2026-11-18' }),
    tx({ amount: 999, category: 'food', date: '2026-10-30' }),
    tx({ type: 'income', amount: 1000, category: 'salary', date: '2026-11-05' }),
  ];
  it('by category with shares', () => {
    const r = byCategory(data, 'expense', periodRange('month', today));
    expect(r.map((c) => [c.id, c.total, c.count])).toEqual([
      ['food', 80, 2],
      ['transport', 20, 1],
    ]);
    expect(r[0].share).toBeCloseTo(0.8);
  });
  it('daily series puts amounts on the right day and flags the future', () => {
    const s = spendingSeries(data, 'month', today, today);
    expect(s).toHaveLength(30);
    expect(s[1].total).toBe(50);
    expect(s[17].total).toBe(50);
    expect(s[17].current).toBe(true);
    expect(s[18].future).toBe(true);
  });
  it('yearly series buckets by month', () => {
    const s = spendingSeries(data, 'year', today, today);
    expect(s).toHaveLength(12);
    expect(s[9].total).toBe(999);
    expect(s[10].total).toBe(100);
  });
  it('budget pace', () => {
    const b = budgetStatus(data, 300, today); // spent 100 of 300 on day 18/30
    expect(b.spent).toBe(100);
    expect(b.left).toBe(200);
    expect(b.daysLeft).toBe(13);
    expect(b.perDay).toBe(15.38);
    expect(b.pace).toBe('ok');
    expect(budgetStatus(data, 120, today).pace).toBe('warn');
    expect(budgetStatus(data, 90, today).pace).toBe('over');
    expect(budgetStatus(data, 0, today).pace).toBe('none');
  });
  it('sorts newest first with stable intra-day order', () => {
    const a = tx({ id: 'a', date: '2026-11-18', createdAt: '2026-11-18T08:00:00Z' });
    const b = tx({ id: 'b', date: '2026-11-18', createdAt: '2026-11-18T09:00:00Z' });
    const c = tx({ id: 'c', date: '2026-11-17', createdAt: '2026-11-19T09:00:00Z' });
    expect(sortTransactions([a, c, b]).map((t) => t.id)).toEqual(['b', 'a', 'c']);
  });
  it('round axis ticks', () => {
    expect(niceTicks(2103)).toEqual([0, 1000, 2000, 3000]);
    expect(niceTicks(380)).toEqual([0, 100, 200, 300, 400]);
    expect(niceTicks(0)).toEqual([0]);
  });
});

describe('goals', () => {
  const today = new Date(2026, 10, 18);
  it('per-month plan counts the current month', () => {
    const p = goalPlan({ id: 'g', name: 'x', icon: 'target', target: 1000, saved: 400, deadline: '2026-12-31', createdAt: '' }, today);
    expect(p.monthsLeft).toBe(2);
    expect(p.perMonth).toBe(300);
    expect(p.ratio).toBeCloseTo(0.4);
  });
  it('done and overdue', () => {
    expect(goalPlan({ id: 'g', name: 'x', icon: 'target', target: 100, saved: 120, createdAt: '' }, today).done).toBe(true);
    expect(goalPlan({ id: 'g', name: 'x', icon: 'target', target: 100, saved: 10, deadline: '2026-01-01', createdAt: '' }, today).overdue).toBe(true);
  });
});

describe('migration from v1 and untrusted imports', () => {
  const v1 = {
    version: '1.1.0',
    profile: { name: 'Ana Souza', currency: 'BRL', language: 'pt', theme: 'dark', budget: 3000, onboardingComplete: true },
    accounts: [{ id: '1', color: 'from-emerald-400 via-green-500', name: 'Velora' }],
    transactions: [
      { id: '1', type: 'expense', amount: 25.5, category: 'Food & Drink', description: 'Transferencia a Ana', recipientName: 'Ana', date: '2026-11-03T15:00:00.000Z', status: 'completed' },
      { id: '2', type: 'transfer', amount: 100, category: 'uber', description: 'x', date: '2026-11-04T10:00:00.000Z' },
      { id: '3', type: 'income', amount: 3000, category: 'Salary', description: 'Salário', date: '2026-11-01T10:00:00.000Z' },
      { id: '4', type: 'expense', amount: -5, category: 'food', date: '2026-11-01' },
      { id: '5', type: 'expense', amount: 'NaN', category: 'food', date: '2026-11-01' },
      { id: '6', type: 'expense', amount: 5, category: 'food', date: 'not a date' },
    ],
    goals: [
      { id: 'g1', name: 'Viaje a Bali', targetAmount: 5000, currentAmount: 100 },
      { id: 'g2', name: 'Reserva', targetAmount: 6000, currentAmount: 1500, icon: '<script>' },
    ],
  };

  it('migrates profile, card color, categories and drops invalid rows', () => {
    const d = migrate(v1);
    expect(d.version).toBe(3);
    expect(d.profile).toMatchObject({ firstName: 'Ana', lastName: 'Souza', theme: 'dark', budget: 3000, cardColor: 'blue' });
    expect(d.transactions.map((t) => t.id)).toEqual(['1', '2', '3']);
    expect(d.transactions[0]).toMatchObject({ category: 'food', note: 'Ana', type: 'expense' });
    expect(d.transactions[1]).toMatchObject({ type: 'expense', category: 'rideshare' });
    expect(d.transactions[2]).toMatchObject({ type: 'income', category: 'salary' });
    expect(d.goals).toHaveLength(1);
    expect(d.goals[0]).toMatchObject({ name: 'Reserva', target: 6000, saved: 1500, icon: 'target' });
  });

  it('is idempotent', () => {
    const once = migrate(v1);
    expect(migrate(JSON.parse(JSON.stringify(once)))).toEqual(once);
  });

  it('rejects garbage with a code', () => {
    expect(() => parseBackup('{')).toThrow('not_json');
    expect(() => parseBackup('[1,2]')).toThrow('not_backup');
    expect(() => parseBackup('{"foo":1}')).toThrow('not_backup');
  });

  it('does not let __proto__ pollute objects', () => {
    const d = parseBackup('{"profile":{"__proto__":{"polluted":true},"firstName":"A"},"transactions":[]}');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(d.profile.firstName).toBe('A');
  });

  it('strips control chars and caps text', () => {
    const d = migrate({ transactions: [{ id: 'x', type: 'expense', amount: 1, date: '2026-11-01', note: 'a\u0000b'.padEnd(500, 'z') }] });
    expect(d.transactions[0].note.startsWith('a b')).toBe(true);
    expect(d.transactions[0].note.length).toBe(140);
  });

  it('dedupes ids', () => {
    const d = migrate({ transactions: [tx({ id: 'same' }), tx({ id: 'same' })] });
    expect(new Set(d.transactions.map((t) => t.id)).size).toBe(2);
  });
});

describe('categories and i18n', () => {
  it('maps brands to real categories', () => {
    expect(normalizeCategory('netflix', 'expense')).toBe('subscriptions');
    expect(normalizeCategory('salary', 'expense')).toBe('other');
    expect(normalizeCategory('Gift', 'income')).toBe('gift_in');
    expect(categoryLabel('groceries', 'pt')).toBe('Mercado');
  });
  it('interpolates', () => {
    expect(makeT('pt')('greeting', { name: 'Ana' })).toBe('Olá, Ana');
    expect(makeT('es')('greeting', { name: 'Ana' })).toBe('Hola, Ana');
  });
});
