import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight,
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
      description: 'Move money between bank and cash',
      icon: ArrowLeftRight,
      color: 'bg-primary/20 text-primary',
      path: '/accounts?transfer=true',
    },
  ];

  return (
    <MainLayout hideBottomNav>
      <div className="min-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Quick Add</h1>
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Cards */}
        <div className="flex-1 space-y-4">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="w-full stat-card hover:border-primary/50 flex items-center gap-4 text-left"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${action.color}`}>
                <action.icon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">{action.label}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Tip:</span> Income automatically saves 20% to your savings. You can adjust this in settings.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddPage;
