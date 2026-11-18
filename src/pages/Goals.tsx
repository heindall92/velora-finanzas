import { Plus, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { GoalIcon } from '../components/icons';
import BottomSheet from '../components/BottomSheet';

export default function Goals() {
  const { data, addGoal, updateGoal } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    description: '',
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) {
      alert('Completa los campos requeridos');
      return;
    }

    await addGoal({
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      description: newGoal.description,
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Objetivos</h1>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="pressable rounded-2xl bg-blue-100 p-2.5 text-blue-600"
            aria-label="Nuevo objetivo"
          >
            <Plus size={22} strokeWidth={2} />
          </button>
        </div>

        {featuredGoal ? (
          <div className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-sky-400 to-cyan-500 p-6 text-white shadow-[0_16px_40px_rgba(14,165,233,0.3)]">
            {featuredGoal.imageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url(${featuredGoal.imageUrl})` }}
              />
            )}
            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <GoalIcon name={featuredGoal.name} size={20} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{featuredGoal.name}</h2>
              </div>

              {featuredGoal.description && (
                <p className="mb-4 text-sm text-white/90">{featuredGoal.description}</p>
              )}

              <div className="mb-4">
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight tabular-nums">
                    {formatCurrency(featuredGoal.currentAmount)}
                  </span>
                  <span className="text-sm text-white/85">
                    de {formatCurrency(featuredGoal.targetAmount)}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-white/30">
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

              <div className="flex items-center justify-between text-sm text-white/90">
                <span>
                  {(
                    (featuredGoal.currentAmount / featuredGoal.targetAmount) *
                    100
                  ).toFixed(0)}
                  % completado
                </span>
                {featuredGoal.deadline && (
                  <span>
                    {new Date(featuredGoal.deadline).toLocaleDateString('es-ES', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-[28px] bg-gradient-to-br from-sky-100 to-blue-100 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
              <Target size={28} className="text-blue-600" strokeWidth={1.75} />
            </div>
            <h3 className="mb-2 text-xl font-bold tracking-tight text-slate-900">
              Crea tu primer objetivo
            </h3>
            <p className="mb-4 text-slate-600">
              Establece metas financieras y haz seguimiento de tu progreso
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="pressable rounded-2xl bg-blue-600 px-6 py-3 font-medium text-white"
            >
              Crear Objetivo
            </button>
          </div>
        )}

        {otherGoals.length > 0 && (
          <>
            <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">
              Otros Objetivos
            </h3>
            <div className="space-y-3">
              {otherGoals.map((goal) => (
                <div key={goal.id} className="glass-card rounded-[22px] p-5">
                  <div className="mb-3 flex items-start gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${
                        goal.color || 'from-sky-400 to-blue-600'
                      } text-white`}
                    >
                      <GoalIcon name={goal.name} size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-900">{goal.name}</h4>
                      {goal.description && (
                        <p className="mt-0.5 text-sm text-slate-500">{goal.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="tabular-nums text-slate-600">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="tabular-nums text-slate-500">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 transition-[width] duration-500"
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
                      {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}% completado
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const amount = prompt('¿Cuánto quieres añadir?');
                        if (amount && parseFloat(amount) > 0) {
                          handleContribute(goal.id, parseFloat(amount));
                        }
                      }}
                      className="pressable rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600"
                    >
                      + Añadir
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
        title="Nuevo Objetivo"
      >
        <form onSubmit={handleAddGoal} className="space-y-4 pb-2">
          <Field label="Nombre del objetivo *">
            <input
              type="text"
              value={newGoal.name}
              onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              placeholder="ej. Vacaciones, Nuevo auto..."
              className="field-input"
              required
            />
          </Field>
          <Field label="Monto objetivo *">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
              placeholder="0.00"
              className="field-input"
              required
            />
          </Field>
          <Field label="Monto inicial (opcional)">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={newGoal.currentAmount}
              onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
              placeholder="0.00"
              className="field-input"
            />
          </Field>
          <Field label="Descripción (opcional)">
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="¿Para qué es este objetivo?"
              rows={3}
              className="field-input"
            />
          </Field>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="pressable flex-1 rounded-2xl bg-slate-100 py-3 font-medium text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="pressable flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-400 py-3 font-medium text-white"
            >
              Crear
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
      <label className="mb-2 block text-sm font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}
