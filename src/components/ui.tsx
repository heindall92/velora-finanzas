import type { LucideIcon } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { getCategory } from '../lib/categories';

/** Category icon in a soft tinted square. Hue at low alpha: quiet in both themes. */
export function CategoryBadge({ id, size = 40 }: { id: string; size?: number }) {
  const c = getCategory(id);
  const Icon = c.icon;
  return (
    <span
      aria-hidden="true"
      className="inline-grid shrink-0 place-items-center rounded-xl"
      style={{
        width: size,
        height: size,
        background: `hsl(${c.hue} 70% 50% / 0.13)`,
        color: `light-dark(hsl(${c.hue} 65% 34%), hsl(${c.hue} 75% 72%))`,
      }}
    >
      <Icon size={Math.round(size * 0.45)} strokeWidth={1.75} />
    </span>
  );
}


export function PageHeader({ title, actions, sub }: { title: string; actions?: ReactNode; sub?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-4 pb-5 pt-2 lg:pt-0">
      <div className="min-w-0">
        <h1 className="display truncate text-[1.75rem] font-bold text-ink lg:text-[2rem]">{title}</h1>
        {sub && <div className="mt-1 text-sm text-muted">{sub}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[0.9375rem] font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent-ink">
        <Icon size={26} strokeWidth={1.6} aria-hidden="true" />
      </span>
      <p className="font-semibold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-xs text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** "‹ Novembro 2026 ›" stepper. */
export function PeriodStepper({
  label,
  onPrev,
  onNext,
  nextDisabled,
  prevLabel,
  nextLabel,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" className="icon-btn press hover-soft" onClick={onPrev} aria-label={prevLabel}>
        <ChevronLeft size={20} strokeWidth={1.75} />
      </button>
      <span className="min-w-[8.5rem] text-center text-sm font-semibold text-ink" aria-live="polite">
        {label}
      </span>
      <button
        type="button"
        className="icon-btn press hover-soft disabled:opacity-30"
        onClick={onNext}
        disabled={nextDisabled}
        aria-label={nextLabel}
      >
        <ChevronRight size={20} strokeWidth={1.75} />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} title={o.label}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Hidden-balance dots that keep the same rhythm as a number. */
export function Masked({ hidden, children }: { hidden: boolean; children: ReactNode }) {
  return hidden ? <span aria-label="•••">••••••</span> : <>{children}</>;
}
