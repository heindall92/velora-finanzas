import { useState } from 'react';
import { ChevronLeft, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const quickAmounts = [50, 100, 200];

export default function TopUp() {
  const navigate = useNavigate();
  const { data, addTransaction } = useApp();
  const [amount, setAmount] = useState('');

  const currency = data.profile.currency;
  const currencySymbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    await addTransaction({
      type: 'income',
      amount: parseFloat(amount),
      category: 'Other',
      description: 'Recarga de saldo',
      date: new Date().toISOString(),
      status: 'completed',
    });

    navigate('/cards');
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Recargar Saldo</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        <div className="glass-card mb-6 rounded-[28px] p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-lg shadow-blue-500/30">
              <CreditCard size={36} strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Añadir dinero a tu cuenta
            </h2>
            <p className="mt-1 text-sm text-slate-500">Simula una recarga de saldo</p>
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
                className="pressable flex-1 rounded-xl bg-sky-50 px-4 py-3 font-medium text-sky-600"
              >
                {currencySymbol}
                {quickAmount}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-sky-50 p-4">
            <p className="text-sm text-sky-900">
              <strong>Nota:</strong> Se registrará como ingreso en tu saldo. No hay
              pagos reales ni conexión bancaria.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="pressable w-full rounded-2xl bg-gradient-to-r from-blue-600 to-sky-400 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25"
        >
          Añadir Dinero
        </button>
      </form>
    </div>
  );
}
