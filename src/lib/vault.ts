/**
 * Encryption at rest, optional, unlocked by a PIN.
 *
 * Threat model (honest):
 *  - Protects against: someone with the unlocked phone/laptop opening the app; someone reading the
 *    browser's storage files or a synced profile; the iOS app switcher snapshot (see PrivacyCover).
 *  - Does NOT protect against: malware on the device, or an attacker who can run script in this origin
 *    while the app is unlocked (that is what the CSP is for).
 *  - A 4–6 digit PIN is a small keyspace. PBKDF2 at 600k iterations (OWASP 2023 for SHA-256) makes each
 *    offline guess slow, not impossible. For stronger protection use a longer PIN.
 *
 * Format stored in IndexedDB instead of the plaintext AppData:
 *   { vault: 1, kdf: 'PBKDF2-SHA256', iter, salt, iv, ct }   (base64 fields)
 * A fresh random IV is used for every write; the key never leaves memory and is non-extractable.
 */

export interface VaultBlob {
  vault: 1;
  kdf: 'PBKDF2-SHA256';
  iter: number;
  salt: string;
  iv: string;
  ct: string;
}

export const PBKDF2_ITERATIONS = 600_000;
export const PIN_MIN = 4;
export const PIN_MAX = 8;

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return btoa(s);
}

function unb64(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(new ArrayBuffer(n)));
}

export function isVaultBlob(v: unknown): v is VaultBlob {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    o.vault === 1 &&
    o.kdf === 'PBKDF2-SHA256' &&
    typeof o.iter === 'number' &&
    o.iter >= 100_000 &&
    o.iter <= 10_000_000 &&
    typeof o.salt === 'string' &&
    typeof o.iv === 'string' &&
    typeof o.ct === 'string'
  );
}

export function isValidPin(pin: string): boolean {
  return new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`).test(pin);
}

export interface VaultKey {
  key: CryptoKey;
  salt: string;
  iter: number;
}

export async function deriveKey(pin: string, salt: string, iter: number): Promise<VaultKey> {
  const material = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: unb64(salt), iterations: iter },
    material,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable: script can use it but never read it out
    ['encrypt', 'decrypt'],
  );
  return { key, salt, iter };
}

/** New key with a fresh random salt (used when the PIN is set or changed). */
export async function newKey(pin: string, iter = PBKDF2_ITERATIONS): Promise<VaultKey> {
  return deriveKey(pin, b64(randomBytes(16)), iter);
}

export async function seal(vk: VaultKey, payload: unknown): Promise<VaultBlob> {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, vk.key, enc.encode(JSON.stringify(payload)));
  return { vault: 1, kdf: 'PBKDF2-SHA256', iter: vk.iter, salt: vk.salt, iv: b64(iv), ct: b64(ct) };
}

/** Throws Error('bad_pin') when the PIN is wrong (AES-GCM authentication fails). */
export async function open(blob: VaultBlob, pin: string): Promise<{ payload: unknown; key: VaultKey }> {
  const key = await deriveKey(pin, blob.salt, blob.iter);
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, key.key, unb64(blob.ct));
    return { payload: JSON.parse(dec.decode(pt)), key };
  } catch {
    throw new Error('bad_pin');
  }
}

/**
 * Online attempt throttling: after 5 wrong PINs, wait 30s, doubling up to 15 min.
 * Stored in localStorage; clearing it only helps someone who already has devtools,
 * who could attack the blob offline anyway. It stops the casual "try every PIN" at the keypad.
 */
const ATTEMPTS_KEY = 'velora_pin_attempts';

export function lockoutRemaining(now = Date.now()): number {
  try {
    const raw = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '{}') as { until?: number };
    return Math.max((raw.until ?? 0) - now, 0);
  } catch {
    return 0;
  }
}

export function registerFailure(now = Date.now()): number {
  try {
    const raw = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '{}') as { count?: number };
    const count = (raw.count ?? 0) + 1;
    const wait = count >= 5 ? Math.min(30_000 * 2 ** (count - 5), 15 * 60_000) : 0;
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count, until: now + wait }));
    return wait;
  } catch {
    return 0;
  }
}

export function resetFailures(): void {
  try {
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch {
    /* private mode */
  }
}
