export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

export const CURRENCIES: readonly CurrencyCode[] = ['BRL', 'USD', 'EUR'];

/** Locale used to format each currency, independent of UI language, so R$ always reads "R$ 1.234,56". */
const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  BRL: 'pt-BR',
  USD: 'en-US',
  EUR: 'de-DE',
};

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === 'string' && (CURRENCIES as readonly string[]).includes(value);
}

export function currencySymbol(currency: CurrencyCode): string {
  return currency === 'BRL' ? 'R$' : currency === 'USD' ? 'US$' : '€';
}

/** Rounds to cents, avoiding binary float drift (0.1 + 0.2). */
export function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Sums money values in integer cents so totals never show 0.30000000000000004. */
export function sumMoney(values: Iterable<number>): number {
  let cents = 0;
  for (const v of values) cents += Math.round(v * 100);
  return cents / 100;
}

const formatters = new Map<string, Intl.NumberFormat>();

function formatter(currency: CurrencyCode, compact: boolean): Intl.NumberFormat {
  const key = `${currency}:${compact}`;
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
      style: 'currency',
      currency,
      ...(compact
        ? { notation: 'compact', maximumFractionDigits: 1 }
        : { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    });
    formatters.set(key, f);
  }
  return f;
}

/** "R$ 1.234,56". Uses a regular space (Intl emits NBSP, which breaks string comparison in tests and copy/paste). */
export function formatMoney(value: number, currency: CurrencyCode): string {
  return formatter(currency, false).format(value).replace(/ /g, ' ');
}

/** "R$ 1,2 mil" — for axes and tight spots. Exact value goes in a tooltip. */
export function formatMoneyCompact(value: number, currency: CurrencyCode): string {
  return formatter(currency, true).format(value).replace(/ /g, ' ');
}

/** Signed amount: "+R$ 10,00" / "−R$ 10,00" (true minus sign, U+2212). */
export function formatSigned(value: number, currency: CurrencyCode, sign: '+' | '-'): string {
  return `${sign === '+' ? '+' : '−'}${formatMoney(Math.abs(value), currency)}`;
}

/**
 * Parses what a person types into an amount field, in either convention:
 *   "1.234,56" (pt-BR / es)  "1,234.56" (en)  "12,5"  "12.5"  "R$ 10"  "1.000"
 * Returns null when it is not a positive-or-zero number with at most 2 decimals' worth of meaning.
 *
 * Rule: the LAST separator is the decimal one if it is followed by 1–2 digits;
 * otherwise every separator is a thousands separator ("1.000" → 1000, "1,000" → 1000).
 */
export function parseAmount(raw: string): number | null {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.replace(/US\$|R\$|\$|€|\s/g, '');
  if (!cleaned || !/^[\d.,]+$/.test(cleaned)) return null;
  if (!/\d/.test(cleaned)) return null;

  const lastSep = Math.max(cleaned.lastIndexOf('.'), cleaned.lastIndexOf(','));
  let intPart = cleaned;
  let decPart = '';
  if (lastSep !== -1) {
    const after = cleaned.slice(lastSep + 1);
    if (after.length >= 1 && after.length <= 2 && /^\d+$/.test(after)) {
      intPart = cleaned.slice(0, lastSep);
      decPart = after;
    } else if (after.length === 0) {
      intPart = cleaned.slice(0, lastSep);
    }
  }
  const digits = intPart.replace(/[.,]/g, '');
  if (digits === '' && decPart === '') return null;
  const value = Number(`${digits || '0'}.${decPart || '0'}`);
  if (!Number.isFinite(value) || value > 1e12) return null;
  return roundCents(value);
}

/** Inverse of parseAmount for pre-filling an input in the person's convention. */
export function amountToInput(value: number, currency: CurrencyCode): string {
  if (!value) return '';
  // "3.000" / "1.234,56" (BRL, EUR) or "3,000" / "1,234.56" (USD); no trailing ",00".
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(roundCents(value));
}
