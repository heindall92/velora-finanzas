import { Plus, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

export default function Goals() {
  const { data, addGoal, updateGoal } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    description: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);
  };

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
      color: 'from-purple-400 to-pink-500',
      icon: '🎯',
    });

    setShowAddModal(false);
    setNewGoal({ name: '', targetAmount: '', currentAmount: '', description: '' });
  };

  const handleContribute = async (goalId: string, amount: number) => {
    const goal = data.goals.find(g => g.id === goalId);
    if (goal) {
      await updateGoal(goalId, {
        currentAmount: goal.currentAmount + amount,
      });
    }
  };

  const featuredGoal = data.goals[0];
  const otherGoals = data.goals.slice(1);

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Objetivos</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors"
          >
            <Plus size={24} />
          </button>
        </div>

        {featuredGoal ? (
          <div className="relative bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl p-6 text-white shadow-xl mb-6 overflow-hidden">
            {featuredGoal.imageUrl && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url(${featuredGoal.imageUrl})` }}
              />
            )}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{featuredGoal.icon || '🎯'}</span>
                <h2 className="text-2xl font-bold">{featuredGoal.name}</h2>
              </div>
              
              {featuredGoal.description && (
                <p className="text-sm opacity-90 mb-4">{featuredGoal.description}</p>
              )}

              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold">
                    {formatCurrency(featuredGoal.currentAmount)}
                  </span>
                  <span className="text-sm opacity-90">
                    de {formatCurrency(featuredGoal.targetAmount)}
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3">
                  <div
                    className="bg-white h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min((featuredGoal.currentAmount / featuredGoal.targetAmount) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">
                  {((featuredGoal.currentAmount / featuredGoal.targetAmount) * 100).toFixed(0)}% completado
                </span>
                {featuredGoal.deadline && (
                  <span className="text-sm opacity-90">
                    📅 {new Date(featuredGoal.deadline).toLocaleDateString('es-ES', { 
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl p-8 text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
              <Target size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Crea tu primer objetivo
            </h3>
            <p className="text-gray-600 mb-4">
              Establece metas financieras y haz seguimiento de tu progreso
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Crear Objetivo
            </button>
          </div>
        )}

        {otherGoals.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Otros Objetivos</h3>
            <div className="grid grid-cols-1 gap-4">
              {otherGoals.map((goal) => (
                <div key={goal.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${goal.color || 'from-purple-400 to-pink-500'} rounded-xl flex items-center justify-center text-2xl`}>
                      {goal.icon || '🎯'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                      {goal.description && (
                        <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                      <span className="text-gray-500">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-600">
                      {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}% completado
                    </span>
                    <button 
                      onClick={() => {
                        const amount = prompt('¿Cuánto quieres añadir?');
                        if (amount && parseFloat(amount) > 0) {
                          handleContribute(goal.id, parseFloat(amount));
                        }
                      }}
                      className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Objetivo</h3>
            <form onSubmit={handleAddGoal}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del objetivo *
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="ej. Vacaciones, Nuevo auto..."
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto objetivo *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="0.00"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto inicial (opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })}
                  placeholder="0.00"
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="¿Para qué es este objetivo?"
                  rows={3}
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-2xl font-medium hover:shadow-lg transition-shadow"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
