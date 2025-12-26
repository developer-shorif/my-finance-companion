import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BankAccount, AccountType, WalletAccountType } from '@/types/finance';
import { toast } from 'sonner';

interface BankAccountFormProps {
  account?: BankAccount | null;
  onClose: () => void;
}

const walletTypes: WalletAccountType[] = ['Bank', 'Mobile Wallet'];
const bankAccountTypes: AccountType[] = ['Savings', 'Current', 'Salary', 'Fixed Deposit'];

export const BankAccountForm: React.FC<BankAccountFormProps> = ({ account, onClose }) => {
  const { addBankAccount, updateBankAccount } = useFinance();
  
  const [bankName, setBankName] = useState(account?.bankName || '');
  const [walletType, setWalletType] = useState<WalletAccountType>(account?.walletType || 'Bank');
  const [accountType, setAccountType] = useState<AccountType>(account?.accountType || 'Savings');
  const [openingBalance, setOpeningBalance] = useState(account?.openingBalance?.toString() || '0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankName.trim()) {
      toast.error('Please enter account name');
      return;
    }

    if (account) {
      updateBankAccount(account.id, { bankName, walletType, accountType });
      toast.success('Account updated');
    } else {
      addBankAccount({
        bankName,
        walletType,
        accountType,
        openingBalance: Number(openingBalance) || 0,
      });
      toast.success('Account added');
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Account Type</Label>
        <Select value={walletType} onValueChange={(v) => setWalletType(v as WalletAccountType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {walletTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{walletType === 'Bank' ? 'Bank Name' : 'Wallet Name'}</Label>
        <Input 
          value={bankName} 
          onChange={(e) => setBankName(e.target.value)} 
          placeholder={walletType === 'Bank' ? 'e.g., City Bank' : 'e.g., Bkash'} 
        />
      </div>
      
      {walletType === 'Bank' && (
        <div className="space-y-2">
          <Label>Account Category</Label>
          <Select value={accountType} onValueChange={(v) => setAccountType(v as AccountType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {bankAccountTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {!account && (
        <div className="space-y-2">
          <Label>Opening Balance</Label>
          <Input type="number" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} />
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">{account ? 'Update' : 'Add'}</Button>
      </div>
    </form>
  );
};
