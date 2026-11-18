import { useState } from 'react';
import { ChevronLeft, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { TransactionCategory } from '../types';

export default function ReceiveMoney() {
  const navigate = useNavigate();
  const { data, addTransaction } = useApp();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Salary');
  const [note, setNote] = useState('');

  const currency = data.profile.currency;
  const currencySymbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    if (!source.trim()) {
      alert('Ingresa la fuente del ingreso');
      return;
    }

    await addTransaction({
      type: 'income',
      amount: parseFloat(amount),
      category,
      description: note || `Ingreso de ${source}`,
      date: new Date().toISOString(),
      recipientName: source,
      status: 'completed',
    });

    navigate('/');
  };

  return (
    <div className="min-h-dvh">
      <div className="border-b border-slate-100 bg-[var(--bg-elevated)] px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="pressable rounded-xl p-2 text-[var(--text)]"
            aria-label="Volver"
          >
            <ChevronLeft size={24} strokeWidth={1.75} />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">Recibir Dinero</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        <div className="glass-card mb-6 rounded-[28px] p-6">
          <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">Origen</label>
          <div className="mb-6 flex items-center gap-3 rounded-2xl field-input p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
              {source ? (
                <span className="text-lg font-semibold">{source.charAt(0).toUpperCase()}</span>
              ) : (
                <Banknote size={22} strokeWidth={1.75} />
              )}
            </div>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Fuente del ingreso"
              className="min-w-0 flex-1 bg-transparent font-medium text-[var(--text)] outline-none"
              required
            />
          </div>

          <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">Monto</label>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold tracking-tight text-emerald-600">
              {currencySymbol}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="field-input w-full py-4 pl-16 pr-4 text-3xl font-bold tracking-tight"
              required
            />
          </div>

          <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            className="mb-4 w-full rounded-2xl field-input p-4 font-medium text-[var(--text)] outline-none ring-emerald-500 focus:ring-2"
          >
            <option value="Salary">Salario</option>
            <option value="Freelance">Freelance</option>
            <option value="Investment">Inversión</option>
            <option value="Gift">Regalo</option>
            <option value="Other">Otro</option>
          </select>

          <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">Nota (opcional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Agregar una nota..."
            rows={3}
            className="field-input"
          />
        </div>

        <button
          type="submit"
          className="pressable w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/25"
        >
          Registrar Ingreso
        </button>
      </form>
    </div>
  );
}
