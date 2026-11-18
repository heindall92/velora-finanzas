import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

const routesWithBottomNav = ['/', '/analytics', '/cards', '/profile', '/goals'];

export default function Layout() {
  const location = useLocation();
  const showBottomNav = routesWithBottomNav.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        <Outlet />
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
