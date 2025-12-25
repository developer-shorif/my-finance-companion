import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { useFinance } from '@/contexts/FinanceContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable } from '@/components/ui/DataTable';
import { SavingsForm } from '@/components/forms/SavingsForm';
import { formatCurrency, calculateSavingsBalance } from '@/lib/financeUtils';
import type { SavingsEntry } from '@/types/finance';

const SavingsPage: React.FC = () => {
  const { data, deleteSavings } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<SavingsEntry | undefined>();

  // Sort by date and calculate running balance
  const sortedSavings = useMemo(() => {
    const sorted = [...data.savings].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let runningBalance = 0;
    return sorted.map(entry => {
      runningBalance += entry.inAmount - entry.outAmount;
      return { ...entry, balance: runningBalance };
    }).reverse(); // Show newest first
  }, [data.savings]);

  const totalBalance = calculateSavingsBalance(data.savings);
  const totalIn = data.savings.reduce((sum, s) => sum + s.inAmount, 0);
  const totalOut = data.savings.reduce((sum, s) => sum + s.outAmount, 0);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (item: SavingsEntry & { balance: number }) => format(new Date(item.date), 'dd MMM yyyy'),
    },
    {
      key: 'savingsType',
      header: 'Type',
      render: (item: SavingsEntry & { balance: number }) => (
        <span className={item.savingsType === 'Auto' ? 'badge-success' : 'badge-primary'}>
          {item.savingsType}
        </span>
      ),
    },
    {
      key: 'account',
      header: 'Account',
    },
    {
      key: 'inAmount',
      header: 'In',
      render: (item: SavingsEntry & { balance: number }) => (
        item.inAmount > 0 ? (
          <span className="text-success flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            ৳{formatCurrency(item.inAmount)}
          </span>
        ) : '-'
      ),
    },
    {
      key: 'outAmount',
      header: 'Out',
      render: (item: SavingsEntry & { balance: number }) => (
        item.outAmount > 0 ? (
          <span className="text-destructive flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            ৳{formatCurrency(item.outAmount)}
          </span>
        ) : '-'
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      render: (item: SavingsEntry & { balance: number }) => (
        <span className="font-medium text-primary">৳{formatCurrency(item.balance)}</span>
      ),
    },
    {
      key: 'purpose',
      header: 'Purpose',
      render: (item: SavingsEntry & { balance: number }) => (
        <span className="text-muted-foreground text-sm truncate max-w-[200px] block">
          {item.purpose || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: SavingsEntry & { balance: number }) => (
        <div className="flex items-center gap-2 justify-end">
          {!item.linkedIncomeId && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditItem(item);
                  setFormOpen(true);
                }}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this entry?')) deleteSavings(item.id);
                }}
                className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </>
          )}
          {item.linkedIncomeId && (
            <span className="text-xs text-muted-foreground">Auto-generated</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Savings Ledger</h1>
            <p className="text-muted-foreground mt-1">Track your savings</p>
          </div>
          <button
            onClick={() => {
              setEditItem(undefined);
              setFormOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Manual Savings
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Savings In</p>
            <p className="text-xl font-bold text-success mt-1">৳{formatCurrency(totalIn)}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Savings Out</p>
            <p className="text-xl font-bold text-destructive mt-1">৳{formatCurrency(totalOut)}</p>
          </div>
          <div className="stat-card border-primary/30 glow-primary">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-xl font-bold text-primary mt-1">৳{formatCurrency(totalBalance)}</p>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={sortedSavings}
          emptyMessage="No savings entries yet. Auto savings will appear when you add income."
        />

        {/* Form Modal */}
        <SavingsForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditItem(undefined);
          }}
          editItem={editItem}
        />
      </div>
    </MainLayout>
  );
};

export default SavingsPage;
