import { ChevronLeft, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const categoryColors: Record<string, string> = {
  'Food & Drink': 'bg-green-100 text-green-600',
  'Shopping': 'bg-pink-100 text-pink-600',
  'Transport': 'bg-yellow-100 text-yellow-600',
  'Entertainment': 'bg-purple-100 text-purple-600',
  'Bills': 'bg-blue-100 text-blue-600',
  'Salary': 'bg-green-100 text-green-600',
  'Other': 'bg-gray-100 text-gray-600',
};

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, deleteTransaction } = useApp();

  const transaction = data.transactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Transacción no encontrada</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      await deleteTransaction(transaction.id);
      navigate('/');
    }
  };

  const statusColors = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Detalles</h1>
          <button 
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <div className={`w-20 h-20 rounded-full ${categoryColors[transaction.category] || categoryColors.Other} flex items-center justify-center text-3xl mb-4`}>
              {transaction.recipientName ? transaction.recipientName.charAt(0).toUpperCase() : '💰'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {transaction.recipientName || transaction.category}
            </h2>
            <p className="text-sm text-gray-500">
              {new Date(transaction.date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Monto</p>
            <h3 className={`text-4xl font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </h3>
          </div>

          {transaction.status && (
            <div className="flex justify-center mb-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[transaction.status]}`}>
                {transaction.status === 'completed' ? 'Completado' : 
                 transaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
              </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-4">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Estado</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${transaction.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <p className="font-medium text-gray-900">
                {transaction.status === 'completed' ? 'Completado' : 
                 transaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
              </p>
            </div>
          </div>

          <div className="p-4 border-b border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Categoría</p>
            <p className="font-medium text-gray-900">{transaction.category}</p>
          </div>

          <div className="p-4 border-b border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Tipo</p>
            <p className="font-medium text-gray-900">
              {transaction.type === 'income' ? 'Ingreso' : 
               transaction.type === 'expense' ? 'Gasto' : 'Transferencia'}
            </p>
          </div>

          {transaction.description && (
            <div className="p-4">
              <p className="text-sm text-gray-500 mb-1">Descripción</p>
              <p className="font-medium text-gray-900">{transaction.description}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-4">Detalles</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">ID de transacción</span>
              <span className="font-mono text-sm text-gray-900">#{transaction.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fecha</span>
              <span className="text-gray-900">
                {new Date(transaction.date).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Hora</span>
              <span className="text-gray-900">
                {new Date(transaction.date).toLocaleTimeString('es-ES', { 
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-semibold text-gray-900">{formatCurrency(transaction.amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
