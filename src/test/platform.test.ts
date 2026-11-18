import { describe, expect, it } from 'vitest';
import { installPath } from '../lib/platform';

const base = { standalone: false, maxTouchPoints: 5, hasInstallPrompt: false };
const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1',
  iphoneFirefox: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/132.0 Mobile/15E148 Safari/605.1.15',
  iphoneEdge: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/131.0.2903.68 Mobile/15E148 Safari/605.1.15',
  iphoneInstagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 357.0.0.25.101',
  iphoneWebview: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  ipadOS: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  androidChrome: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  macChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  winFirefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
};

describe('installPath', () => {
  it.each([
    ['iphoneSafari', 'ios-safari'],
    ['iphoneChrome', 'ios-chrome'],
    ['iphoneFirefox', 'ios-other'],
    ['iphoneEdge', 'ios-other'],
    ['iphoneInstagram', 'ios-inapp'],
    ['iphoneWebview', 'ios-inapp'],
    ['ipadOS', 'ios-safari'],
  ] as const)('%s → %s', (k, expected) => {
    expect(installPath({ ...base, ua: UA[k] })).toBe(expected);
  });
  it('standalone wins', () => {
    expect(installPath({ ...base, ua: UA.iphoneChrome, standalone: true })).toBe('installed');
  });
  it('Chromium with a prompt', () => {
    expect(installPath({ ...base, ua: UA.androidChrome, hasInstallPrompt: true })).toBe('prompt');
    expect(installPath({ ...base, ua: UA.androidChrome })).toBe('none');
  });
  it('macOS Safari (no touch) → Add to Dock; Mac Chrome without prompt → none', () => {
    expect(installPath({ ...base, maxTouchPoints: 0, ua: UA.ipadOS })).toBe('mac-safari');
    expect(installPath({ ...base, maxTouchPoints: 0, ua: UA.macChrome })).toBe('none');
    expect(installPath({ ...base, maxTouchPoints: 0, ua: UA.winFirefox })).toBe('none');
  });
});
