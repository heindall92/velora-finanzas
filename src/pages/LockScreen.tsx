import { Lock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import PinPad from '../components/PinPad';
import Sheet from '../components/Sheet';
import { makeT } from '../lib/i18n';
import { lockoutRemaining, registerFailure, resetFailures } from '../lib/vault';
import { useApp } from '../state/AppState';

export default function LockScreen() {
  const { unlock, eraseAll, hintLang } = useApp();
  const t = makeT(hintLang);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [wait, setWait] = useState(() => lockoutRemaining());
  const [forgot, setForgot] = useState(false);

  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setInterval(() => setWait(lockoutRemaining()), 500);
    return () => window.clearInterval(id);
  }, [wait]);

  const submit = useCallback(async () => {
    if (busy || lockoutRemaining() > 0) return;
    setBusy(true);
    setError('');
    try {
      await unlock(pin);
      resetFailures();
    } catch {
      const w = registerFailure();
      setWait(w);
      setError(t('pinWrong'));
      setShake(true);
      window.setTimeout(() => setShake(false), 400);
      setPin('');
    } finally {
      setBusy(false);
    }
  }, [busy, pin, unlock, t]);

  const waitS = Math.ceil(wait / 1000);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-page px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <span className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-white">
        <Lock size={24} strokeWidth={2} aria-hidden="true" />
      </span>
      <h1 className="mb-1 text-xl font-semibold text-ink">{t('unlockTitle')}</h1>
      <p className={`mb-8 h-5 text-sm ${error || waitS > 0 ? 'text-down' : 'text-muted'}`} role="alert">
        {busy ? t('unlocking') : waitS > 0 ? t('pinWait', { s: waitS }) : error}
      </p>
      <PinPad
        value={pin}
        onChange={(v) => {
          setPin(v);
          if (error) setError('');
        }}
        onSubmit={submit}
        disabled={busy || waitS > 0}
        error={shake}
        deleteLabel={t('pinDelete')}
        submitLabel={t('confirm')}
      />
      <button type="button" className="press mt-10 text-sm font-medium text-accent-ink" onClick={() => setForgot(true)}>
        {t('pinForgot')}
      </button>

      <Sheet
        open={forgot}
        onClose={() => setForgot(false)}
        title={t('pinForgot')}
        closeLabel={t('close')}
        footer={
          <div className="flex gap-2">
            <button type="button" className="btn btn-secondary press flex-1" onClick={() => setForgot(false)}>
              {t('cancel')}
            </button>
            <button
              type="button"
              className="btn btn-danger press flex-1"
              onClick={async () => {
                await eraseAll();
                resetFailures();
              }}
            >
              {t('eraseConfirmCta')}
            </button>
          </div>
        }
      >
        <p className="text-sm text-ink-2">{t('pinForgotBody')}</p>
      </Sheet>
    </div>
  );
}
