import { useState, type ReactNode } from 'react';

export interface Slice {
  id: string;
  value: number;
  color: string;
  label: string;
  icon?: ReactNode;
}

/**
 * Donut chart in plain SVG (no library). Tap/hover a slice or a legend row to highlight it;
 * the centre then shows that slice's share. Legend rows are buttons, so it works by keyboard
 * and screen reader too.
 */
export default function Donut({
  slices,
  format,
  centerLabel,
  centerValue,
  size = 168,
}: {
  slices: Slice[];
  format: (v: number) => string;
  centerLabel: string;
  centerValue: string;
  size?: number;
}) {
  const [active, setActive] = useState<string | null>(null);
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = 15.9155; // circumference = 100, so dash lengths are percentages
  const stroke = 4.6;
  const gap = slices.length > 1 ? 0.6 : 0;
  // Each slice starts where the previous ended; 25 = 12 o'clock. Computed up front (render stays pure).
  const offsets = slices.map((_, i) => 25 - slices.slice(0, i).reduce((a, x) => a + (total ? (x.value / total) * 100 : 0), 0));
  const sel = slices.find((s) => s.id === active);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-0" role="img" aria-label={`${centerLabel}: ${centerValue}`}>
          <circle cx="21" cy="21" r={r} fill="none" stroke="var(--color-soft)" strokeWidth={stroke} />
          {total > 0 &&
            slices.map((s, i) => {
              const pct = (s.value / total) * 100;
              const dash = Math.max(pct - gap, 0.01);
              const el = (
                <circle
                  key={s.id}
                  cx="21"
                  cy="21"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={active === s.id ? stroke + 1.4 : stroke}
                  strokeDasharray={`${dash} ${100 - dash}`}
                  strokeDashoffset={offsets[i]}
                  opacity={active && active !== s.id ? 0.35 : 1}
                  className="cursor-pointer transition-[opacity,stroke-width] duration-200"
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(s.id)}
                  onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
                  onClick={() => setActive((a) => (a === s.id ? null : s.id))}
                />
              );
              return el;
            })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="max-w-[70%] truncate text-[11px] font-medium text-muted">{sel ? sel.label : centerLabel}</span>
          <span className="num display text-[1.05rem] font-semibold text-ink">{sel ? `${Math.round((sel.value / total) * 100)}%` : centerValue}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-0.5">
        {slices.map((s) => {
          const pct = total ? (s.value / total) * 100 : 0;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActive((a) => (a === s.id ? null : s.id))}
                onFocus={() => setActive(s.id)}
                onBlur={() => setActive(null)}
                aria-pressed={active === s.id}
                className={`press flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left ${active === s.id ? 'bg-soft' : 'hover-soft'}`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                {s.icon}
                <span className="min-w-0 flex-1 truncate text-[0.875rem] text-ink">{s.label}</span>
                <span className="num shrink-0 text-right text-[0.875rem] font-medium text-ink">{format(s.value)}</span>
                <span className="num w-9 shrink-0 text-right text-[0.8125rem] text-muted">{pct > 0 && pct < 1 ? '<1' : Math.round(pct)}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
