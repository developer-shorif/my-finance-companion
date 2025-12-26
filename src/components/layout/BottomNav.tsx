import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target,
  PlusCircle,
  HandCoins,
  Settings
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/budget', label: 'Budget', icon: Target },
  { path: '/add', label: 'Add', icon: PlusCircle, isCenter: true },
  { path: '/loans', label: 'Loans', icon: HandCoins },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ path, label, icon: Icon, isCenter }) => {
          const isActive = location.pathname === path || 
            (path === '/add' && ['/add', '/add/income', '/add/expense', '/add/transfer'].includes(location.pathname));
          
          if (isCenter) {
            return (
              <NavLink
                key={path}
                to={path}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className={`flex items-center justify-center w-14 h-14 rounded-full gradient-primary shadow-lg ${isActive ? 'ring-2 ring-primary/50' : ''}`}>
                  <Icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
              </NavLink>
            );
          }
          
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-1">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
