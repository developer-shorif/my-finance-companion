import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { FormModal } from '@/components/ui/FormModal';
import type { Income, IncomeSource, IncomeType } from '@/types/finance';
import { calculateAutoSavings, calculateUsableIncome, formatCurrency } from '@/lib/financeUtils';

interface IncomeFormProps {
  open: boolean;
  onClose: () => void;
  editItem?: Income;
}

const incomeSources: IncomeSource[] = ['Client', 'Salary', 'Business', 'Other'];
const incomeTypes: IncomeType[] = ['Freelance', 'Salary', 'Business', 'Other'];

export const IncomeForm: React.FC<IncomeFormProps> = ({ open, onClose, editItem }) => {
  const { addIncome, updateIncome } = useFinance();
  
  const [formData, setFormData] = useState({
    date: editItem?.date || new Date().toISOString().split('T')[0],
    source: editItem?.source || 'Salary' as IncomeSource,
    type: editItem?.type || 'Salary' as IncomeType,
    grossIncome: editItem?.grossIncome || 0,
    note: editItem?.note || '',
  });

  const autoSavings = calculateAutoSavings(formData.grossIncome);
  const usableIncome = calculateUsableIncome(formData.grossIncome, autoSavings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editItem) {
      updateIncome(editItem.id, formData);
    } else {
      addIncome(formData);
    }
    
    onClose();
  };

  return (
    <FormModal open={open} onClose={onClose} title={editItem ? 'Edit Income' : 'Add Income'}>
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
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Source</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as IncomeSource }))}
              className="input-field w-full"
            >
              {incomeSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as IncomeType }))}
              className="input-field w-full"
            >
              {incomeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Gross Income</label>
            <input
              type="number"
              value={formData.grossIncome || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, grossIncome: Number(e.target.value) }))}
              className="input-field w-full"
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        {/* Auto-calculated fields */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div>
            <p className="text-xs text-muted-foreground">Auto Savings (20%)</p>
            <p className="text-lg font-semibold text-success">৳{formatCurrency(autoSavings)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Usable Income</p>
            <p className="text-lg font-semibold text-primary">৳{formatCurrency(usableIncome)}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Note</label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
            className="input-field w-full min-h-[80px] resize-none"
            placeholder="Optional note..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {editItem ? 'Update' : 'Add'} Income
          </button>
        </div>
      </form>
    </FormModal>
  );
};
