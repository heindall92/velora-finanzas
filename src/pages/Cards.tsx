import { Plus, ArrowUpRight, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cards() {
  const { data } = useApp();
  const navigate = useNavigate();

  const primaryCard = data.accounts[0];

  const recentTransfers = useMemo(() => {
    return data.transactions
      .filter((t) => t.type === 'transfer' || t.recipientName)
      .slice(0, 4);
  }, [data.transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);
  };

  const totalBalance = useMemo(() => {
    return data.transactions.reduce((sum, t) => {
      if (t.type === 'income') return sum + t.amount;
      if (t.type === 'expense') return sum - t.amount;
      return sum;
    }, 0);
  }, [data.transactions]);

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis Tarjetas</h1>

        {primaryCard && (
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl mb-6">
            <div className="flex items-center justify-between mb-12">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-xs opacity-90 mb-1">Saldo disponible</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                💳
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Número de tarjeta</p>
                <p className="text-lg font-mono tracking-wider">
                  **** **** **** {primaryCard.lastFour || '3827'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">VISA</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-6">
          <button 
            onClick={() => navigate('/topup')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Añadir Dinero</span>
          </button>
          
          <button 
            onClick={() => navigate('/send')}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <ArrowUpRight size={20} className="text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Transferir</span>
          </button>
          
          <button className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Settings size={20} className="text-gray-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Ajustes</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transferencias Recientes</h3>
          <button className="text-sm text-purple-600 font-medium hover:text-purple-700">
            Ver todo
          </button>
        </div>

        {recentTransfers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No hay transferencias aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransfers.map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => navigate(`/transaction/${transaction.id}`)}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {transaction.recipientName ? transaction.recipientName.charAt(0).toUpperCase() : '💸'}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">
                    {transaction.recipientName || transaction.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    -{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-green-600">Completado</p>
                </div>
              </button>
            ))}
          </div>
        )}

        <button className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-medium hover:border-purple-400 hover:text-purple-600 transition-colors">
          + Añadir nueva tarjeta
        </button>
      </div>
    </div>
  );
}
