import { describe, expect, it } from 'vitest';
import { isValidPin, isVaultBlob, newKey, open, seal } from '../lib/vault';

// Low iteration count only to keep the test fast; the app uses PBKDF2_ITERATIONS (600k).
const ITER = 100_000;

describe('vault', () => {
  it('round-trips with the right PIN', async () => {
    const k = await newKey('482913', ITER);
    const blob = await seal(k, { hello: 'mundo', n: 3 });
    expect(isVaultBlob(blob)).toBe(true);
    const { payload } = await open(blob, '482913');
    expect(payload).toEqual({ hello: 'mundo', n: 3 });
  });

  it('rejects the wrong PIN', async () => {
    const blob = await seal(await newKey('1234', ITER), { a: 1 });
    await expect(open(blob, '1235')).rejects.toThrow('bad_pin');
  });

  it('ciphertext does not contain the plaintext and IVs are never reused', async () => {
    const k = await newKey('1234', ITER);
    const a = await seal(k, { secret: 'R$ 3.000,00 salário' });
    const b = await seal(k, { secret: 'R$ 3.000,00 salário' });
    expect(atob(a.ct)).not.toContain('salário');
    expect(a.iv).not.toBe(b.iv);
    expect(a.ct).not.toBe(b.ct);
  });

  it('detects tampering (GCM auth tag)', async () => {
    const blob = await seal(await newKey('1234', ITER), { a: 1 });
    const bytes = atob(blob.ct).split('');
    bytes[0] = String.fromCharCode(bytes[0].charCodeAt(0) ^ 1);
    await expect(open({ ...blob, ct: btoa(bytes.join('')) }, '1234')).rejects.toThrow('bad_pin');
  });

  it('the derived key is not extractable', async () => {
    const k = await newKey('1234', ITER);
    expect(k.key.extractable).toBe(false);
    await expect(crypto.subtle.exportKey('raw', k.key)).rejects.toThrow();
  });

  it('validates PINs and blobs', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin('123456789')).toBe(false);
    expect(isVaultBlob({ vault: 1, kdf: 'PBKDF2-SHA256', iter: 10, salt: '', iv: '', ct: '' })).toBe(false);
    expect(isVaultBlob({ profile: {} })).toBe(false);
  });
});
