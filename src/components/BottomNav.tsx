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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50">
      <div className="max-w-md mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                isActive(path)
                  ? 'text-purple-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon
                size={24}
                strokeWidth={isActive(path) ? 2.5 : 2}
              />
              <span className={`text-xs font-medium ${isActive(path) ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
