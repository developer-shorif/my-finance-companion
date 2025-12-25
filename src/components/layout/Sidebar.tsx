import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PiggyBank, 
  HandCoins,
  Wallet
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/income', label: 'Income', icon: TrendingUp },
  { path: '/expenses', label: 'Expenses', icon: TrendingDown },
  { path: '/budget', label: 'Budget', icon: Target },
  { path: '/savings', label: 'Savings', icon: PiggyBank },
  { path: '/loans', label: 'Loans', icon: HandCoins },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
          <Wallet className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">FinanceFlow</h1>
          <p className="text-xs text-muted-foreground">Personal Finance</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={`nav-link ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © 2024 FinanceFlow
        </p>
      </div>
    </aside>
  );
};
