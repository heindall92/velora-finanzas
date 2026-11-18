import { Minus, Pencil, Plus, Target, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import Sheet from '../components/Sheet';
import MoneyInput from '../components/MoneyInput';
import { GOAL_ICON_MAP } from '../components/goalIcons';
import { EmptyState, PageHeader } from '../components/ui';
import { fromDayKey } from '../lib/dates';
import { localeOf } from '../lib/i18n';
import { amountToInput, parseAmount } from '../lib/money';
import { GOAL_ICONS } from '../lib/schema';
import { goalPlan } from '../lib/stats';
import type { Goal, GoalIcon } from '../lib/types';
import { useApp } from '../state/AppState';

export default function Goals() {
  const { data, t, money, today } = useApp();
  const locale = localeOf(data.profile.language);
  const [editing, setEditing] = useState<Goal | 'new' | null>(null);
  const [moving, setMoving] = useState<{ goal: Goal; dir: 1 | -1 } | null>(null);

  return (
    <>
      <PageHeader
        title={t('goals')}
        actions={
          data.goals.length > 0 && (
            <button type="button" className="btn btn-primary press min-h-10 px-3.5 text-sm" onClick={() => setEditing('new')}>
              <Plus size={18} strokeWidth={2.25} aria-hidden="true" />
              {t('newGoal')}
            </button>
          )
        }
      />

      {data.goals.length === 0 ? (
        <section className="card">
          <EmptyState
            icon={Target}
            title={t('goalsEmptyTitle')}
            body={t('goalsEmptyBody')}
            action={
              <button type="button" className="btn btn-primary press" onClick={() => setEditing('new')}>
                {t('createGoal')}
              </button>
            }
          />
        </section>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.goals.map((g) => {
            const p = goalPlan(g, today);
            const Icon = GOAL_ICON_MAP[g.icon];
            const color = p.done ? 'var(--color-money)' : 'var(--color-accent)';
            const deadline = g.deadline ? fromDayKey(g.deadline).toLocaleDateString(locale, { month: 'short', year: 'numeric' }) : '';
            return (
              <li key={g.id} className="rounded-[1.25rem] border border-line bg-soft p-1.5">
                <div className="flex items-center gap-2.5 px-2.5 pb-2 pt-1">
                  <Icon size={16} strokeWidth={1.75} className="text-ink-2" aria-hidden="true" />
                  <h2 className="min-w-0 flex-1 truncate text-[0.875rem] font-semibold text-ink">{g.name}</h2>
                  <button type="button" className="icon-btn press -mr-1.5 h-8 w-8" onClick={() => setEditing(g)} aria-label={`${t('editGoal')}: ${g.name}`}>
                    <Pencil size={15} strokeWidth={1.75} />
                  </button>
                </div>
                <div className="rounded-[0.95rem] border border-line bg-card p-4">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="num display text-[1.625rem] font-semibold text-ink">{money(g.saved)}</span>
                    <span className="num text-[0.8125rem] text-muted">{t('budgetOf', { total: money(g.target) })}</span>
                  </p>
                  <div
                    className="ticks mt-3"
                    style={{ '--fill': p.ratio, '--tick-color': color } as React.CSSProperties}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(p.ratio * 100)}
                    aria-label={g.name}
                  />
                  <div className="mt-3 flex items-center justify-between gap-2 text-[0.8125rem]">
                    <span className={`num font-medium ${p.done ? 'text-money' : p.overdue ? 'text-warn' : 'text-ink'}`}>
                      {p.done ? t('goalDone') : t('goalLeft', { amount: money(p.left) })}
                    </span>
                    <span className="num text-muted">{Math.round(p.ratio * 100)}%</span>
                  </div>
                  <p className="num mt-1 text-[0.8125rem] text-muted">
                    {p.done ? ' ' : p.overdue ? t('goalOverdue') : p.perMonth !== null ? t('goalPerMonth', { amount: money(p.perMonth), date: deadline }) : t('goalNoDeadline')}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button type="button" className="btn btn-secondary press min-h-10 text-sm" onClick={() => setMoving({ goal: g, dir: -1 })} disabled={g.saved <= 0}>
                      <Minus size={16} strokeWidth={2} aria-hidden="true" />
                      {t('withdraw')}
                    </button>
                    <button type="button" className="btn btn-primary press min-h-10 text-sm" onClick={() => setMoving({ goal: g, dir: 1 })}>
                      <Plus size={16} strokeWidth={2} aria-hidden="true" />
                      {t('deposit')}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <GoalForm goal={editing} onClose={() => setEditing(null)} />
      <MoveSheet state={moving} onClose={() => setMoving(null)} />
    </>
  );
}

function GoalForm({ goal, onClose }: { goal: Goal | 'new' | null; onClose: () => void }) {
  // Remount the inner form per goal so its fields start fresh.
  const key = goal === null ? 'closed' : goal === 'new' ? 'new' : goal.id;
  return <GoalFormInner key={key} goal={goal} onClose={onClose} />;
}

function GoalFormInner({ goal, onClose }: { goal: Goal | 'new' | null; onClose: () => void }) {
  const { t, currency, addGoal, updateGoal, removeGoal } = useApp();
  const existing = goal && goal !== 'new' ? goal : null;
  const [name, setName] = useState(existing?.name ?? '');
  const [target, setTarget] = useState(existing ? amountToInput(existing.target, currency) : '');
  const [saved, setSaved] = useState(existing ? amountToInput(existing.saved, currency) : '');
  const [deadline, setDeadline] = useState(existing?.deadline ?? '');
  const [icon, setIcon] = useState<GoalIcon>(existing?.icon ?? 'target');
  const [errors, setErrors] = useState<{ name?: string; target?: string }>({});
  const formId = useId();
  const ids = { name: useId(), target: useId(), saved: useId(), deadline: useId() };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const tgt = parseAmount(target);
    const sv = parseAmount(saved) ?? 0;
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = t('goalNameInvalid');
    if (!tgt || tgt <= 0) errs.target = t('goalTargetInvalid');
    setErrors(errs);
    if (errs.name || errs.target) return;
    const input = { name: name.trim().slice(0, 60), target: tgt!, saved: sv, icon, ...(deadline ? { deadline } : { deadline: undefined }) };
    if (existing) updateGoal(existing.id, input);
    else addGoal(input);
    onClose();
  };

  return (
    <Sheet
      open={goal !== null}
      onClose={onClose}
      title={existing ? t('editGoal') : t('newGoal')}
      closeLabel={t('close')}
      footer={
        <div className="flex gap-2">
          {existing && (
            <button
              type="button"
              className="btn btn-danger press px-4"
              aria-label={t('delete')}
              onClick={() => {
                removeGoal(existing.id);
                onClose();
              }}
            >
              <Trash2 size={18} strokeWidth={1.75} />
            </button>
          )}
          <button type="submit" form={formId} className="btn btn-primary press flex-1">
            {t('save')}
          </button>
        </div>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label htmlFor={ids.name} className="label">
            {t('goalName')}
          </label>
          <input
            id={ids.name}
            className="field"
            maxLength={60}
            placeholder={t('goalNamePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name ? true : undefined}
          />
          {errors.name && <p className="mt-1.5 text-sm text-down">{errors.name}</p>}
        </div>
        <fieldset>
          <legend className="label">{t('goalIcon')}</legend>
          <div className="grid grid-cols-8 gap-1.5" role="radiogroup">
            {GOAL_ICONS.map((ic) => {
              const Icon = GOAL_ICON_MAP[ic];
              const sel = icon === ic;
              return (
                <button
                  key={ic}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  aria-label={ic}
                  onClick={() => setIcon(ic)}
                  className={`press grid aspect-square place-items-center rounded-xl ${sel ? 'bg-accent/10 text-accent-ink ring-1 ring-inset ring-accent/40' : 'bg-soft text-ink-2'}`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={ids.target} className="label">
              {t('goalTarget')}
            </label>
            <MoneyInput id={ids.target} currency={currency} value={target} onChange={(e) => setTarget(e.target.value)} invalid={!!errors.target} />
          </div>
          <div>
            <label htmlFor={ids.saved} className="label">
              {t('goalSaved')}
            </label>
            <MoneyInput id={ids.saved} currency={currency} value={saved} onChange={(e) => setSaved(e.target.value)} />
          </div>
          {errors.target && <p className="col-span-2 -mt-1 text-sm text-down">{errors.target}</p>}
        </div>
        <div>
          <label htmlFor={ids.deadline} className="label">
            {t('goalDeadline')}
          </label>
          <input id={ids.deadline} type="date" className="field" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
      </form>
    </Sheet>
  );
}

function MoveSheet({ state, onClose }: { state: { goal: Goal; dir: 1 | -1 } | null; onClose: () => void }) {
  return <MoveSheetInner key={state ? `${state.goal.id}${state.dir}` : 'closed'} state={state} onClose={onClose} />;
}

function MoveSheetInner({ state, onClose }: { state: { goal: Goal; dir: 1 | -1 } | null; onClose: () => void }) {
  const { t, currency, moveGoal, money } = useApp();
  const [value, setValue] = useState('');
  const [err, setErr] = useState('');
  const id = useId();
  const formId = useId();
  if (!state) return null;
  const { goal, dir } = state;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseAmount(value);
    if (!v || v <= 0) {
      setErr(t('amountInvalid'));
      return;
    }
    moveGoal(goal.id, dir * (dir < 0 ? Math.min(v, goal.saved) : v));
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={dir > 0 ? t('depositTitle', { name: goal.name }) : t('withdrawTitle', { name: goal.name })}
      closeLabel={t('close')}
      footer={
        <button type="submit" form={formId} className="btn btn-primary press w-full">
          {dir > 0 ? t('deposit') : t('withdraw')}
        </button>
      }
    >
      <form id={formId} onSubmit={submit} noValidate>
        <label htmlFor={id} className="label">
          {t('amount')}
        </label>
        <MoneyInput
          id={id}
          autoFocus
          currency={currency}
          size="lg"
          value={value}
          invalid={!!err}
          onChange={(e) => {
            setValue(e.target.value);
            setErr('');
          }}
        />
        {err && <p className="mt-2 text-sm text-down">{err}</p>}
        <p className="num mt-3 text-[0.8125rem] text-muted">
          {money(goal.saved)} / {money(goal.target)}
        </p>
      </form>
    </Sheet>
  );
}
