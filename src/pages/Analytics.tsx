import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Period = 'week' | 'month' | 'year';

const categoryColors: Record<string, string> = {
  'Food & Drink': 'bg-green-100 text-green-600',
  'Shopping': 'bg-pink-100 text-pink-600',
  'Transport': 'bg-yellow-100 text-yellow-600',
  'Entertainment': 'bg-purple-100 text-purple-600',
  'Bills': 'bg-blue-100 text-blue-600',
  'Other': 'bg-gray-100 text-gray-600',
};

const categoryIcons: Record<string, string> = {
  'Food & Drink': '🍽️',
  'Shopping': '🛍️',
  'Transport': '🚗',
  'Entertainment': '🎬',
  'Bills': '💡',
  'Other': '📋',
};

export default function Analytics() {
  const { data } = useApp();
  const [period, setPeriod] = useState<Period>('month');

  const { chartData, totalSpending, categoryBreakdown } = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const filteredTransactions = data.transactions.filter((t) => {
      const transDate = new Date(t.date);
      return t.type === 'expense' && transDate >= startDate && transDate <= now;
    });

    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals: Record<string, number> = {};
    filteredTransactions.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const categories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const labels: string[] = [];
    const values: number[] = [];

    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        labels.push(date.toLocaleDateString('es-ES', { weekday: 'short' }));
        
        const dayTotal = filteredTransactions
          .filter((t) => {
            const tDate = new Date(t.date);
            return tDate.toDateString() === date.toDateString();
          })
          .reduce((sum, t) => sum + t.amount, 0);
        
        values.push(dayTotal);
      }
    } else if (period === 'month') {
      for (let i = 29; i >= 0; i -= 5) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        labels.push(date.getDate().toString());
        
        const rangeStart = new Date(date);
        rangeStart.setDate(date.getDate() - 2);
        const rangeEnd = new Date(date);
        rangeEnd.setDate(date.getDate() + 2);
        
        const rangeTotal = filteredTransactions
          .filter((t) => {
            const tDate = new Date(t.date);
            return tDate >= rangeStart && tDate <= rangeEnd;
          })
          .reduce((sum, t) => sum + t.amount, 0);
        
        values.push(rangeTotal);
      }
    } else {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        labels.push(months[date.getMonth()]);
        
        const monthTotal = filteredTransactions
          .filter((t) => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, t) => sum + t.amount, 0);
        
        values.push(monthTotal);
      }
    }

    return {
      chartData: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderRadius: 8,
            barThickness: 24,
          },
        ],
      },
      totalSpending: total,
      categoryBreakdown: categories,
    };
  }, [data.transactions, period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);
  };

  const previousPeriodComparison = 8.2;

  return (
    <div className="pb-20">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Análisis</h1>

        <div className="flex gap-2 mb-6">
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                period === p
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Gasto Total</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(totalSpending)}
          </h2>
          <p className="text-sm text-green-600 font-medium">
            +{previousPeriodComparison}% vs período anterior
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 2,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: 12,
                  cornerRadius: 8,
                  displayColors: false,
                  callbacks: {
                    label: (context) => formatCurrency(context.parsed.y || 0),
                  },
                },
              },
              scales: {
                x: {
                  grid: {
                    display: false,
                  },
                  border: {
                    display: false,
                  },
                },
                y: {
                  display: false,
                },
              },
            }}
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Categorías Principales</h3>
          <button className="text-sm text-purple-600 font-medium hover:text-purple-700">
            Ver todo
          </button>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No hay gastos en este período</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown.map(([category, amount]) => {
              const percentage = ((amount / totalSpending) * 100).toFixed(0);
              return (
                <div key={category} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${categoryColors[category] || categoryColors.Other}`}>
                      {categoryIcons[category] || categoryIcons.Other}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{category}</p>
                      <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(amount)}</p>
                      <p className="text-xs text-gray-500">{percentage}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
