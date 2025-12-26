import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Wallet, 
  Plus, 
  ArrowRightLeft,
  Edit2,
  Trash2
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { formatCurrency } from '@/lib/financeUtils';
import { Button } from '@/components/ui/button';
import { FormModal } from '@/components/ui/FormModal';
import { BankAccountForm } from '@/components/forms/BankAccountForm';
import { TransferForm } from '@/components/forms/TransferForm';
import { CashAdjustmentForm } from '@/components/forms/CashAdjustmentForm';
import type { BankAccount } from '@/types/finance';
import { toast } from 'sonner';

const AccountsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { data, deleteBankAccount, getTotalBankBalance } = useFinance();
  
  const [showBankForm, setShowBankForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showCashForm, setShowCashForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    if (searchParams.get('transfer') === 'true') {
      setShowTransferForm(true);
    }
  }, [searchParams]);

  const totalBankBalance = getTotalBankBalance();
  const totalBalance = totalBankBalance + data.cashBalance;

  const handleDeleteAccount = (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      deleteBankAccount(id);
      toast.success('Account deleted');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Accounts</h1>
            <p className="text-muted-foreground mt-1">Manage your bank accounts and cash</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowTransferForm(true)} variant="outline" size="sm">
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Transfer
            </Button>
            <Button onClick={() => setShowBankForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Bank
            </Button>
          </div>
        </div>

        {/* Total Balance Card */}
        <div className="stat-card gradient-card border-primary/20 glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-3xl font-bold text-primary mt-1">৳{formatCurrency(totalBalance)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Banks: ৳{formatCurrency(totalBankBalance)} | Cash: ৳{formatCurrency(data.cashBalance)}
              </p>
            </div>
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                <Wallet className="h-6 w-6 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Cash Balance</h3>
                <p className="text-sm text-muted-foreground">Physical cash on hand</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-foreground">৳{formatCurrency(data.cashBalance)}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-1 text-xs"
                onClick={() => setShowCashForm(true)}
              >
                Adjust
              </Button>
            </div>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Bank Accounts</h2>
          
          {data.bankAccounts.length === 0 ? (
            <div className="stat-card text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bank accounts added yet</p>
              <Button onClick={() => setShowBankForm(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Bank Account
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.bankAccounts.map((account) => (
                <div key={account.id} className="stat-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{account.bankName}</h3>
                        <p className="text-sm text-muted-foreground">{account.accountType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">
                          ৳{formatCurrency(account.currentBalance)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Opening: ৳{formatCurrency(account.openingBalance)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingAccount(account)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAccount(account.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transfers */}
        {data.transfers.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Recent Transfers</h2>
            <div className="space-y-2">
              {data.transfers.slice(-5).reverse().map((transfer) => {
                const fromLabel = transfer.fromType === 'cash' 
                  ? 'Cash' 
                  : data.bankAccounts.find(a => a.id === transfer.fromBankId)?.bankName || 'Bank';
                const toLabel = transfer.toType === 'cash'
                  ? 'Cash'
                  : data.bankAccounts.find(a => a.id === transfer.toBankId)?.bankName || 'Bank';
                
                return (
                  <div key={transfer.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-foreground">{fromLabel}</span>
                        <span className="text-muted-foreground"> → </span>
                        <span className="text-foreground">{toLabel}</span>
                      </span>
                    </div>
                    <span className="font-medium text-foreground">৳{formatCurrency(transfer.amount)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <FormModal
        open={showBankForm || !!editingAccount}
        onClose={() => { setShowBankForm(false); setEditingAccount(null); }}
        title={editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
      >
        <BankAccountForm
          account={editingAccount}
          onClose={() => { setShowBankForm(false); setEditingAccount(null); }}
        />
      </FormModal>

      <FormModal
        open={showTransferForm}
        onClose={() => setShowTransferForm(false)}
        title="Transfer Money"
      >
        <TransferForm onClose={() => setShowTransferForm(false)} />
      </FormModal>

      <FormModal
        open={showCashForm}
        onClose={() => setShowCashForm(false)}
        title="Adjust Cash Balance"
      >
        <CashAdjustmentForm onClose={() => setShowCashForm(false)} />
      </FormModal>
    </MainLayout>
  );
};

export default AccountsPage;
