import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { TransactionCategory } from '../types';

const quickAmounts = [100, 200, 500];

export default function SendMoney() {
  const navigate = useNavigate();
  const { data, addTransaction } = useApp();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Other');
  const [note, setNote] = useState('');

  const currency = data.profile.currency;
  const currencySymbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    if (!recipient.trim()) {
      alert('Ingresa el nombre del destinatario');
      return;
    }

    await addTransaction({
      type: 'expense',
      amount: parseFloat(amount),
      category,
      description: note || `Transferencia a ${recipient}`,
      date: new Date().toISOString(),
      recipientName: recipient,
      status: 'completed',
    });

    navigate('/');
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="border-b border-slate-100 bg-white px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="pressable rounded-xl p-2 text-slate-700"
            aria-label="Volver"
          >
            <ChevronLeft size={24} strokeWidth={1.75} />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Enviar Dinero</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        <div className="glass-card mb-6 rounded-[28px] p-6">
          <label className="mb-2 block text-sm font-medium text-slate-500">Destinatario</label>
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-semibold text-white">
              {recipient ? recipient.charAt(0).toUpperCase() : '?'}
            </div>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Nombre del destinatario"
              className="min-w-0 flex-1 bg-transparent font-medium text-slate-900 outline-none"
              required
            />
          </div>

          <label className="mb-2 block text-sm font-medium text-slate-500">Monto</label>
          <div className="relative mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold tracking-tight text-blue-600">
              {currencySymbol}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-2xl bg-slate-50 py-4 pl-16 pr-4 text-3xl font-bold tracking-tight text-slate-900 outline-none ring-blue-500 focus:ring-2"
              required
            />
          </div>

          <div className="mb-6 flex gap-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(String(quickAmount))}
                className="pressable flex-1 rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-600"
              >
                {currencySymbol}
                {quickAmount}
              </button>
            ))}
          </div>

          <label className="mb-2 block text-sm font-medium text-slate-500">Categoría</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            className="mb-4 w-full rounded-2xl bg-slate-50 p-4 font-medium text-slate-900 outline-none ring-blue-500 focus:ring-2"
          >
            <option value="Other">Otro</option>
            <option value="Food & Drink">Comida y Bebida</option>
            <option value="Shopping">Compras</option>
            <option value="Transport">Transporte</option>
            <option value="Entertainment">Entretenimiento</option>
            <option value="Bills">Facturas</option>
            <option value="Healthcare">Salud</option>
            <option value="Education">Educación</option>
            <option value="Travel">Viajes</option>
          </select>

          <label className="mb-2 block text-sm font-medium text-slate-500">Nota (opcional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Agregar una nota..."
            rows={3}
            className="w-full resize-none rounded-2xl bg-slate-50 p-4 text-slate-900 outline-none ring-blue-500 focus:ring-2"
          />
        </div>

        <button
          type="submit"
          className="pressable w-full rounded-2xl bg-gradient-to-r from-blue-600 to-sky-400 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25"
        >
          Enviar Ahora
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          La transacción se registrará inmediatamente
        </p>
      </form>
    </div>
  );
}
