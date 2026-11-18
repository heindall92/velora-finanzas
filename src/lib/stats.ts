import { addDays, addMonths, daysInMonth, diffDays, fromDayKey, startOfMonth, startOfWeek, toDayKey } from './dates';
import { roundCents, sumMoney } from './money';
import type { Goal, Transaction, TxType } from './types';

export type PeriodKind = 'week' | 'month' | 'year';

export interface Range {
  start: string; // inclusive day key
  end: string; // inclusive day key
}

export interface Bucket extends Range {
  /** Date used to label the bucket (a day or the 1st of a month). */
  at: Date;
  total: number;
  /** Bucket is after "today": not happened yet. */
  future: boolean;
  /** Bucket contains "today": still in progress. */
  current: boolean;
}

const inRange = (day: string, r: Range) => day >= r.start && day <= r.end;

export function balance(txs: readonly Transaction[]): number {
  return sumMoney(txs.map((t) => (t.type === 'income' ? t.amount : -t.amount)));
}

export function totalOf(txs: readonly Transaction[], type: TxType, r: Range): number {
  return sumMoney(txs.filter((t) => t.type === type && inRange(t.date, r)).map((t) => t.amount));
}

export function periodRange(kind: PeriodKind, anchor: Date): Range {
  if (kind === 'week') {
    const s = startOfWeek(anchor);
    return { start: toDayKey(s), end: toDayKey(addDays(s, 6)) };
  }
  if (kind === 'month') {
    const s = startOfMonth(anchor);
    return { start: toDayKey(s), end: toDayKey(new Date(s.getFullYear(), s.getMonth(), daysInMonth(s))) };
  }
  const y = anchor.getFullYear();
  return { start: `${y}-01-01`, end: `${y}-12-31` };
}

export function shiftAnchor(kind: PeriodKind, anchor: Date, n: number): Date {
  if (kind === 'week') return addDays(anchor, 7 * n);
  if (kind === 'month') return addMonths(startOfMonth(anchor), n);
  return new Date(anchor.getFullYear() + n, 0, 1);
}

export function isFuturePeriod(kind: PeriodKind, anchor: Date, today: Date): boolean {
  return periodRange(kind, anchor).start > toDayKey(today);
}

/**
 * Current vs previous period, comparing the SAME elapsed time.
 * On 18 Nov, "this month" (1–18 Nov) is compared with 1–18 Oct — not with all of October,
 * which would always make an unfinished month look like a drop.
 */
export function comparableRanges(kind: PeriodKind, anchor: Date, today: Date): { current: Range; previous: Range; partial: boolean } {
  const current = periodRange(kind, anchor);
  const previousFull = periodRange(kind, shiftAnchor(kind, anchor, -1));
  const todayKey = toDayKey(today);
  if (todayKey < current.start || todayKey > current.end) {
    return { current, previous: previousFull, partial: false };
  }
  const elapsed = diffDays(today, fromDayKey(current.start));
  const prevStart = fromDayKey(previousFull.start);
  let prevEnd = toDayKey(addDays(prevStart, elapsed));
  if (prevEnd > previousFull.end) prevEnd = previousFull.end;
  return { current: { start: current.start, end: todayKey }, previous: { start: previousFull.start, end: prevEnd }, partial: true };
}

export type Delta =
  | { kind: 'none' } // nothing to compare against
  | { kind: 'small'; previous: number } // previous base too small for a % to mean anything
  | { kind: 'pct'; pct: number; previous: number };

/** "was R$ 3,00" instead of a shouting −100 % when the base is tiny. */
export function computeDelta(current: number, previous: number, smallBase: number): Delta {
  if (previous === 0 && current === 0) return { kind: 'none' };
  if (previous < smallBase) return { kind: 'small', previous };
  return { kind: 'pct', pct: Math.round(((current - previous) / previous) * 1000) / 10, previous };
}

export interface CategoryTotal {
  id: string;
  total: number;
  share: number; // 0..1
  count: number;
}

export function byCategory(txs: readonly Transaction[], type: TxType, r: Range): CategoryTotal[] {
  const map = new Map<string, { cents: number; count: number }>();
  for (const t of txs) {
    if (t.type !== type || !inRange(t.date, r)) continue;
    const cur = map.get(t.category) ?? { cents: 0, count: 0 };
    cur.cents += Math.round(t.amount * 100);
    cur.count += 1;
    map.set(t.category, cur);
  }
  const all = [...map.values()].reduce((s, v) => s + v.cents, 0);
  return [...map.entries()]
    .map(([id, v]) => ({ id, total: v.cents / 100, count: v.count, share: all ? v.cents / all : 0 }))
    .sort((a, b) => b.total - a.total || a.id.localeCompare(b.id));
}

/** Spending series: one bar per day (week, month) or per month (year). */
export function spendingSeries(txs: readonly Transaction[], kind: PeriodKind, anchor: Date, today: Date, type: TxType = 'expense'): Bucket[] {
  const r = periodRange(kind, anchor);
  const todayKey = toDayKey(today);
  const buckets: Bucket[] = [];
  if (kind === 'year') {
    for (let m = 0; m < 12; m++) {
      const s = new Date(anchor.getFullYear(), m, 1);
      const range = periodRange('month', s);
      buckets.push({ ...range, at: s, total: 0, future: range.start > todayKey, current: todayKey >= range.start && todayKey <= range.end });
    }
  } else {
    let d = fromDayKey(r.start);
    while (toDayKey(d) <= r.end) {
      const k = toDayKey(d);
      buckets.push({ start: k, end: k, at: d, total: 0, future: k > todayKey, current: k === todayKey });
      d = addDays(d, 1);
    }
  }
  for (const t of txs) {
    if (t.type !== type || !inRange(t.date, r)) continue;
    const b = kind === 'year' ? buckets[fromDayKey(t.date).getMonth()] : buckets[diffDays(fromDayKey(t.date), fromDayKey(r.start))];
    if (b) b.total = roundCents(b.total + t.amount);
  }
  return buckets;
}

export type Pace = 'none' | 'ok' | 'warn' | 'over';

export interface BudgetStatus {
  budget: number;
  spent: number;
  left: number;
  /** spent / budget, 0..∞ */
  ratio: number;
  /** fraction of the month that has passed, counting today */
  elapsed: number;
  daysLeft: number; // including today
  perDay: number; // what can be spent per remaining day
  pace: Pace;
}

/**
 * The budget question that matters: "can I keep spending like this?"
 * warn = spending faster than the month is passing (more than 10 points ahead of the calendar).
 */
export function budgetStatus(txs: readonly Transaction[], budget: number, today: Date): BudgetStatus {
  const month = periodRange('month', today);
  const spent = totalOf(txs, 'expense', month);
  const dim = daysInMonth(today);
  const daysLeft = dim - today.getDate() + 1;
  const elapsed = today.getDate() / dim;
  if (!budget || budget <= 0) {
    return { budget: 0, spent, left: 0, ratio: 0, elapsed, daysLeft, perDay: 0, pace: 'none' };
  }
  const left = roundCents(budget - spent);
  const ratio = spent / budget;
  const pace: Pace = ratio > 1 ? 'over' : ratio > elapsed + 0.1 ? 'warn' : 'ok';
  return { budget, spent, left, ratio, elapsed, daysLeft, perDay: left > 0 ? roundCents(left / daysLeft) : 0, pace };
}

export interface GoalPlan {
  ratio: number; // 0..1
  left: number;
  done: boolean;
  /** Needed per month to reach the deadline; null without deadline. */
  perMonth: number | null;
  monthsLeft: number | null;
  overdue: boolean;
}

export function goalPlan(goal: Goal, today: Date): GoalPlan {
  const left = roundCents(Math.max(goal.target - goal.saved, 0));
  const ratio = goal.target > 0 ? Math.min(goal.saved / goal.target, 1) : 0;
  const done = goal.target > 0 && goal.saved >= goal.target;
  if (!goal.deadline || done) return { ratio, left, done, perMonth: null, monthsLeft: null, overdue: false };
  const dl = fromDayKey(goal.deadline);
  const overdue = toDayKey(today) > goal.deadline;
  // Months remaining, counting the current one: Nov 18 → Dec 31 = 2 months of saving.
  const monthsLeft = Math.max((dl.getFullYear() - today.getFullYear()) * 12 + (dl.getMonth() - today.getMonth()) + 1, 1);
  return { ratio, left, done, perMonth: overdue ? null : roundCents(left / monthsLeft), monthsLeft: overdue ? 0 : monthsLeft, overdue };
}

/** Sort newest first: by day, then by creation instant. */
export function sortTransactions<T extends Pick<Transaction, 'date' | 'createdAt'>>(txs: readonly T[]): T[] {
  return [...txs].sort((a, b) => (a.date === b.date ? b.createdAt.localeCompare(a.createdAt) : b.date.localeCompare(a.date)));
}

/** 4–5 round ticks from 0 (0, 500, 1k, 1.5k…) so an axis never reads "2.103". */
export function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const ticks: number[] = [];
  for (let v = 0; v < max + step * 0.999; v += step) ticks.push(roundCents(v));
  return ticks;
}
