import { Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { ACCOUNT_KINDS, BANKS, getBank, KIND_LABEL } from '../lib/banks';
import { amountToInput, parseAmount } from '../lib/money';
import type { Account, AccountKind } from '../lib/types';
import { useApp } from '../state/AppState';
import BankBadge from './BankBadge';
import MoneyInput from './MoneyInput';
import Sheet from './Sheet';

/** Create or edit an account. `account === 'new'` creates. Remounted per target by the caller's key. */
export default function AccountSheet({ account, onClose }: { account: Account | 'new' | null; onClose: () => void }) {
  return <Inner key={account === null ? 'closed' : account === 'new' ? 'new' : account.id} account={account} onClose={onClose} />;
}

function Inner({ account, onClose }: { account: Account | 'new' | null; onClose: () => void }) {
  const { t, data, currency, addAccount, updateAccount, removeAccount, toast } = useApp();
  const lang = data.profile.language;
  const existing = account && account !== 'new' ? account : null;
  const [bank, setBank] = useState(existing?.bank ?? 'nubank');
  const [kind, setKind] = useState<AccountKind>(existing?.kind ?? 'checking');
  const [name, setName] = useState(existing?.name ?? 'Nubank');
  const [nameTouched, setNameTouched] = useState(Boolean(existing));
  // Credit cards: the person types the bill (a positive number); we store it as a negative balance.
  const [opening, setOpening] = useState(existing ? amountToInput(Math.abs(existing.opening), currency) : '');
  const [err, setErr] = useState('');
  const formId = useId();
  const ids = { name: useId(), opening: useId(), hint: useId() };

  const autoName = (b: string, k: AccountKind) => {
    const preset = getBank(b);
    const base = preset.name || KIND_LABEL[k][lang];
    return k === 'credit' && preset.name ? `${t('cardShort')} ${preset.name}` : base;
  };
  const pickBank = (b: string) => {
    setBank(b);
    const k = b === 'wallet' ? 'cash' : kind === 'cash' ? 'checking' : kind;
    setKind(k);
    if (!nameTouched) setName(autoName(b, k));
  };
  const pickKind = (k: AccountKind) => {
    setKind(k);
    if (!nameTouched) setName(autoName(bank, k));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr(t('accountNameInvalid'));
      return;
    }
    const v = parseAmount(opening) ?? 0;
    const input = { name: name.trim().slice(0, 40), bank, kind, opening: kind === 'credit' ? -v : v };
    if (existing) updateAccount(existing.id, input);
    else addAccount(input);
    toast({ message: t('accountSaved') });
    onClose();
  };

  const credit = kind === 'credit';

  return (
    <Sheet
      open={account !== null}
      onClose={onClose}
      title={existing ? t('editAccount') : t('newAccount')}
      closeLabel={t('close')}
      footer={
        <div className="flex gap-2">
          {existing && (
            <button
              type="button"
              className="btn btn-danger press px-4"
              aria-label={t('delete')}
              onClick={() => {
                removeAccount(existing.id);
                onClose();
              }}
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
        <fieldset>
          <legend className="label">{t('accountBank')}</legend>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5" role="radiogroup">
            {BANKS.map((b) => {
              const sel = bank === b.id;
              const label = b.name || t('more');
              return (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={sel}
                  onClick={() => pickBank(b.id)}
                  className={`press flex flex-col items-center gap-1.5 rounded-xl px-1 py-2 ${sel ? 'bg-accent/[.08] ring-1 ring-inset ring-accent/40' : 'hover-soft'}`}
                >
                  <BankBadge bank={b.id} account={{ bank: b.id, kind: b.id === 'wallet' ? 'cash' : 'checking', name: label }} size={36} />
                  <span className={`line-clamp-1 text-[11px] leading-tight ${sel ? 'font-semibold text-ink' : 'text-ink-2'}`}>{label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">{t('accountKind')}</legend>
          <div className="grid grid-cols-2 gap-1.5" role="radiogroup">
            {ACCOUNT_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => pickKind(k)}
                className={`press min-h-11 rounded-xl px-3 text-left text-[0.875rem] ${kind === k ? 'bg-accent/[.08] font-semibold text-ink ring-1 ring-inset ring-accent/40' : 'bg-soft text-ink-2'}`}
              >
                {KIND_LABEL[k][lang]}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor={ids.name} className="label">
            {t('accountName')}
          </label>
          <input
            id={ids.name}
            className="field"
            maxLength={40}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameTouched(true);
              setErr('');
            }}
            aria-invalid={err ? true : undefined}
          />
          {err && <p className="mt-1.5 text-sm text-down">{err}</p>}
        </div>

        <div>
          <label htmlFor={ids.opening} className="label">
            {credit ? t('openingBill') : t('openingBalance')}
          </label>
          <MoneyInput id={ids.opening} currency={currency} value={opening} onChange={(e) => setOpening(e.target.value)} aria-describedby={ids.hint} />
          <p id={ids.hint} className="mt-1.5 text-[0.8125rem] text-muted">
            {credit ? t('openingBillHint') : t('openingHint')}
          </p>
        </div>
      </form>
    </Sheet>
  );
}
