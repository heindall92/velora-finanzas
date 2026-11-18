import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, startOfMonth } from '../lib/dates';

/**
 * "‹ Set Out [Nov] Dez Jan ›" — the month picker people know from Brazilian finance apps.
 * Five months around the selected one; months after the current one are shown but disabled
 * (nothing happened there yet). Never scrolls sideways.
 */
export default function MonthStrip({
  value,
  onChange,
  today,
  locale,
  prevLabel,
  nextLabel,
}: {
  value: Date;
  onChange: (d: Date) => void;
  today: Date;
  locale: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const sel = startOfMonth(value);
  const cur = startOfMonth(today);
  const months = [-2, -1, 0, 1, 2].map((i) => addMonths(sel, i));
  const fmt = (d: Date) => {
    const m = d.toLocaleDateString(locale, { month: 'short' }).replace('.', '');
    const name = m.charAt(0).toUpperCase() + m.slice(1);
    // Year only where it changes meaning (another year), as a short suffix that fits: "Jan '27".
    return d.getFullYear() === today.getFullYear() ? name : `${name}\u2009'${String(d.getFullYear()).slice(2)}`;
  };
  const isFuture = (d: Date) => d.getTime() > cur.getTime();

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-line bg-card p-1 shadow-[var(--shadow-card)]" role="group" aria-label={sel.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}>
      <button type="button" className="icon-btn press h-10 w-10 shrink-0" onClick={() => onChange(addMonths(sel, -1))} aria-label={prevLabel}>
        <ChevronLeft size={20} strokeWidth={2} />
      </button>
      <div className="grid flex-1 grid-cols-5 gap-1">
        {months.map((d, i) => {
          const selected = i === 2;
          const future = isFuture(d);
          return (
            <button
              key={d.getTime()}
              type="button"
              disabled={future}
              aria-current={selected ? 'date' : undefined}
              onClick={() => onChange(d)}
              className={`press h-10 whitespace-nowrap rounded-xl px-0.5 text-[0.8125rem] min-[380px]:text-[0.875rem] ${
                selected ? 'bg-accent font-semibold text-white' : future ? 'text-muted/60' : 'font-medium text-ink-2 hover-soft'
              } ${i === 0 || i === 4 ? 'max-[359px]:hidden' : ''}`}
              title={d.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
            >
              {fmt(d)}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="icon-btn press h-10 w-10 shrink-0 disabled:opacity-30"
        onClick={() => onChange(addMonths(sel, 1))}
        disabled={isFuture(addMonths(sel, 1))}
        aria-label={nextLabel}
      >
        <ChevronRight size={20} strokeWidth={2} />
      </button>
    </div>
  );
}
