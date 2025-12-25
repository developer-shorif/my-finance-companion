import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { DataTable } from '@/components/ui/DataTable';
import { BudgetForm } from '@/components/forms/BudgetForm';
import { getBudgetsWithActual, formatCurrency } from '@/lib/financeUtils';
import type { Budget, BudgetWithActual } from '@/types/finance';

const BudgetPage: React.FC = () => {
  const { data, selectedMonth, deleteBudget } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Budget | undefined>();

  const budgetsWithActual = getBudgetsWithActual(data.budgets, data.expenses, selectedMonth);
  
  const totals = budgetsWithActual.reduce(
    (acc, b) => ({
      budget: acc.budget + b.budgetAmount,
      actual: acc.actual + b.actualExpense,
    }),
    { budget: 0, actual: 0 }
  );

  const columns = [
    {
      key: 'expenseType',
      header: 'Expense Type',
      render: (item: BudgetWithActual) => (
        <span className="font-medium">{item.expenseType}</span>
      ),
    },
    {
      key: 'budgetAmount',
      header: 'Budget',
      render: (item: BudgetWithActual) => (
        <span className="font-medium">৳{formatCurrency(item.budgetAmount)}</span>
      ),
    },
    {
      key: 'actualExpense',
      header: 'Actual',
      render: (item: BudgetWithActual) => (
        <span className={item.actualExpense > item.budgetAmount ? 'text-destructive font-medium' : 'text-muted-foreground'}>
          ৳{formatCurrency(item.actualExpense)}
        </span>
      ),
    },
    {
      key: 'difference',
      header: 'Difference',
      render: (item: BudgetWithActual) => (
        <span className={item.difference >= 0 ? 'text-success' : 'text-destructive'}>
          {item.difference >= 0 ? '+' : ''}৳{formatCurrency(item.difference)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: BudgetWithActual) => (
        <span className={
          item.status === 'Over Budget' ? 'badge-destructive' :
          item.status === 'Under Budget' ? 'badge-success' : 'badge-primary'
        }>
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: BudgetWithActual) => (
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
              if (confirm('Delete this budget?')) deleteBudget(item.id);
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
            <h1 className="text-2xl font-bold text-foreground">Budget</h1>
            <p className="text-muted-foreground mt-1">Plan and compare your spending</p>
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
              Add Budget
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-xl font-bold text-foreground mt-1">৳{formatCurrency(totals.budget)}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Actual</p>
            <p className={`text-xl font-bold mt-1 ${totals.actual > totals.budget ? 'text-destructive' : 'text-foreground'}`}>
              ৳{formatCurrency(totals.actual)}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={`text-xl font-bold mt-1 ${totals.budget - totals.actual >= 0 ? 'text-success' : 'text-destructive'}`}>
              ৳{formatCurrency(totals.budget - totals.actual)}
            </p>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={budgetsWithActual}
          emptyMessage="No budget set for this month. Add a budget to start tracking."
        />

        {/* Form Modal */}
        <BudgetForm
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

export default BudgetPage;
