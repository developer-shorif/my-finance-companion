import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useFinance } from '@/contexts/FinanceContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { DataTable } from '@/components/ui/DataTable';
import { IncomeForm } from '@/components/forms/IncomeForm';
import { getMonthlyIncomes, formatCurrency } from '@/lib/financeUtils';
import type { Income } from '@/types/finance';

const IncomePage: React.FC = () => {
  const { data, selectedMonth, deleteIncome } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Income | undefined>();

  const monthlyIncomes = getMonthlyIncomes(data.incomes, selectedMonth);
  
  const totals = monthlyIncomes.reduce(
    (acc, income) => ({
      gross: acc.gross + income.grossIncome,
      savings: acc.savings + income.autoSavings,
      usable: acc.usable + income.usableIncome,
    }),
    { gross: 0, savings: 0, usable: 0 }
  );

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (item: Income) => format(new Date(item.date), 'dd MMM yyyy'),
    },
    {
      key: 'source',
      header: 'Source',
      render: (item: Income) => <span className="badge-primary">{item.source}</span>,
    },
    {
      key: 'type',
      header: 'Type',
    },
    {
      key: 'grossIncome',
      header: 'Gross Income',
      render: (item: Income) => (
        <span className="font-medium">৳{formatCurrency(item.grossIncome)}</span>
      ),
    },
    {
      key: 'autoSavings',
      header: 'Auto Savings',
      render: (item: Income) => (
        <span className="text-success">৳{formatCurrency(item.autoSavings)}</span>
      ),
    },
    {
      key: 'usableIncome',
      header: 'Usable Income',
      render: (item: Income) => (
        <span className="text-primary font-medium">৳{formatCurrency(item.usableIncome)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: Income) => (
        <div className="flex items-center gap-2 justify-end">
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
              if (confirm('Delete this income?')) deleteIncome(item.id);
            }}
            className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
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
            <h1 className="text-2xl font-bold text-foreground">Income</h1>
            <p className="text-muted-foreground mt-1">Track your income sources</p>
          </div>
          <div className="flex items-center gap-4">
            <MonthSelector />
            <button
              onClick={() => {
                setEditItem(undefined);
                setFormOpen(true);
              }}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Gross Income</p>
            <p className="text-xl font-bold text-foreground mt-1">৳{formatCurrency(totals.gross)}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Auto Savings</p>
            <p className="text-xl font-bold text-success mt-1">৳{formatCurrency(totals.savings)}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Usable Income</p>
            <p className="text-xl font-bold text-primary mt-1">৳{formatCurrency(totals.usable)}</p>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={monthlyIncomes}
          emptyMessage="No income recorded for this month"
        />

        {/* Form Modal */}
        <IncomeForm
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

export default IncomePage;
