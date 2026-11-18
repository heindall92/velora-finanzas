import { Plus, Target, Sparkles, PiggyBank } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { GoalIcon } from '../components/icons';
import BottomSheet from '../components/BottomSheet';
import { localeFor, t } from '../i18n';

export default function Goals() {
  const { data, addGoal, updateGoal } = useApp();
  const lang = data.profile.language;
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    description: '',
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(localeFor(lang), {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;

    await addGoal({
      name: newGoal.name.trim(),
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      description: newGoal.description.trim() || undefined,
      color: 'from-sky-400 to-blue-600',
      icon: 'target',
    });

    setShowAddModal(false);
    setNewGoal({ name: '', targetAmount: '', currentAmount: '', description: '' });
  };

  const handleContribute = async (goalId: string, amount: number) => {
    const goal = data.goals.find((g) => g.id === goalId);
    if (goal) {
      await updateGoal(goalId, { currentAmount: goal.currentAmount + amount });
    }
  };

  const featuredGoal = data.goals[0];
  const otherGoals = data.goals.slice(1);

  return (
    <div>
      <div className="px-5 pt-6 pb-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            {t(lang, 'goals')}
          </h1>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="pressable rounded-2xl bg-blue-100 p-2.5 text-blue-600"
            aria-label={t(lang, 'newGoal')}
          >
            <Plus size={22} strokeWidth={2} />
          </button>
        </div>

        {featuredGoal ? (
          <div className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-500 to-sky-400 p-6 text-white shadow-[0_16px_40px_rgba(0,102,255,0.3)]">
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/10"
              aria-hidden
            />
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <GoalIcon name={featuredGoal.name} size={22} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-white/80">
                    {t(lang, 'featuredGoal')}
                  </p>
                  <h2 className="truncate text-xl font-bold tracking-tight">
                    {featuredGoal.name}
                  </h2>
                </div>
              </div>

              {featuredGoal.description && (
                <p className="mb-4 text-sm text-white/90">{featuredGoal.description}</p>
              )}

              <div className="mb-3">
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight tabular-nums">
                    {formatCurrency(featuredGoal.currentAmount)}
                  </span>
                  <span className="text-sm text-white/85">
                    {t(lang, 'ofTarget')} {formatCurrency(featuredGoal.targetAmount)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-3 rounded-full bg-white transition-[width] duration-500"
                    style={{
                      width: `${Math.min(
                        (featuredGoal.currentAmount / featuredGoal.targetAmount) * 100,
                        100
                      )}%`,
                      transitionTimingFunction: 'var(--ease-out)',
                    }}
                  />
                </div>
              </div>

              <p className="text-sm text-white/90">
                {(
                  (featuredGoal.currentAmount / featuredGoal.targetAmount) *
                  100
                ).toFixed(0)}
                % {t(lang, 'completedPct')}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative mb-6 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--bg-elevated)] p-7 shadow-[var(--card-shadow)]">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,102,255,0.12),transparent_55%)]"
              aria-hidden
            />
            <div className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_12px_28px_rgba(0,102,255,0.28)]">
                <PiggyBank size={30} strokeWidth={1.6} />
              </div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950">
                <Sparkles size={12} strokeWidth={2} />
                {t(lang, 'goals')}
              </div>
              <h3 className="mb-2 text-xl font-bold tracking-tight text-[var(--text)]">
                {t(lang, 'firstGoalTitle')}
              </h3>
              <p className="mx-auto mb-5 max-w-xs text-sm text-[var(--text-muted)]">
                {t(lang, 'firstGoalSub')}
              </p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="pressable inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-[0_8px_24px_rgba(0,102,255,0.28)]"
              >
                <Target size={18} strokeWidth={2} />
                {t(lang, 'createGoal')}
              </button>
            </div>
          </div>
        )}

        {otherGoals.length > 0 && (
          <>
            <h3 className="mb-4 text-lg font-semibold tracking-tight text-[var(--text)]">
              {t(lang, 'otherGoals')}
            </h3>
            <div className="space-y-3">
              {otherGoals.map((goal) => (
                <div key={goal.id} className="glass-card rounded-[22px] p-5">
                  <div className="mb-3 flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white">
                      <GoalIcon name={goal.name} size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-[var(--text)]">{goal.name}</h4>
                      {goal.description && (
                        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="tabular-nums text-[var(--text-muted)]">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="tabular-nums text-[var(--text-muted)]">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-[width] duration-500"
                        style={{
                          width: `${Math.min(
                            (goal.currentAmount / goal.targetAmount) * 100,
                            100
                          )}%`,
                          transitionTimingFunction: 'var(--ease-out)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">
                      {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%{' '}
                      {t(lang, 'completedPct')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const amount = prompt(
                          lang === 'pt' ? 'Quanto deseja adicionar?' : '¿Cuánto quieres añadir?'
                        );
                        if (amount && parseFloat(amount) > 0) {
                          handleContribute(goal.id, parseFloat(amount));
                        }
                      }}
                      className="pressable rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
                    >
                      {t(lang, 'add')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomSheet
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t(lang, 'newGoal')}
      >
        <form onSubmit={handleAddGoal} className="space-y-4 pb-2">
          <Field label={`${t(lang, 'goalName')} *`}>
            <input
              type="text"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              placeholder={t(lang, 'goalNamePlaceholder')}
              className="field-input"
              required
            />
          </Field>
          <Field label={`${t(lang, 'goalTarget')} *`}>
            <input
              type="text"
              inputMode="decimal"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              placeholder="0,00"
              className="field-input"
              required
            />
          </Field>
          <Field label={t(lang, 'goalInitial')}>
            <input
              type="text"
              inputMode="decimal"
              value={newGoal.currentAmount}
              onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
              placeholder="0,00"
              className="field-input"
            />
          </Field>
          <Field label={t(lang, 'noteOptional')}>
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder={t(lang, 'goalDescPlaceholder')}
              rows={3}
              className="field-input"
            />
          </Field>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="pressable flex-1 rounded-2xl bg-[var(--border)] py-3 font-medium text-[var(--text)]"
            >
              {t(lang, 'cancel')}
            </button>
            <button
              type="submit"
              className="pressable flex-1 rounded-2xl bg-blue-600 py-3 font-medium text-white"
            >
              {t(lang, 'create')}
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">{label}</label>
      {children}
    </div>
  );
}
