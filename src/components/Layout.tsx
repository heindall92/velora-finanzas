import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

const routesWithBottomNav = ['/', '/analytics', '/cards', '/profile', '/goals'];

export default function Layout() {
  const location = useLocation();
  const showBottomNav = routesWithBottomNav.includes(location.pathname);

  return (
    <div className="app-shell bg-slate-50">
      <div className="relative mx-auto min-h-dvh max-w-md bg-white shadow-[0_0_60px_rgba(15,23,42,0.08)]">
        <div className={showBottomNav ? 'safe-area-page' : ''}>
          <Outlet />
        </div>
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
