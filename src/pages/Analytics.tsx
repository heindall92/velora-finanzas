import { useState, useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryIcon, categoryStyles } from '../components/icons';
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

export default function Analytics() {
  const { data } = useApp();
  const [period, setPeriod] = useState<Period>('month');

  const { chartData, totalSpending, categoryBreakdown } = useMemo(() => {
    const now = new Date();
    const startDate = new Date();

    if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else startDate.setFullYear(now.getFullYear() - 1);

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
        values.push(
          filteredTransactions
            .filter((t) => new Date(t.date).toDateString() === date.toDateString())
            .reduce((sum, t) => sum + t.amount, 0)
        );
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
        values.push(
          filteredTransactions
            .filter((t) => {
              const tDate = new Date(t.date);
              return tDate >= rangeStart && tDate <= rangeEnd;
            })
            .reduce((sum, t) => sum + t.amount, 0)
        );
      }
    } else {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        labels.push(months[date.getMonth()]);
        values.push(
          filteredTransactions
            .filter((t) => {
              const tDate = new Date(t.date);
              return (
                tDate.getMonth() === date.getMonth() &&
                tDate.getFullYear() === date.getFullYear()
              );
            })
            .reduce((sum, t) => sum + t.amount, 0)
        );
      }
    }

    return {
      chartData: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: 'rgba(139, 92, 246, 0.85)',
            borderRadius: 10,
            barThickness: 22,
          },
        ],
      },
      totalSpending: total,
      categoryBreakdown: categories,
    };
  }, [data.transactions, period]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: data.profile.currency,
    }).format(amount);

  return (
    <div>
      <div className="px-5 pt-6 pb-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Análisis</h1>
          <button type="button" className="pressable rounded-2xl p-2.5 text-slate-500" aria-label="Calendario">
            <CalendarDays size={22} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mb-6 flex gap-2">
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`pressable rounded-full px-5 py-2 text-sm font-medium ${
                period === p
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>

        <div className="glass-card mb-5 rounded-[24px] p-5">
          <p className="mb-1 text-sm text-slate-500">Gasto Total</p>
          <h2 className="mb-1 text-3xl font-bold tracking-tight text-slate-900">
            {formatCurrency(totalSpending)}
          </h2>
          <p className="text-sm font-medium text-emerald-600">+8.2% vs período anterior</p>
        </div>

        <div className="glass-card mb-6 rounded-[24px] p-5">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              aspectRatio: 2,
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  padding: 12,
                  cornerRadius: 12,
                  displayColors: false,
                  callbacks: {
                    label: (context) => formatCurrency(context.parsed.y || 0),
                  },
                },
              },
              scales: {
                x: { grid: { display: false }, border: { display: false } },
                y: { display: false },
              },
            }}
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Categorías Principales
          </h3>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p>No hay gastos en este período</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {categoryBreakdown.map(([category, amount]) => {
              const percentage = ((amount / totalSpending) * 100).toFixed(0);
              return (
                <div key={category} className="glass-card rounded-[20px] p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        categoryStyles[category] || categoryStyles.Other
                      }`}
                    >
                      <CategoryIcon category={category} size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{category}</p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-violet-500 transition-[width] duration-300"
                          style={{
                            width: `${percentage}%`,
                            transitionTimingFunction: 'var(--ease-out)',
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums text-slate-900">
                        {formatCurrency(amount)}
                      </p>
                      <p className="text-xs text-slate-500">{percentage}%</p>
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
