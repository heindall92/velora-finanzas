import { Home, BarChart3, CreditCard, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';

export default function BottomNav() {
  const location = useLocation();
  const { data } = useApp();
  const lang = data.profile.language;
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: t(lang, 'home') },
    { path: '/analytics', icon: BarChart3, label: t(lang, 'analytics') },
    { path: '/cards', icon: CreditCard, label: t(lang, 'cards') },
    { path: '/profile', icon: User, label: t(lang, 'profile') },
  ];

  return (
    <nav className="glass-nav safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md px-2 lg:max-w-5xl xl:max-w-6xl">
        <div className="flex items-center justify-around py-1.5">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`pressable flex min-w-[64px] flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-colors ${
                  active ? 'text-blue-600' : 'text-[var(--text-muted)]'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.25 : 1.75} />
                <span className={`text-[11px] ${active ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
