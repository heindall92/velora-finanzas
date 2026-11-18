import { BarChart3, Home, ListOrdered, Lock, Plus, Settings, Target, Wallet } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../state/AppState';
import { useEntry } from './EntrySheet';

export default function Shell() {
  const { t, data, pinEnabled, lock } = useApp();
  const { openNew } = useEntry();
  const { pathname } = useLocation();
  const name = [data.profile.firstName, data.profile.lastName].filter(Boolean).join(' ');

  // New page = top of page (SPA navigation keeps the old scroll otherwise).
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  // "N" opens a new entry on desktop (not while typing or inside a dialog).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'n' && e.key !== 'N') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || (el as HTMLElement).isContentEditable)) return;
      if (document.querySelector('dialog[open]')) return;
      e.preventDefault();
      openNew();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openNew]);

  const nav = [
    { to: '/', label: t('navHome'), icon: Home, end: true },
    { to: '/activity', label: t('navActivity'), icon: ListOrdered },
    { to: '/insights', label: t('navInsights'), icon: BarChart3 },
    { to: '/goals', label: t('navGoals'), icon: Target },
    { to: '/settings', label: t('navSettings'), icon: Settings },
  ];

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-side px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-white">
            <Wallet size={18} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">{t('appName')}</span>
        </div>

        <button type="button" onClick={() => openNew()} className="btn btn-primary press mb-6 w-full">
          <Plus size={18} strokeWidth={2.25} aria-hidden="true" />
          {t('newEntry')}
          <kbd className="ml-auto hidden rounded-md bg-white/20 px-1.5 text-[11px] font-medium xl:inline">N</kbd>
        </button>

        <nav aria-label={t('appName')} className="flex flex-col gap-0.5">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `press flex h-10 items-center gap-3 rounded-xl px-3 text-[0.9375rem] ${
                  isActive ? 'bg-accent/[.08] font-semibold text-accent-ink' : 'font-medium text-ink-2 hover-soft'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.6} aria-hidden="true" />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft text-sm font-semibold text-ink-2" aria-hidden="true">
            {(data.profile.firstName || '?').charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{name}</span>
          {pinEnabled && (
            <button type="button" className="icon-btn press hover-soft h-9 w-9" onClick={lock} aria-label={t('lockNow')} title={t('lockNow')}>
              <Lock size={16} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </aside>

      <div className="min-w-0">
        <main
          className="pb-tabbar mx-auto w-full max-w-[1180px] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 lg:px-10 lg:pt-10 min-[112.5rem]:max-w-[1500px]"
        >
          <Outlet />
        </main>
      </div>

      {/* Phone / tablet tab bar */}
      <nav
        aria-label={t('appName')}
        className="material fixed inset-x-0 bottom-0 z-50 border-t border-line lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-2">
          {nav.slice(0, 2).map((item) => (
            <TabLink key={item.to} {...item} />
          ))}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => openNew()}
              aria-label={t('newEntry')}
              className="press grid h-12 w-12 place-items-center rounded-full bg-accent text-white shadow-[0_6px_16px_-4px_rgb(0_102_255/0.6)]"
            >
              <Plus size={24} strokeWidth={2.25} />
            </button>
          </div>
          {[nav[2], nav[3]].map((item) => (
            <TabLink key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function TabLink({ to, label, icon: Icon, end }: { to: string; label: string; icon: typeof Home; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `press flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[10.5px] ${isActive ? 'font-semibold text-accent-ink' : 'font-medium text-muted'}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={isActive ? 2.1 : 1.6} aria-hidden="true" />
          <span className="max-w-full truncate px-1">{label}</span>
        </>
      )}
    </NavLink>
  );
}
