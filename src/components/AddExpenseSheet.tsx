import { useState } from 'react';
import BottomSheet from './BottomSheet';
import { useApp } from '../context/AppContext';
import {
  expensePickerCategories,
  categoryLabel,
} from '../lib/expenseCategories';
import type { TransactionCategory } from '../types';
import { t } from '../i18n';

interface AddExpenseSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function AddExpenseSheet({ open, onClose }: AddExpenseSheetProps) {
  const { data, addTransaction } = useApp();
  const lang = data.profile.language;
  const categories = expensePickerCategories();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const currency = data.profile.currency;
  const currencySymbol = currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€';

  const reset = () => {
    setAmount('');
    setCategory('food');
    setNote('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount.replace(',', '.'));
    if (!value || value <= 0) return;

    setSaving(true);
    try {
      const label = categoryLabel(category, lang);
      await addTransaction({
        type: 'expense',
        amount: value,
        category,
        description: note.trim() || label,
        date: new Date().toISOString(),
        recipientName: label,
        status: 'completed',
      });
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={handleClose} title={t(lang, 'addExpense')}>
      <form onSubmit={handleSubmit} className="space-y-5 pb-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">
            {t(lang, 'amount')}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-blue-600">
              {currencySymbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="field-input w-full py-4 pl-14 pr-4 text-2xl font-bold tracking-tight"
              required
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">
            {t(lang, 'whatSpent')}
          </label>
          <p className="mb-3 text-xs text-[var(--text-muted)]">{t(lang, 'pickIcon')}</p>
          <div className="grid max-h-[40dvh] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
            {categories.map((cat) => {
              const selected = category === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`pressable flex flex-col items-center gap-1.5 rounded-2xl p-2.5 text-center transition-shadow ${
                    selected
                      ? 'ring-2 ring-blue-500 shadow-[0_0_0_3px_rgba(0,102,255,0.15)]'
                      : 'bg-[var(--bg)]'
                  }`}
                  aria-pressed={selected}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${cat.tone}`}
                  >
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <span className="line-clamp-2 text-[10px] font-medium leading-tight text-[var(--text)]">
                    {lang === 'pt' ? cat.labelPt : cat.labelEs}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-muted)]">
            {t(lang, 'noteOptional')}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t(lang, 'expenseNotePlaceholder')}
            className="field-input"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="pressable flex-1 rounded-2xl bg-[var(--border)] py-3.5 font-medium text-[var(--text)]"
          >
            {t(lang, 'cancel')}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="pressable flex-1 rounded-2xl bg-blue-600 py-3.5 font-semibold text-white disabled:opacity-60"
          >
            {saving ? t(lang, 'saving') : t(lang, 'saveExpense')}
          </button>
        </div>
      </form>
    </BottomSheet>
  );
}
