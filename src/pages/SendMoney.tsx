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
          <h1 className="text-xl font-bold text-gray-900">Enviar Dinero</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Destinatario
            </label>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg">
                {recipient ? recipient.charAt(0).toUpperCase() : '?'}
              </div>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Nombre del destinatario"
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
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-purple-600">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-16 pr-4 py-4 text-3xl font-bold text-gray-900 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500"
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
                className="flex-1 py-3 px-4 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100 transition-colors"
              >
                {currencySymbol}{quickAmount}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-500 mb-2">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-medium"
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
              className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
        >
          Enviar Ahora
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          La transacción se registrará inmediatamente
        </p>
      </form>
    </div>
  );
}
