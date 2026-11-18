import { Copy, Download, MoreHorizontal, Share, SquarePlus, Smartphone, X } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { installPath, readPlatform, type InstallPath } from '../lib/platform';
import { hasInstallPrompt, promptInstall, subscribeInstall } from '../state/install';
import { useApp } from '../state/AppState';
import Sheet from './Sheet';

const DISMISS_KEY = 'velora_install_dismissed';
const DISMISS_DAYS = 7; // on iPhone the risk is real: come back after a week, not never

function useInstallPath(): InstallPath {
  const prompt = useSyncExternalStore(subscribeInstall, hasInstallPrompt, () => false);
  return installPath(readPlatform(prompt));
}

function dismissedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - at < DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

/** Steps for each browser. Exported for the Settings entry point. */
export function InstallGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, toast } = useApp();
  const path = useInstallPath();
  const ios = path.startsWith('ios');

  const step1 =
    path === 'ios-chrome' ? t('installChrome1') : path === 'ios-other' ? t('installOther1') : t('installSafari1');
  const Step1Icon = path === 'ios-other' ? MoreHorizontal : Share;

  return (
    <Sheet open={open} onClose={onClose} title={t('installTitle')} closeLabel={t('close')}>
      <p className="mb-5 text-sm text-ink-2">{ios ? t('installWhyIOS') : t('installWhyOther')}</p>

      {path === 'ios-inapp' && (
        <div className="space-y-4">
          <p className="rounded-xl bg-warn/10 p-3 text-sm text-ink">{t('installInapp')}</p>
          <button
            type="button"
            className="btn btn-secondary press w-full"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(location.href);
                toast({ message: t('linkCopied') });
              } catch {
                /* clipboard blocked in some webviews */
              }
            }}
          >
            <Copy size={18} strokeWidth={1.75} aria-hidden="true" />
            {t('copyLink')}
          </button>
        </div>
      )}

      {(path === 'ios-safari' || path === 'ios-chrome' || path === 'ios-other') && (
        <ol className="space-y-3">
          {[
            { icon: Step1Icon, text: step1 },
            { icon: SquarePlus, text: t('installStep2') },
            { icon: Smartphone, text: t('installStep3') },
          ].map(({ icon: Icon, text }, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-soft p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-card text-accent-ink">
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="text-sm text-ink">
                <span className="num mr-1.5 font-semibold text-muted">{i + 1}.</span>
                {text}
              </span>
            </li>
          ))}
        </ol>
      )}

      {path === 'prompt' && (
        <button
          type="button"
          className="btn btn-primary press w-full"
          onClick={async () => {
            if (await promptInstall()) toast({ message: t('installedOk') });
            onClose();
          }}
        >
          <Download size={18} strokeWidth={2} aria-hidden="true" />
          {t('installCta')}
        </button>
      )}

      {path === 'mac-safari' && <p className="rounded-xl bg-soft p-3 text-sm text-ink">{t('installMac')}</p>}
    </Sheet>
  );
}

/** Calm, dismissible card at the top of Home. Hidden once installed or where nothing applies. */
export default function InstallBanner() {
  const { t } = useApp();
  const path = useInstallPath();
  const [hidden, setHidden] = useState(dismissedRecently);
  const [guide, setGuide] = useState(false);

  if (hidden || path === 'installed' || path === 'none') return null;
  const ios = path.startsWith('ios');

  return (
    <>
      <div className="card mb-5 flex items-center gap-3 p-3 pl-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent-ink">
          <Smartphone size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{t('installTitle')}</p>
          {ios && <p className="line-clamp-2 text-xs text-muted">{t('installWhyIOS')}</p>}
        </div>
        <button type="button" className="btn btn-primary press min-h-10 shrink-0 px-3.5 text-sm" onClick={() => (path === 'prompt' ? promptInstall() : setGuide(true))}>
          {path === 'prompt' ? t('installCta') : t('installHow')}
        </button>
        <button
          type="button"
          className="icon-btn press h-9 w-9 shrink-0"
          aria-label={t('installLater')}
          onClick={() => {
            try {
              localStorage.setItem(DISMISS_KEY, String(Date.now()));
            } catch {
              /* ignore */
            }
            setHidden(true);
          }}
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
      <InstallGuide open={guide} onClose={() => setGuide(false)} />
    </>
  );
}
