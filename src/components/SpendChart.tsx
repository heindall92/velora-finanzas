import { useState } from 'react';
import { capFirst, localeOf } from '../lib/i18n';
import { formatMoneyCompact } from '../lib/money';
import { niceTicks, type Bucket, type PeriodKind } from '../lib/stats';
import { useApp } from '../state/AppState';

/**
 * Bars without a chart library (Chart.js was ~200 KB of the old bundle).
 * dashboard-design: round ticks from 0, 5–7 x labels, pastel bars with a solid cap,
 * the unfinished bucket drawn as a dashed outline, one dark tooltip with the exact value.
 */
export default function SpendChart({ buckets, kind }: { buckets: Bucket[]; kind: PeriodKind }) {
  const { data, money, currency, t } = useApp();
  const locale = localeOf(data.profile.language);
  const [active, setActive] = useState<number | null>(null);

  const max = Math.max(...buckets.map((b) => b.total), 0);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;

  const label = (b: Bucket, long = false) =>
    kind === 'year'
      ? b.at.toLocaleDateString(locale, { month: long ? 'long' : 'short' })
      : kind === 'week'
        ? b.at.toLocaleDateString(locale, long ? { weekday: 'long', day: 'numeric', month: 'short' } : { weekday: 'short' })
        : long
          ? b.at.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
          : String(b.at.getDate());

  // Month: label every ~5th day so labels never collide on a phone.
  const showLabel = (i: number) => kind !== 'month' || i === 0 || (i + 1) % 5 === 0;
  const sel = active !== null ? buckets[active] : null;

  return (
    <figure className="m-0" aria-label={t('chartLabel', { unit: kind === 'year' ? t('unitMonth') : t('unitDay') })}>
      <div className="relative h-48 select-none sm:h-56 lg:h-72" onPointerLeave={() => setActive(null)}>
        {/* Y gridlines + labels on the right edge, next to the latest values. */}
        {ticks.map((v) => (
          <div key={v} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `calc(${(v / top) * 100}% - 0.5px)` }} aria-hidden="true">
            <div className={`h-px flex-1 ${v === 0 ? 'bg-line-strong' : 'bg-line'}`} />
            <span className="num w-16 -translate-y-px whitespace-nowrap text-right text-[11px] leading-none text-muted">{v === 0 ? '0' : formatMoneyCompact(v, currency)}</span>
          </div>
        ))}

        <div className="absolute inset-y-0 left-0 right-[4.5rem] flex items-end gap-[3px] sm:gap-1">
          {buckets.map((b, i) => {
            const h = (b.total / top) * 100;
            const isActive = active === i;
            const tone = 'var(--color-accent)';
            return (
              <button
                key={b.start}
                type="button"
                className="group relative flex h-full flex-1 items-end justify-center rounded-md outline-offset-0 focus-visible:outline-2"
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                onClick={() => setActive(isActive ? null : i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${label(b, true)}: ${money(b.total)}`}
              >
                {isActive && <span className="absolute inset-0 rounded-md bg-soft" aria-hidden="true" />}
                {b.future ? (
                  <span className="relative h-[3px] w-full max-w-7 rounded-full bg-line" aria-hidden="true" />
                ) : (
                  <span
                    className="relative w-full max-w-7 overflow-hidden rounded-t-[5px] rounded-b-[2px] transition-[height] duration-500 ease-[var(--ease-out)]"
                    style={{
                      height: b.total > 0 ? `max(${h}%, 4px)` : '3px',
                      background: b.total > 0 ? `color-mix(in srgb, ${tone} ${b.current ? 30 : 22}%, transparent)` : 'var(--color-line)',
                      outline: b.current && b.total > 0 ? `1.5px dashed color-mix(in srgb, ${tone} 70%, transparent)` : undefined,
                      outlineOffset: -1.5,
                    }}
                    aria-hidden="true"
                  >
                    {b.total > 0 && <span className="absolute inset-x-0 top-0 h-[5px] rounded-t-[5px]" style={{ background: tone }} />}
                  </span>
                )}
              </button>
            );
          })}
          {sel && (
            <div
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl bg-tip px-3 py-2 text-white shadow-[var(--shadow-pop)]"
              style={{ left: `clamp(3.5rem, ${((active! + 0.5) / buckets.length) * 100}%, calc(100% - 3.5rem))` }}
              role="status"
            >
              <p className="num whitespace-nowrap text-base font-semibold">{money(sel.total)}</p>
              <p className="whitespace-nowrap text-xs text-white/70">{capFirst(label(sel, true))}</p>
            </div>
          )}
        </div>

      </div>

      <div className="mr-[4.5rem] mt-2 flex gap-[3px] sm:gap-1" aria-hidden="true">
        {buckets.map((b, i) => (
          <span
            key={b.start}
            className={`num relative flex flex-1 justify-center overflow-visible whitespace-nowrap text-[11px] ${b.current ? 'font-semibold text-accent-ink' : 'text-muted'}`}
          >
            {showLabel(i) ? capFirst(label(b)) : '\u00a0'}
          </span>
        ))}
      </div>
    </figure>
  );
}
