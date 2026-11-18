import { categoryLabel } from '../lib/categories';
import type { CategoryTotal, Delta } from '../lib/stats';
import { useApp } from '../state/AppState';
import { CategoryBadge } from './ui';

/** Ranked list with a slim 3px share bar along each row (dashboard-design: ranked breakdown). */
export function CategoryBreakdown({ items, limit }: { items: CategoryTotal[]; limit?: number }) {
  const { data, money } = useApp();
  const lang = data.profile.language;
  const shown = limit ? items.slice(0, limit) : items;
  return (
    <ul className="space-y-1">
      {shown.map((c) => {
        const pct = c.share * 100;
        return (
          <li key={c.id} className="relative flex items-center gap-3 rounded-xl px-2 pb-3 pt-2">
            <CategoryBadge id={c.id} size={34} />
            <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-ink">{categoryLabel(c.id, lang)}</span>
            <span className="num text-[0.9375rem] font-medium text-ink">{money(c.total)}</span>
            <span className="num w-11 text-right text-[0.8125rem] text-muted">{pct < 1 && pct > 0 ? '<1%' : `${Math.round(pct)}%`}</span>
            <span className="absolute inset-x-2 bottom-0.5 h-[3px] overflow-hidden rounded-full bg-line" aria-hidden="true">
              <span className="block h-full rounded-full bg-accent/75" style={{ width: `${Math.max(pct, 1)}%` }} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Delta for spending: neutral grey both ways (spending more isn't "bad" by itself, the budget tile
 * says that). A tiny base reads "before R$ 3,00" instead of a shouting +900%.
 */
export function DeltaText({ delta, baseline, tip }: { delta: Delta; baseline: string; tip?: string }) {
  const { t, money } = useApp();
  // Nothing spent before: there is no comparison, say so instead of "before R$ 0,00".
  if (delta.kind === 'none' || (delta.kind === 'small' && delta.previous === 0)) return <span className="text-[0.8125rem] text-muted">{t('noCompare')}</span>;
  if (delta.kind === 'small')
    return (
      <span className="num text-[0.8125rem] text-muted" title={tip}>
        {t('was', { amount: money(delta.previous) })} · {baseline}
      </span>
    );
  const pct = delta.pct;
  const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '±';
  const txt = Math.abs(pct) > 999 ? '10×+' : `${Math.abs(pct).toLocaleString(undefined, { maximumFractionDigits: Math.abs(pct) < 10 ? 1 : 0 })}%`;
  return (
    <span className="num text-[0.8125rem] text-muted" title={`${tip ?? baseline}: ${money(delta.previous)}`}>
      <span className="font-medium text-ink-2">
        {arrow} {txt}
      </span>{' '}
      {baseline}
    </span>
  );
}
