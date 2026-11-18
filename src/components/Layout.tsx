import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

const routesWithBottomNav = ['/', '/analytics', '/cards', '/profile', '/goals'];

export default function Layout() {
  const location = useLocation();
  const showBottomNav = routesWithBottomNav.includes(location.pathname);

  return (
    <div className="app-shell bg-slate-100 lg:bg-[radial-gradient(ellipse_at_top,_#dbeafe_0%,_#f8fafc_55%)]">
      <div
        className={`relative mx-auto min-h-dvh w-full bg-white shadow-[0_0_60px_rgba(15,23,42,0.08)]
          max-w-md
          sm:max-w-lg
          lg:my-6 lg:min-h-[calc(100dvh-3rem)] lg:max-w-5xl lg:overflow-hidden lg:rounded-[32px]
          xl:max-w-6xl`}
      >
        <div className={showBottomNav ? 'safe-area-page' : ''}>
          <Outlet />
        </div>
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
