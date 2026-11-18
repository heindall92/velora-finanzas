import { Home, BarChart3, CreditCard, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/analytics', icon: BarChart3, label: 'Análisis' },
    { path: '/cards', icon: CreditCard, label: 'Tarjetas' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="glass-nav safe-area-inset-bottom fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md px-2">
        <div className="flex items-center justify-around py-1.5">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                className={`pressable flex min-w-[64px] flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-colors ${
                  active ? 'text-blue-600' : 'text-slate-400'
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
