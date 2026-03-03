import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Tag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'หน้าแรก', icon: Home },
  { to: '/ticket', label: 'ค้นหา', icon: Search },
  { to: '/promotions', label: 'โปรโมชั่น', icon: Tag },
  { to: '/profile', label: 'โปรไฟล์', icon: User },
];

// Hide bottom nav on these booking-flow routes
const hiddenRoutes = ['/ticket', '/search', '/seats', '/passengers', '/payment', '/e-ticket'];

const BottomNav = () => {
  const { pathname } = useLocation();

  if (hiddenRoutes.includes(pathname)) return null;

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-card border-t border-border shadow-lg sm:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-xs transition-colors',
                active ? 'text-primary font-bold' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={active ? 2.5 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
