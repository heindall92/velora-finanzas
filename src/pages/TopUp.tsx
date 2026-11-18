import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
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

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Recargar Saldo</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="mb-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-4xl">💳</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Añadir dinero a tu cuenta
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Simula una recarga de saldo
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Monto
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-blue-600">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-16 pr-4 py-4 text-3xl font-bold text-gray-900 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => handleQuickAmount(quickAmount)}
                className="flex-1 py-3 px-4 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors"
              >
                {currencySymbol}{quickAmount}
              </button>
            ))}
          </div>

          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="text-sm text-blue-900">
              <strong>Nota:</strong> Esta es una aplicación de demostración. 
              El dinero se registrará como un ingreso en tu balance.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          Añadir Dinero
        </button>
      </form>
    </div>
  );
}
