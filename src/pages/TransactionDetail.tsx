import { ChevronLeft, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CategoryIcon, categoryStyles } from '../components/icons';

export default function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, deleteTransaction } = useApp();

  const transaction = data.transactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">Transacción no encontrada</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="pressable mt-4 rounded-2xl bg-violet-600 px-6 py-2 text-white"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      await deleteTransaction(transaction.id);
      navigate('/');
    }
  };

  const statusColors = {
    completed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
  };

  const statusLabel = {
    completed: 'Completado',
    pending: 'Pendiente',
    failed: 'Fallido',
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="border-b border-slate-100 bg-white px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="pressable rounded-xl p-2 text-slate-700"
            aria-label="Volver"
          >
            <ChevronLeft size={24} strokeWidth={1.75} />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Detalles</h1>
          <button
            type="button"
            onClick={handleDelete}
            className="pressable rounded-xl p-2 text-red-600"
            aria-label="Eliminar"
          >
            <Trash2 size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="glass-card mb-4 rounded-[28px] p-6">
          <div className="mb-6 flex flex-col items-center">
            <div
              className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
                categoryStyles[transaction.category] || categoryStyles.Other
              }`}
            >
              {transaction.recipientName ? (
                <span className="text-3xl font-bold">
                  {transaction.recipientName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <CategoryIcon category={transaction.category} size={32} />
              )}
            </div>
            <h2 className="mb-1 text-2xl font-bold tracking-tight text-slate-900">
              {transaction.recipientName || transaction.category}
            </h2>
            <p className="text-sm text-slate-500">
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

          <div className="mb-6 text-center">
            <p className="mb-1 text-sm text-slate-500">Monto</p>
            <h3
              className={`text-4xl font-bold tracking-tight tabular-nums ${
                transaction.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </h3>
          </div>

          {transaction.status && (
            <div className="flex justify-center">
              <span
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  statusColors[transaction.status]
                }`}
              >
                {statusLabel[transaction.status]}
              </span>
            </div>
          )}
        </div>

        <div className="glass-card mb-4 overflow-hidden rounded-[28px]">
          <Row label="Estado">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  transaction.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="font-medium text-slate-900">
                {transaction.status ? statusLabel[transaction.status] : 'Completado'}
              </span>
            </div>
          </Row>
          <Row label="Categoría">
            <span className="font-medium text-slate-900">{transaction.category}</span>
          </Row>
          <Row label="Tipo">
            <span className="font-medium text-slate-900">
              {transaction.type === 'income'
                ? 'Ingreso'
                : transaction.type === 'expense'
                  ? 'Gasto'
                  : 'Transferencia'}
            </span>
          </Row>
          {transaction.description && (
            <Row label="Descripción" last>
              <span className="font-medium text-slate-900">{transaction.description}</span>
            </Row>
          )}
        </div>

        <div className="glass-card rounded-[28px] p-6">
          <h4 className="mb-4 font-semibold text-slate-900">Detalles</h4>
          <div className="space-y-3 text-sm">
            <DetailRow
              label="ID de transacción"
              value={`#${transaction.id.slice(0, 8)}`}
              mono
            />
            <DetailRow
              label="Fecha"
              value={new Date(transaction.date).toLocaleDateString('es-ES')}
            />
            <DetailRow
              label="Hora"
              value={new Date(transaction.date).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
            <DetailRow label="Total" value={formatCurrency(transaction.amount)} bold />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`p-4 ${last ? '' : 'border-b border-slate-100'}`}>
      <p className="mb-1 text-sm text-slate-500">{label}</p>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  bold,
}: {
  label: string;
  value: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span
        className={`text-right text-slate-900 ${mono ? 'font-mono text-sm' : ''} ${
          bold ? 'font-semibold' : ''
        }`}
      >
        {value}
      </span>
    </div>
  );
}
