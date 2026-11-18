import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Recibir Dinero</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Origen
            </label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-lg">
                {source ? source.charAt(0).toUpperCase() : '💰'}
              </div>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Fuente del ingreso"
                className="flex-1 bg-transparent outline-none text-gray-900 font-medium"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Monto
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-green-600">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-16 pr-4 py-4 text-3xl font-bold text-gray-900 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
            >
              <option value="Salary">Salario</option>
              <option value="Freelance">Freelance</option>
              <option value="Investment">Inversión</option>
              <option value="Gift">Regalo</option>
              <option value="Other">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Nota (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Agregar una nota..."
              rows={3}
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 text-gray-900 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          Registrar Ingreso
        </button>
      </form>
    </div>
  );
}
