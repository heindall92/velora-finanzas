import { createContext, useCallback, useContext, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { categoriesFor } from '../lib/categories';
import { toDayKey } from '../lib/dates';
import { amountToInput, parseAmount } from '../lib/money';
import type { Transaction, TxType } from '../lib/types';
import { useApp } from '../state/AppState';
import Sheet from './Sheet';
import MoneyInput from './MoneyInput';
import { Segmented } from './ui';

interface EntryApi {
  openNew: (type?: TxType) => void;
  openEdit: (tx: Transaction) => void;
}

const EntryContext = createContext<EntryApi | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useEntry(): EntryApi {
  const ctx = useContext(EntryContext);
  if (!ctx) throw new Error('useEntry outside provider');
  return ctx;
}

interface FormState {
  editing: Transaction | null;
  type: TxType;
  amount: string;
  category: string;
  note: string;
  date: string;
}

export function EntryProvider({ children }: { children: ReactNode }) {
  const { data, t, currency, addTx, updateTx, removeTx, toast, today } = useApp();
  const lang = data.profile.language;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => blank('expense', toDayKey(today)));
  const [error, setError] = useState('');
  const amountRef = useRef<HTMLInputElement>(null);
  const amountId = useId();
  const noteId = useId();
  const dateId = useId();
  const errId = useId();

  function blank(type: TxType, date: string): FormState {
    return { editing: null, type, amount: '', category: type === 'expense' ? 'groceries' : 'salary', note: '', date };
  }

  const focusAmount = () => {
    // After the sheet opens. iOS only raises the keyboard from a user gesture chain, which this still is.
    requestAnimationFrame(() => amountRef.current?.focus({ preventScroll: true }));
  };

  const api = useMemo<EntryApi>(
    () => ({
      openNew: (type = 'expense') => {
        setForm(blank(type, toDayKey(new Date())));
        setError('');
        setOpen(true);
        focusAmount();
      },
      openEdit: (tx) => {
        setForm({
          editing: tx,
          type: tx.type,
          amount: amountToInput(tx.amount, currency),
          category: tx.category,
          note: tx.note,
          date: tx.date,
        });
        setError('');
        setOpen(true);
      },
    }),
    [currency],
  );

  const close = useCallback(() => setOpen(false), []);

  const setType = (type: TxType) =>
    setForm((f) => ({ ...f, type, category: type === f.type ? f.category : type === 'expense' ? 'groceries' : 'salary' }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(form.amount);
    if (amount === null || amount <= 0) {
      setError(t('amountInvalid'));
      amountRef.current?.focus();
      return;
    }
    const input = { type: form.type, amount, category: form.category, note: form.note.trim().slice(0, 140), date: form.date || toDayKey(new Date()) };
    if (form.editing) {
      updateTx(form.editing.id, input);
      toast({ message: t('updated') });
    } else {
      addTx(input);
      toast({ message: t('saved') });
    }
    setOpen(false);
  };

  const cats = categoriesFor(form.type);
  const formId = useId();

  return (
    <EntryContext.Provider value={api}>
      {children}
      <Sheet
        open={open}
        onClose={close}
        closeLabel={t('close')}
        title={form.editing ? t('editEntry') : t('newEntry')}
        footer={
          <div className="flex gap-2">
            {form.editing && (
              <button
                type="button"
                className="btn btn-danger press px-4"
                onClick={() => {
                  removeTx(form.editing!.id);
                  setOpen(false);
                }}
                aria-label={t('delete')}
              >
                <Trash2 size={18} strokeWidth={1.75} />
              </button>
            )}
            <button type="submit" form={formId} className="btn btn-primary press flex-1">
              {t('save')}
            </button>
          </div>
        }
      >
        <form id={formId} onSubmit={submit} noValidate className="space-y-5">
          <Segmented
            label={t('expense') + ' / ' + t('income')}
            value={form.type}
            onChange={setType}
            options={[
              { value: 'expense', label: t('expense') },
              { value: 'income', label: t('income') },
            ]}
          />

          <div>
            <label htmlFor={amountId} className="label">
              {t('amount')}
            </label>
            <MoneyInput
              ref={amountRef}
              id={amountId}
              currency={currency}
              size="lg"
              tone={form.type === 'income' ? 'money' : 'muted'}
              enterKeyHint="done"
              value={form.amount}
              invalid={!!error}
              aria-describedby={error ? errId : undefined}
              onChange={(e) => {
                setForm((f) => ({ ...f, amount: e.target.value.slice(0, 18) }));
                if (error) setError('');
              }}
            />
            {error && (
              <p id={errId} className="mt-2 text-sm text-down" role="alert">
                {error}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="label">{t('category')}</legend>
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5" role="radiogroup">
              {cats.map((c) => {
                const selected = form.category === c.id;
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setForm((f) => ({ ...f, category: c.id }))}
                    className={`press flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-center ${
                      selected ? 'bg-accent/[.08] ring-1 ring-inset ring-accent/40' : 'hover-soft'
                    }`}
                  >
                    <span
                      className="grid h-10 w-10 place-items-center rounded-xl"
                      style={{
                        background: `hsl(${c.hue} 70% 50% / ${selected ? 0.2 : 0.12})`,
                        color: `light-dark(hsl(${c.hue} 65% 34%), hsl(${c.hue} 75% 72%))`,
                      }}
                      aria-hidden="true"
                    >
                      <Icon size={19} strokeWidth={1.75} />
                    </span>
                    <span className={`line-clamp-2 text-[11px] leading-tight ${selected ? 'font-semibold text-ink' : 'text-ink-2'}`}>
                      {c.label[lang]}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_11rem]">
            <div>
              <label htmlFor={noteId} className="label">
                {t('note')}
              </label>
              <input
                id={noteId}
                className="field"
                maxLength={140}
                placeholder={t('notePlaceholder')}
                enterKeyHint="done"
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </div>
            <div>
              <label htmlFor={dateId} className="label">
                {t('date')}
              </label>
              <input
                id={dateId}
                type="date"
                className="field"
                required
                max="2100-12-31"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>
        </form>
      </Sheet>
    </EntryContext.Provider>
  );
}
