import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { useFinance } from '@/contexts/FinanceContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable } from '@/components/ui/DataTable';
import { LoanForm } from '@/components/forms/LoanForm';
import { formatCurrency, getTotalLoanReceivable, getTotalLoanPayable } from '@/lib/financeUtils';
import type { Loan } from '@/types/finance';

const LoansPage: React.FC = () => {
  const { data, deleteLoan } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Loan | undefined>();

  const totalReceivable = getTotalLoanReceivable(data.loans);
  const totalPayable = getTotalLoanPayable(data.loans);

  // Calculate remaining balance per loan
  const loansWithBalance = useMemo(() => {
    return data.loans.map(loan => {
      let remaining = 0;
      if (loan.direction === 'Given') {
        remaining = loan.amount - loan.inAmount; // Money to receive
      } else {
        remaining = loan.amount - loan.outAmount; // Money to pay
      }
      return { ...loan, remaining };
    });
  }, [data.loans]);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (item: Loan & { remaining: number }) => format(new Date(item.date), 'dd MMM yyyy'),
    },
    {
      key: 'personName',
      header: 'Person',
      render: (item: Loan & { remaining: number }) => (
        <span className="font-medium">{item.personName}</span>
      ),
    },
    {
      key: 'direction',
      header: 'Direction',
      render: (item: Loan & { remaining: number }) => (
        <span className={`flex items-center gap-1 ${
          item.direction === 'Given' ? 'text-success' : 'text-warning'
        }`}>
          {item.direction === 'Given' ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {item.direction}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: Loan & { remaining: number }) => (
        <span className="font-medium">৳{formatCurrency(item.amount)}</span>
      ),
    },
    {
      key: 'remaining',
      header: 'Remaining',
      render: (item: Loan & { remaining: number }) => (
        <span className={item.direction === 'Given' ? 'text-success' : 'text-warning'}>
          ৳{formatCurrency(item.remaining)}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (item: Loan & { remaining: number }) => (
        item.dueDate ? format(new Date(item.dueDate), 'dd MMM yyyy') : '-'
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: Loan & { remaining: number }) => (
        <span className={
          item.status === 'Closed' ? 'badge-success' :
          item.status === 'Partial' ? 'badge-warning' : 'badge-primary'
        }>
          {item.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (item: Loan & { remaining: number }) => (
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
              if (confirm('Delete this loan?')) deleteLoan(item.id);
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
            <h1 className="text-2xl font-bold text-foreground">Loan Ledger</h1>
            <p className="text-muted-foreground mt-1">Track money given and taken</p>
          </div>
          <button
            onClick={() => {
              setEditItem(undefined);
              setFormOpen(true);
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Loan
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <ArrowUpRight className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Receivable</p>
                <p className="text-xl font-bold text-success mt-0.5">৳{formatCurrency(totalReceivable)}</p>
                <p className="text-xs text-muted-foreground">Money others owe you</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <ArrowDownRight className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payable</p>
                <p className="text-xl font-bold text-warning mt-0.5">৳{formatCurrency(totalPayable)}</p>
                <p className="text-xs text-muted-foreground">Money you owe others</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={loansWithBalance}
          emptyMessage="No loans recorded. Add a loan to start tracking."
        />

        {/* Form Modal */}
        <LoanForm
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

export default LoansPage;
