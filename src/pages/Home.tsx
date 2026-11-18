import { Send, Download, Plus, MoreHorizontal, Eye, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const categoryColors: Record<string, string> = {
  'Food & Drink': 'bg-green-100 text-green-600',
  'Shopping': 'bg-pink-100 text-pink-600',
  'Transport': 'bg-yellow-100 text-yellow-600',
  'Entertainment': 'bg-purple-100 text-purple-600',
  'Bills': 'bg-blue-100 text-blue-600',
  'Salary': 'bg-green-100 text-green-600',
  'Other': 'bg-gray-100 text-gray-600',
};

const categoryIcons: Record<string, string> = {
  'Food & Drink': '🍽️',
  'Shopping': '🛍️',
  'Transport': '🚗',
  'Entertainment': '🎬',
  'Bills': '💡',
  'Salary': '💰',
  'Other': '📋',
};

export default function Home() {
  const { data } = useApp();
  const navigate = useNavigate();

  const totalBalance = useMemo(() => {
    return data.transactions.reduce((sum, t) => {
      if (t.type === 'income') return sum + t.amount;
      if (t.type === 'expense') return sum - t.amount;
      return sum;
    }, 0);
  }, [data.transactions]);

  const recentTransactions = useMemo(() => {
    return data.transactions.slice(0, 6);
  }, [data.transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);
  };

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg">
              {data.profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-gray-500">Hola,</p>
              <p className="text-lg font-semibold text-gray-900">{data.profile.name}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-6 h-6 text-gray-600">🔔</div>
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">Saldo Total</p>
            <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <Eye size={20} />
            </button>
          </div>
          <h2 className="text-4xl font-bold mb-1">{formatCurrency(totalBalance)}</h2>
          <div className="flex items-center gap-2 text-sm opacity-90">
            <CreditCard size={14} />
            <span>****3827 • from last month</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-4 gap-3">
          <button 
            onClick={() => navigate('/send')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Send size={20} className="text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Enviar</span>
          </button>
          
          <button 
            onClick={() => navigate('/receive')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Download size={20} className="text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Recibir</span>
          </button>
          
          <button 
            onClick={() => navigate('/topup')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Recargar</span>
          </button>
          
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <MoreHorizontal size={20} className="text-gray-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Más</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h3>
          <button className="text-sm text-purple-600 font-medium hover:text-purple-700">
            Ver todo
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No hay transacciones aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => navigate(`/transaction/${transaction.id}`)}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${categoryColors[transaction.category] || categoryColors.Other}`}>
                  {categoryIcons[transaction.category] || categoryIcons.Other}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">{transaction.recipientName || transaction.category}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('es-ES', { 
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
