import { createContext, useCallback, useContext, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowDown, Trash2 } from 'lucide-react';
import { categoriesFor } from '../lib/categories';
import { toDayKey } from '../lib/dates';
import { amountToInput, parseAmount } from '../lib/money';
import type { Account, Transaction, TxType } from '../lib/types';
import { useApp } from '../state/AppState';
import BankBadge from './BankBadge';
import MoneyInput from './MoneyInput';
import Sheet from './Sheet';
import { Segmented } from './ui';

interface EntryApi {
  /** `accountId` pre-selects the bank (e.g. "+" from an account's page). */
  openNew: (type?: TxType, accountId?: string) => void;
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
  accountId: string; // '' = sem conta
  toAccountId: string;
}

const LAST_ACCOUNT = 'velora_last_account';
const readLast = () => {
  try {
    return localStorage.getItem(LAST_ACCOUNT) ?? '';
  } catch {
    return '';
  }
};
const writeLast = (id: string) => {
  try {
    localStorage.setItem(LAST_ACCOUNT, id);
  } catch {
    /* private mode */
  }
};

const defaultCategory = (type: TxType) => (type === 'expense' ? 'groceries' : type === 'income' ? 'salary' : 'transfer');

/** Horizontal choice of accounts, wraps instead of scrolling sideways. */
function AccountChoice({
  accounts,
  value,
  onChange,
  noneLabel,
  allowNone,
  exclude,
  label,
}: {
  accounts: Account[];
  value: string;
  onChange: (id: string) => void;
  noneLabel: string;
  allowNone: boolean;
  exclude?: string;
  label: string;
}) {
  const opts = accounts.filter((a) => a.id !== exclude);
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
      {opts.map((a) => {
        const sel = value === a.id;
        return (
          <button
            key={a.id}
            type="button"
            role="radio"
            aria-checked={sel}
            onClick={() => onChange(a.id)}
            className={`press flex min-h-11 items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 text-[0.875rem] ${
              sel ? 'bg-accent/[.08] font-semibold text-ink ring-1 ring-inset ring-accent/40' : 'bg-soft text-ink-2'
            }`}
          >
            <BankBadge account={a} size={28} />
            <span className="max-w-[9rem] truncate">{a.name}</span>
          </button>
        );
      })}
      {allowNone && (
        <button
          type="button"
          role="radio"
          aria-checked={value === ''}
          onClick={() => onChange('')}
          className={`press min-h-11 rounded-xl px-3 text-[0.875rem] ${value === '' ? 'bg-accent/[.08] font-semibold text-ink ring-1 ring-inset ring-accent/40' : 'bg-soft text-muted'}`}
        >
          {noneLabel}
        </button>
      )}
    </div>
  );
}

export function EntryProvider({ children }: { children: ReactNode }) {
  const { data, t, currency, addTx, updateTx, removeTx, toast, today } = useApp();
  const lang = data.profile.language;
  const accounts = data.accounts;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => ({
    editing: null,
    type: 'expense',
    amount: '',
    category: 'groceries',
    note: '',
    date: toDayKey(today),
    accountId: '',
    toAccountId: '',
  }));
  const [error, setError] = useState('');
  const amountRef = useRef<HTMLInputElement>(null);
  const amountId = useId();
  const noteId = useId();
  const dateId = useId();
  const errId = useId();
  const formId = useId();

  const api = useMemo<EntryApi>(
    () => ({
      openNew: (type = 'expense', accountId) => {
        const accs = accounts;
        const has = (id: string) => accs.some((a) => a.id === id);
        // Default to the bank used last: most people pay with the same card most of the time.
        const from = accountId && has(accountId) ? accountId : has(readLast()) ? readLast() : (accs[0]?.id ?? '');
        const to = accs.find((a) => a.id !== from)?.id ?? '';
        setForm({
          editing: null,
          type: type === 'transfer' && accs.length < 2 ? 'expense' : type,
          amount: '',
          category: defaultCategory(type),
          note: '',
          date: toDayKey(new Date()),
          accountId: from,
          toAccountId: to,
        });
        setError('');
        setOpen(true);
        // After the sheet opens; still inside the tap's gesture chain, so iOS raises the keyboard.
        requestAnimationFrame(() => amountRef.current?.focus({ preventScroll: true }));
      },
      openEdit: (tx) => {
        setForm({
          editing: tx,
          type: tx.type,
          amount: amountToInput(tx.amount, currency),
          category: tx.category,
          note: tx.note,
          date: tx.date,
          accountId: tx.accountId ?? '',
          toAccountId: tx.toAccountId ?? accounts.find((a) => a.id !== tx.accountId)?.id ?? '',
        });
        setError('');
        setOpen(true);
      },
    }),
    [currency, accounts],
  );

  const close = useCallback(() => setOpen(false), []);

  const setType = (type: TxType) =>
    setForm((f) => {
      if (type === f.type) return f;
      const next = { ...f, type, category: defaultCategory(type) };
      if (type === 'transfer') {
        if (!next.accountId) next.accountId = accounts[0]?.id ?? '';
        if (!next.toAccountId || next.toAccountId === next.accountId) next.toAccountId = accounts.find((a) => a.id !== next.accountId)?.id ?? '';
      }
      return next;
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseAmount(form.amount);
    if (amount === null || amount <= 0) {
      setError(t('amountInvalid'));
      amountRef.current?.focus();
      return;
    }
    const transfer = form.type === 'transfer';
    if (transfer && (!form.accountId || !form.toAccountId || form.accountId === form.toAccountId)) {
      setError(t('transferSame'));
      return;
    }
    const input = {
      type: form.type,
      amount,
      category: transfer ? 'transfer' : form.category,
      note: form.note.trim().slice(0, 140),
      date: form.date || toDayKey(new Date()),
      accountId: form.accountId || undefined,
      toAccountId: transfer ? form.toAccountId : undefined,
    };
    if (form.accountId) writeLast(form.accountId);
    if (form.editing) {
      updateTx(form.editing.id, input);
      toast({ message: t('updated') });
    } else {
      addTx(input);
      toast({ message: t('saved') });
    }
    setOpen(false);
  };

  const typeOptions: { value: TxType; label: string }[] = [
    { value: 'expense', label: t('expense') },
    { value: 'income', label: t('income') },
    ...(accounts.length >= 2 || form.type === 'transfer' ? [{ value: 'transfer' as const, label: t('transfer') }] : []),
  ];

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
          <Segmented label={t('newEntry')} value={form.type} onChange={setType} options={typeOptions} />

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

          {form.type === 'transfer' ? (
            <div className="space-y-2">
              <p className="text-[0.8125rem] text-muted">{t('transferHint')}</p>
              <div>
                <p className="label">{t('fromAccount')}</p>
                <AccountChoice
                  label={t('fromAccount')}
                  accounts={accounts}
                  value={form.accountId}
                  allowNone={false}
                  noneLabel={t('noAccount')}
                  onChange={(id) => setForm((f) => ({ ...f, accountId: id, toAccountId: f.toAccountId === id ? (accounts.find((a) => a.id !== id)?.id ?? '') : f.toAccountId }))}
                />
              </div>
              <div className="flex justify-center text-muted" aria-hidden="true">
                <ArrowDown size={18} strokeWidth={1.75} />
              </div>
              <div>
                <p className="label">{t('toAccount')}</p>
                <AccountChoice
                  label={t('toAccount')}
                  accounts={accounts}
                  value={form.toAccountId}
                  exclude={form.accountId}
                  allowNone={false}
                  noneLabel={t('noAccount')}
                  onChange={(id) => setForm((f) => ({ ...f, toAccountId: id }))}
                />
              </div>
            </div>
          ) : (
            <>
              {accounts.length > 0 && (
                <div>
                  <p className="label">{t('account')}</p>
                  <AccountChoice
                    label={t('account')}
                    accounts={accounts}
                    value={form.accountId}
                    allowNone
                    noneLabel={t('noAccount')}
                    onChange={(id) => setForm((f) => ({ ...f, accountId: id }))}
                  />
                </div>
              )}
              <fieldset>
                <legend className="label">{t('category')}</legend>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5" role="radiogroup">
                  {categoriesFor(form.type).map((c) => {
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
                        <span className={`line-clamp-2 text-[11px] leading-tight ${selected ? 'font-semibold text-ink' : 'text-ink-2'}`}>{c.label[lang]}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </>
          )}

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
