/**
 * Which install path applies to this browser.
 *
 * mobile-native says "never UA-sniff to detect touch" — and we don't: layout uses (hover)/(pointer).
 * Install instructions are the exception: where the Share button lives is a fact about a browser's
 * own chrome, which no feature query exposes.
 *
 * Why it matters on iPhone: every iOS browser is WebKit, and WebKit may delete IndexedDB for a site
 * not opened in 7 days. Apps added to the Home Screen are exempt. Installing is what keeps the data.
 */
export type InstallPath =
  | 'installed' // already running standalone
  | 'ios-safari' // Share (bottom bar) → Add to Home Screen
  | 'ios-chrome' // Share (top-right in the address bar) → Add to Home Screen   (iOS ≥ 16.4)
  | 'ios-other' // Edge / Firefox / others on iOS: menu → Share → Add to Home Screen
  | 'ios-inapp' // WhatsApp / Instagram / Facebook webview: can't install, open in Safari
  | 'prompt' // Chromium on Android / desktop: native beforeinstallprompt
  | 'mac-safari' // File → Add to Dock (macOS Sonoma+)
  | 'none'; // nothing to offer (Firefox desktop, etc.)

export interface PlatformInput {
  ua: string;
  standalone: boolean;
  maxTouchPoints: number;
  hasInstallPrompt: boolean;
}

export function isIOS({ ua, maxTouchPoints }: Pick<PlatformInput, 'ua' | 'maxTouchPoints'>): boolean {
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  // iPadOS 13+ reports itself as a Mac; touch points give it away.
  return /Macintosh/.test(ua) && maxTouchPoints > 1;
}

export function installPath(p: PlatformInput): InstallPath {
  if (p.standalone) return 'installed';
  const { ua } = p;
  if (isIOS(p)) {
    if (/FBAN|FBAV|Instagram|WhatsApp|Line\/|Twitter|LinkedInApp|TikTok|Snapchat/i.test(ua)) return 'ios-inapp';
    if (/CriOS/.test(ua)) return 'ios-chrome';
    if (/FxiOS|EdgiOS|OPiOS|DuckDuckGo|YaBrowser/.test(ua)) return 'ios-other';
    if (/Safari/.test(ua)) return 'ios-safari';
    return 'ios-inapp'; // WKWebView without "Safari" token = embedded browser
  }
  if (p.hasInstallPrompt) return 'prompt';
  if (/Macintosh/.test(ua) && /Version\/\d+.*Safari/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) return 'mac-safari';
  return 'none';
}

export function readPlatform(hasInstallPrompt: boolean): PlatformInput {
  const nav = navigator as Navigator & { standalone?: boolean };
  return {
    ua: nav.userAgent,
    standalone: window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true,
    maxTouchPoints: nav.maxTouchPoints || 0,
    hasInstallPrompt,
  };
}

/** Ask the browser not to evict our storage. Granted automatically for installed PWAs on most engines. */
export async function requestPersistence(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}
