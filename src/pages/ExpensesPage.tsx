import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useFinance } from '@/contexts/FinanceContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { DataTable } from '@/components/ui/DataTable';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { getMonthlyExpenses, formatCurrency } from '@/lib/financeUtils';
import type { Expense } from '@/types/finance';

const ExpensesPage: React.FC = () => {
  const { data, selectedMonth, deleteExpense } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Expense | undefined>();

  const monthlyExpenses = getMonthlyExpenses(data.expenses, selectedMonth);
  const totalExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by expense type
  const byType = monthlyExpenses.reduce((acc, expense) => {
    acc[expense.expenseType] = (acc[expense.expenseType] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (item: Expense) => format(new Date(item.date), 'dd MMM'),
    },
    {
      key: 'expenseType',
      header: 'Type',
      render: (item: Expense) => <span className="badge-primary">{item.expenseType}</span>,
    },
    {
      key: 'category',
      header: 'Category',
    },
    {
      key: 'subCategory',
      header: 'Sub-Category',
      render: (item: Expense) => item.subCategory || '-',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: Expense) => (
        <span className="font-medium text-destructive">৳{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: 'paidBy',
      header: 'Paid By',
      render: (item: Expense) => <span className="text-muted-foreground">{item.paidBy}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (item: Expense) => (
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
              if (confirm('Delete this expense?')) deleteExpense(item.id);
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
            <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground mt-1">Track your spending</p>
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
              Add Expense
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-destructive">৳{formatCurrency(totalExpense)}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(byType).map(([type, amount]) => (
              <div key={type} className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground truncate">{type}</p>
                <p className="text-sm font-semibold mt-0.5">৳{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={monthlyExpenses}
          emptyMessage="No expenses recorded for this month"
        />

        {/* Form Modal */}
        <ExpenseForm
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

export default ExpensesPage;
