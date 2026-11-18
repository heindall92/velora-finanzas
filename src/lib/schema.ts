import { normalizeCategory } from './categories';
import { isDayKey, toDayKey } from './dates';
import { isCurrency, roundCents } from './money';
import type { AppData, CardColor, Goal, GoalIcon, Lang, Profile, ThemePref, Transaction, TxType } from './types';

export const CARD_COLORS: readonly CardColor[] = ['blue', 'black', 'red', 'green', 'orange', 'mauve'];
export const GOAL_ICONS: readonly GoalIcon[] = ['target', 'plane', 'shield', 'laptop', 'home', 'car', 'gift', 'piggy'];

const MAX_TEXT = 140;
const MAX_ITEMS = 50_000;
const MAX_AMOUNT = 1e11;

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Brazilian friend first: Portuguese unless the browser is clearly Spanish. */
export function detectLang(): Lang {
  const nav = typeof navigator !== 'undefined' ? navigator.language || '' : '';
  return nav.toLowerCase().startsWith('es') ? 'es' : 'pt';
}

export function defaultProfile(lang: Lang = detectLang()): Profile {
  return {
    firstName: '',
    lastName: '',
    currency: 'BRL',
    language: lang,
    theme: 'system',
    budget: 0,
    cardColor: 'blue',
    hideBalance: false,
    onboardingComplete: false,
  };
}

export function emptyData(lang?: Lang): AppData {
  return { version: 2, profile: defaultProfile(lang), transactions: [], goals: [] };
}

// ── Narrow untrusted values ────────────────────────────────────────────────

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Strips control characters and caps length. Text is rendered by React (escaped), this is about sanity, not XSS. */
function text(v: unknown, max = MAX_TEXT): string {
  if (typeof v !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

function money(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (!Number.isFinite(n) || n < 0 || n > MAX_AMOUNT) return null;
  return roundCents(n);
}

function dayFrom(v: unknown): string | null {
  if (isDayKey(v)) return v;
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return toDayKey(d);
  }
  return null;
}

function instantFrom(v: unknown, fallback: string): string {
  if (typeof v === 'string') {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return fallback;
}

function pick<T extends string>(v: unknown, allowed: readonly T[], fallback: T): T {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

/** Accepts v2 transactions and v1 ones ({description, recipientName, date: ISO, type: 'transfer'}). */
function migrateTransaction(raw: unknown): Transaction | null {
  if (!isObj(raw)) return null;
  const amount = money(raw.amount);
  const date = dayFrom(raw.date);
  if (amount === null || amount === 0 || !date) return null;
  const type: TxType = raw.type === 'income' ? 'income' : 'expense'; // v1 'transfer' was money leaving
  let note = text(raw.note);
  if (!note) {
    const desc = text(raw.description);
    const who = text(raw.recipientName);
    // v1 filled description with boilerplate ("Transferencia a X", "Saldo inicial / presupuesto"); keep the human part.
    note = who && desc.includes(who) ? who : desc || who;
  }
  const createdAt = instantFrom(raw.createdAt, instantFrom(raw.date, `${date}T12:00:00.000Z`));
  return {
    id: text(raw.id, 64) || newId(),
    type,
    amount,
    category: normalizeCategory(raw.category, type),
    note,
    date,
    createdAt,
  };
}

function migrateGoal(raw: unknown): Goal | null {
  if (!isObj(raw)) return null;
  const name = text(raw.name, 60);
  const target = money(raw.target ?? raw.targetAmount);
  if (!name || target === null || target === 0) return null;
  const saved = money(raw.saved ?? raw.currentAmount) ?? 0;
  const deadline = raw.deadline ? dayFrom(raw.deadline) : null;
  return {
    id: text(raw.id, 64) || newId(),
    name,
    icon: pick(raw.icon, GOAL_ICONS, 'target'),
    target,
    saved,
    ...(deadline ? { deadline } : {}),
    createdAt: instantFrom(raw.createdAt, new Date().toISOString()),
  };
}

function migrateProfile(raw: unknown, legacyCardColor: unknown): Profile {
  const base = defaultProfile();
  if (!isObj(raw)) return base;
  let firstName = text(raw.firstName, 60);
  let lastName = text(raw.lastName, 60);
  const legacyName = text(raw.name, 120);
  if (!firstName && !lastName && legacyName && legacyName !== 'Usuario') {
    const [f, ...rest] = legacyName.split(/\s+/);
    firstName = f;
    lastName = rest.join(' ');
  }
  return {
    firstName,
    lastName,
    currency: isCurrency(raw.currency) ? raw.currency : base.currency,
    language: pick<Lang>(raw.language, ['pt', 'es'], base.language),
    theme: pick<ThemePref>(raw.theme, ['system', 'light', 'dark'], 'system'),
    budget: money(raw.budget) ?? 0,
    cardColor: pick(raw.cardColor ?? legacyCardColor, CARD_COLORS, 'blue'),
    hideBalance: raw.hideBalance === true,
    onboardingComplete: raw.onboardingComplete === true,
  };
}

/**
 * Turns anything (stored data from any version, or an imported file) into valid AppData.
 * Invalid rows are dropped, never trusted. Throws only if the input is not an object at all.
 */
export function migrate(raw: unknown): AppData {
  if (!isObj(raw)) throw new Error('invalid');
  const legacyColor = Array.isArray(raw.accounts) && isObj(raw.accounts[0]) ? raw.accounts[0].color : undefined;
  const txIn = Array.isArray(raw.transactions) ? raw.transactions.slice(0, MAX_ITEMS) : [];
  const goalsIn = Array.isArray(raw.goals) ? raw.goals.slice(0, 500) : [];

  const seen = new Set<string>();
  const dedupe = <T extends { id: string }>(x: T | null): x is T => {
    if (!x) return false;
    if (seen.has(x.id)) x.id = newId();
    seen.add(x.id);
    return true;
  };

  // v1 demo leftovers: the "Viaje a Bali" sample goal.
  const goals = goalsIn
    .filter((g) => !(isObj(g) && typeof g.name === 'string' && /bali/i.test(g.name)))
    .map(migrateGoal)
    .filter(dedupe);

  return {
    version: 2,
    profile: migrateProfile(raw.profile, legacyColor),
    transactions: txIn.map(migrateTransaction).filter(dedupe),
    goals,
  };
}

/** Parses a backup file. Error codes are translated by the caller. */
export function parseBackup(json: string): AppData {
  if (json.length > 20_000_000) throw new Error('too_large');
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('not_json');
  }
  if (!isObj(parsed) || !('profile' in parsed || 'transactions' in parsed)) throw new Error('not_backup');
  return migrate(parsed);
}
