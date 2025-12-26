import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight,
  HandCoins,
  X
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

const AddPage: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add Income',
      description: 'Record salary, freelance, or other earnings',
      icon: TrendingUp,
      color: 'bg-success/20 text-success',
      path: '/income?add=true',
    },
    {
      label: 'Add Expense',
      description: 'Track your spending across categories',
      icon: TrendingDown,
      color: 'bg-destructive/20 text-destructive',
      path: '/expenses?add=true',
    },
    {
      label: 'Transfer Money',
      description: 'Move money between accounts',
      icon: ArrowLeftRight,
      color: 'bg-primary/20 text-primary',
      path: '/accounts?transfer=true',
    },
    {
      label: 'Add Loan',
      description: 'Record money given or taken',
      icon: HandCoins,
      color: 'bg-warning/20 text-warning',
      path: '/loans?add=true',
    },
  ];

  return (
    <MainLayout hideBottomNav>
      <div className="min-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Quick Add</h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Cards */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="stat-card hover:border-primary/50 flex flex-col items-center justify-center gap-3 text-center p-6"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${action.color}`}>
                <action.icon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{action.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Tip:</span> Income automatically saves 20% to your selected savings account.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddPage;
