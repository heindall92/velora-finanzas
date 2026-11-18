import localforage from 'localforage';
import { migrate } from '../lib/schema';
import type { AppData, Lang } from '../lib/types';
import { isVaultBlob, seal, type VaultBlob, type VaultKey } from '../lib/vault';

// Same database and key as v1, so existing data is migrated in place instead of lost.
const store = localforage.createInstance({ name: 'VeloraFinance', storeName: 'finance_data' });
const KEY = 'velora_finance_data';
/** Non-sensitive hint so the lock screen speaks the right language before decrypting. */
const LANG_HINT = 'velora_lang';

export type Loaded = { kind: 'empty' } | { kind: 'plain'; data: AppData } | { kind: 'locked'; blob: VaultBlob };

export async function loadStored(): Promise<Loaded> {
  await queue.catch(() => undefined);
  const raw = await store.getItem<unknown>(KEY);
  if (!raw) return { kind: 'empty' };
  if (isVaultBlob(raw)) return { kind: 'locked', blob: raw };
  try {
    return { kind: 'plain', data: migrate(raw) };
  } catch {
    return { kind: 'empty' };
  }
}

/** Writes are serialised so a slow write (encryption is async) can never land after a newer one. */
let queue: Promise<unknown> = Promise.resolve();
export function saveData(data: AppData, key: VaultKey | null): Promise<void> {
  const next = queue
    .then(async () => store.setItem(KEY, key ? await seal(key, data) : data))
    .then(() => undefined);
  queue = next.catch(() => undefined);
  setLangHint(data.profile.language);
  return next;
}

export async function clearData(): Promise<void> {
  await queue.catch(() => undefined);
  await store.removeItem(KEY);
}

export function getLangHint(): Lang | null {
  try {
    const v = localStorage.getItem(LANG_HINT);
    return v === 'pt' || v === 'es' ? v : null;
  } catch {
    return null;
  }
}

function setLangHint(lang: Lang) {
  try {
    localStorage.setItem(LANG_HINT, lang);
  } catch {
    /* private mode: fine */
  }
}
