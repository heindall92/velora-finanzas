import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { makeT, type Translate } from '../lib/i18n';
import { formatMoney, roundCents, type CurrencyCode } from '../lib/money';
import { emptyData, newId } from '../lib/schema';
import { toDayKey } from '../lib/dates';
import type { AppData, Goal, Profile, Transaction } from '../lib/types';
import { clearData, getLangHint, loadStored, saveData } from './storage';
import { isVaultBlob, newKey, open, type VaultBlob, type VaultKey } from '../lib/vault';
import { migrate } from '../lib/schema';

export type TxInput = Omit<Transaction, 'id' | 'createdAt'>;
export type GoalInput = Omit<Goal, 'id' | 'createdAt'>;

export interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
  tone?: 'default' | 'error';
}

export type Status = 'loading' | 'locked' | 'ready';

/** Lock again when the app comes back after this long in the background. */
export const AUTO_LOCK_MS = 60_000;

interface Ctx {
  data: AppData;
  status: Status;
  /** PIN lock (encryption at rest) is on. */
  pinEnabled: boolean;
  unlock: (pin: string) => Promise<void>;
  lock: () => void;
  enablePin: (pin: string) => Promise<void>;
  disablePin: () => Promise<void>;
  /** Language to use before data is decrypted. */
  hintLang: 'pt' | 'es';
  t: Translate;
  money: (v: number) => string;
  currency: CurrencyCode;
  addTx: (input: TxInput) => Transaction;
  updateTx: (id: string, input: Partial<TxInput>) => void;
  removeTx: (id: string) => void;
  addGoal: (input: GoalInput) => void;
  updateGoal: (id: string, input: Partial<GoalInput>) => void;
  moveGoal: (id: string, delta: number) => void;
  removeGoal: (id: string) => void;
  updateProfile: (p: Partial<Profile>) => void;
  completeOnboarding: (p: Pick<Profile, 'firstName' | 'lastName' | 'currency' | 'language' | 'budget'>, startBalance: number) => void;
  replaceAll: (d: AppData) => void;
  eraseAll: () => Promise<void>;
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  /** Today, refreshed when the app regains focus after midnight. */
  today: Date;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children, initial }: { children: ReactNode; initial?: AppData }) {
  const [data, setData] = useState<AppData>(() => initial ?? emptyData());
  const [status, setStatus] = useState<Status>(initial ? 'ready' : 'loading');
  const [pinEnabled, setPinEnabled] = useState(false);
  const keyRef = useRef<VaultKey | null>(null);
  const blobRef = useRef<VaultBlob | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [today, setToday] = useState(() => new Date());
  // Source of truth for writers: actions read the latest state here, never a stale closure.
  // (v1 spread `data` from the render closure, so two quick actions silently lost the first one.)
  const ref = useRef(data);
  const toastSeq = useRef(0);

  const toast = useCallback((tst: Omit<Toast, 'id'>) => {
    const id = ++toastSeq.current;
    // Same message again replaces the old one instead of stacking three identical toasts.
    setToasts((list) => [...list.filter((x) => x.message !== tst.message).slice(-1), { ...tst, id }]);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((list) => list.filter((x) => x.id !== id)), []);

  useEffect(() => {
    if (initial) return;
    let alive = true;
    loadStored()
      .then((loaded) => {
        if (!alive) return;
        if (loaded.kind === 'locked') {
          blobRef.current = loaded.blob;
          setPinEnabled(true);
          setStatus('locked');
          return;
        }
        if (loaded.kind === 'plain') {
          ref.current = loaded.data;
          setData(loaded.data);
        }
        setStatus('ready');
      })
      .catch(() => alive && setStatus('ready'));
    return () => {
      alive = false;
    };
  }, [initial]);

  useEffect(() => {
    const refresh = () => {
      const now = new Date();
      setToday((prev) => (toDayKey(prev) === toDayKey(now) ? prev : now));
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const timer = window.setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.clearInterval(timer);
    };
  }, []);

  const t = useMemo(() => makeT(data.profile.language), [data.profile.language]);

  const commit = useCallback(
    (fn: (d: AppData) => AppData) => {
      const next = fn(ref.current);
      ref.current = next;
      setData(next);
      saveData(next, keyRef.current).catch(() => toast({ message: makeT(next.profile.language)('storageError'), tone: 'error' }));
    },
    [toast],
  );

  const addTx = useCallback(
    (input: TxInput) => {
      const tx: Transaction = { ...input, amount: roundCents(input.amount), id: newId(), createdAt: new Date().toISOString() };
      commit((d) => ({ ...d, transactions: [tx, ...d.transactions] }));
      return tx;
    },
    [commit],
  );

  const updateTx = useCallback(
    (id: string, input: Partial<TxInput>) =>
      commit((d) => ({ ...d, transactions: d.transactions.map((x) => (x.id === id ? { ...x, ...input } : x)) })),
    [commit],
  );

  const removeTx = useCallback(
    (id: string) => {
      const removed = ref.current.transactions.find((x) => x.id === id);
      if (!removed) return;
      commit((d) => ({ ...d, transactions: d.transactions.filter((x) => x.id !== id) }));
      const tr = makeT(ref.current.profile.language);
      toast({
        message: tr('deleted'),
        action: { label: tr('undo'), run: () => commit((d) => ({ ...d, transactions: [removed, ...d.transactions] })) },
      });
    },
    [commit, toast],
  );

  const addGoal = useCallback(
    (input: GoalInput) =>
      commit((d) => ({ ...d, goals: [...d.goals, { ...input, id: newId(), createdAt: new Date().toISOString() }] })),
    [commit],
  );
  const updateGoal = useCallback(
    (id: string, input: Partial<GoalInput>) =>
      commit((d) => ({ ...d, goals: d.goals.map((g) => (g.id === id ? { ...g, ...input } : g)) })),
    [commit],
  );
  const moveGoal = useCallback(
    (id: string, delta: number) =>
      commit((d) => ({
        ...d,
        goals: d.goals.map((g) => (g.id === id ? { ...g, saved: roundCents(Math.max(g.saved + delta, 0)) } : g)),
      })),
    [commit],
  );
  const removeGoal = useCallback(
    (id: string) => {
      const idx = ref.current.goals.findIndex((g) => g.id === id);
      if (idx < 0) return;
      const removed = ref.current.goals[idx];
      commit((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
      const tr = makeT(ref.current.profile.language);
      toast({
        message: tr('goalDeleted'),
        action: {
          label: tr('undo'),
          run: () => commit((d) => ({ ...d, goals: [...d.goals.slice(0, idx), removed, ...d.goals.slice(idx)] })),
        },
      });
    },
    [commit, toast],
  );

  const updateProfile = useCallback(
    (p: Partial<Profile>) => commit((d) => ({ ...d, profile: { ...d.profile, ...p } })),
    [commit],
  );

  const completeOnboarding = useCallback<Ctx['completeOnboarding']>(
    (p, startBalance) =>
      commit((d) => {
        const tr = makeT(p.language);
        const now = new Date();
        const start: Transaction[] =
          startBalance > 0
            ? [
                {
                  id: newId(),
                  type: 'income',
                  amount: roundCents(startBalance),
                  category: 'other_in',
                  note: tr('obStartBalanceNote'),
                  date: toDayKey(now),
                  createdAt: now.toISOString(),
                },
              ]
            : [];
        return {
          ...d,
          transactions: [...start, ...d.transactions],
          profile: { ...d.profile, ...p, onboardingComplete: true },
        };
      }),
    [commit],
  );

  const replaceAll = useCallback((d: AppData) => commit(() => d), [commit]);

  const eraseAll = useCallback(async () => {
    await clearData();
    const fresh = emptyData(ref.current.profile.language);
    keyRef.current = null;
    blobRef.current = null;
    setPinEnabled(false);
    ref.current = fresh;
    setData(fresh);
    setStatus('ready');
  }, []);

  // ── PIN lock ─────────────────────────────────────────────────────────────
  const unlock = useCallback(async (pin: string) => {
    // Always decrypt what is on disk (after pending writes), never a stale in-memory copy.
    const loaded = await loadStored();
    const blob = loaded.kind === 'locked' ? loaded.blob : blobRef.current;
    if (!blob || !isVaultBlob(blob)) throw new Error('no_vault');
    const { payload, key } = await open(blob, pin); // throws 'bad_pin'
    const d = migrate(payload);
    keyRef.current = key;
    blobRef.current = null;
    ref.current = d;
    setData(d);
    setStatus('ready');
  }, []);

  const lock = useCallback(() => {
    if (!keyRef.current) return;
    // Drop the key and the plaintext from memory. Disk already holds only ciphertext.
    keyRef.current = null;
    const blank = emptyData(ref.current.profile.language);
    ref.current = blank;
    setData(blank);
    setToasts([]);
    setStatus('locked');
  }, []);

  const enablePin = useCallback(async (pin: string) => {
    const key = await newKey(pin);
    keyRef.current = key;
    await saveData(ref.current, key);
    setPinEnabled(true);
  }, []);

  const disablePin = useCallback(async () => {
    keyRef.current = null;
    blobRef.current = null;
    await saveData(ref.current, null);
    setPinEnabled(false);
  }, []);

  // Auto-lock after time in the background (also covers the iOS app switcher returning).
  useEffect(() => {
    if (!pinEnabled) return;
    let hiddenAt = 0;
    const onVis = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > AUTO_LOCK_MS) lock();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [pinEnabled, lock]);

  const hintLang = getLangHint() ?? data.profile.language;

  const currency = data.profile.currency;
  const money = useCallback((v: number) => formatMoney(v, currency), [currency]);

  const value = useMemo<Ctx>(
    () => ({
      data,
      status,
      pinEnabled,
      unlock,
      lock,
      enablePin,
      disablePin,
      hintLang,
      t,
      money,
      currency,
      addTx,
      updateTx,
      removeTx,
      addGoal,
      updateGoal,
      moveGoal,
      removeGoal,
      updateProfile,
      completeOnboarding,
      replaceAll,
      eraseAll,
      toasts,
      toast,
      dismissToast,
      today,
    }),
    [data, status, pinEnabled, unlock, lock, enablePin, disablePin, hintLang, t, money, currency, addTx, updateTx, removeTx, addGoal, updateGoal, moveGoal, removeGoal, updateProfile, completeOnboarding, replaceAll, eraseAll, toasts, toast, dismissToast, today],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
