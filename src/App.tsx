import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { EntryProvider } from './components/EntrySheet';
import Shell from './components/Shell';
import Toaster from './components/Toaster';
import { localeOf } from './lib/i18n';
import { requestPersistence } from './lib/platform';
import Activity from './pages/Activity';
import Goals from './pages/Goals';
import Home from './pages/Home';
import Insights from './pages/Insights';
import LockScreen from './pages/LockScreen';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import { AppProvider, useApp } from './state/AppState';

/** Applies theme + language to <html>, and the status-bar colour iOS uses for the notch area. */
function DocumentSync() {
  const { data, status } = useApp();
  const { theme, language } = data.profile;
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    root.lang = localeOf(language);
    const apply = () => {
      const bg = getComputedStyle(root).getPropertyValue('--color-page').trim();
      if (bg) document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', bg));
    };
    apply();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme, language]);

  useEffect(() => {
    if (status === 'ready' && data.profile.onboardingComplete) void requestPersistence();
  }, [status, data.profile.onboardingComplete]);
  return null;
}

/**
 * iOS snapshots the app for the app switcher when it goes to the background.
 * With the PIN on, cover the screen first so balances don't show in that snapshot.
 */
function PrivacyCover() {
  const { pinEnabled, status } = useApp();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!pinEnabled) return;
    const onVis = () => setHidden(document.visibilityState === 'hidden');
    const onHide = () => setHidden(true);
    const onShow = () => setHidden(false);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', onHide);
    window.addEventListener('pageshow', onShow);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('pageshow', onShow);
    };
  }, [pinEnabled]);
  if (!pinEnabled || !hidden || status !== 'ready') return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-page" aria-hidden="true">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent text-white">
        <Wallet size={28} strokeWidth={2} />
      </span>
    </div>
  );
}

function NotFound() {
  const { t } = useApp();
  return (
    <div className="py-24 text-center">
      <p className="text-lg font-semibold text-ink">{t('notFound')}</p>
      <Link to="/" className="btn btn-primary press mt-6">
        {t('backHome')}
      </Link>
    </div>
  );
}

function Routed() {
  const { status, data } = useApp();
  if (status === 'loading') return <div className="min-h-dvh bg-page" aria-busy="true" />;
  if (status === 'locked') return <LockScreen />;
  if (!data.profile.onboardingComplete) return <Onboarding />;
  return (
    <EntryProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route path="activity" element={<Activity />} />
          <Route path="insights" element={<Insights />} />
          <Route path="goals" element={<Goals />} />
          <Route path="settings" element={<Settings />} />
          {/* v1 routes: old bookmarks and home-screen shortcuts still land somewhere sensible. */}
          <Route path="analytics" element={<Navigate to="/insights" replace />} />
          <Route path="profile" element={<Navigate to="/settings" replace />} />
          <Route path="cards" element={<Navigate to="/" replace />} />
          <Route path="send" element={<Navigate to="/activity" replace />} />
          <Route path="receive" element={<Navigate to="/activity" replace />} />
          <Route path="topup" element={<Navigate to="/activity" replace />} />
          <Route path="transaction/:id" element={<Navigate to="/activity" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Toaster />
    </EntryProvider>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
        <DocumentSync />
        <PrivacyCover />
        <Routed />
      </BrowserRouter>
    </AppProvider>
  );
}
