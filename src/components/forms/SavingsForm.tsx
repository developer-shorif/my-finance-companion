import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { FormModal } from '@/components/ui/FormModal';
import type { SavingsEntry, SavingsType, SavingsAccount } from '@/types/finance';

interface SavingsFormProps {
  open: boolean;
  onClose: () => void;
  editItem?: SavingsEntry;
}

const savingsTypes: SavingsType[] = ['Auto', 'Manual'];
const accounts: SavingsAccount[] = ['Cash', 'Bank', 'Mobile Wallet'];

export const SavingsForm: React.FC<SavingsFormProps> = ({ open, onClose, editItem }) => {
  const { addSavings, updateSavings } = useFinance();
  
  const [formData, setFormData] = useState({
    date: editItem?.date || new Date().toISOString().split('T')[0],
    savingsType: editItem?.savingsType || 'Manual' as SavingsType,
    account: editItem?.account || 'Bank' as SavingsAccount,
    inAmount: editItem?.inAmount || 0,
    outAmount: editItem?.outAmount || 0,
    purpose: editItem?.purpose || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editItem) {
      updateSavings(editItem.id, formData);
    } else {
      addSavings(formData);
    }
    
    onClose();
  };

  return (
    <FormModal open={open} onClose={onClose} title={editItem ? 'Edit Savings' : 'Add Savings'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="input-field w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Type</label>
            <select
              value={formData.savingsType}
              onChange={(e) => setFormData(prev => ({ ...prev, savingsType: e.target.value as SavingsType }))}
              className="input-field w-full"
              disabled={editItem?.savingsType === 'Auto'}
            >
              {savingsTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Account</label>
          <select
            value={formData.account}
            onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value as SavingsAccount }))}
            className="input-field w-full"
          >
            {accounts.map(acc => (
              <option key={acc} value={acc}>{acc}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">In Amount</label>
            <input
              type="number"
              value={formData.inAmount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, inAmount: Number(e.target.value) }))}
              className="input-field w-full"
              placeholder="0"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Out Amount</label>
            <input
              type="number"
              value={formData.outAmount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, outAmount: Number(e.target.value) }))}
              className="input-field w-full"
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Purpose</label>
          <textarea
            value={formData.purpose}
            onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
            className="input-field w-full min-h-[80px] resize-none"
            placeholder="Purpose of savings..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {editItem ? 'Update' : 'Add'} Savings
          </button>
        </div>
      </form>
    </FormModal>
  );
};
