import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { FormModal } from '@/components/ui/FormModal';
import type { Budget, ExpenseType } from '@/types/finance';

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  editItem?: Budget;
}

const expenseTypes: ExpenseType[] = [
  'Personal-Self', 'Personal-Family', 'Personal-Spouse', 'Personal-Children', 'Parents', 'Office'
];

export const BudgetForm: React.FC<BudgetFormProps> = ({ open, onClose, editItem }) => {
  const { addBudget, updateBudget, selectedMonth } = useFinance();
  
  const [formData, setFormData] = useState({
    month: editItem?.month || selectedMonth,
    expenseType: editItem?.expenseType || 'Personal-Self' as ExpenseType,
    budgetAmount: editItem?.budgetAmount || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editItem) {
      updateBudget(editItem.id, formData);
    } else {
      addBudget(formData);
    }
    
    onClose();
  };

  return (
    <FormModal open={open} onClose={onClose} title={editItem ? 'Edit Budget' : 'Add Budget'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Month</label>
          <input
            type="text"
            value={formData.month}
            onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
            className="input-field w-full"
            placeholder="MMM-YYYY"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Expense Type</label>
          <select
            value={formData.expenseType}
            onChange={(e) => setFormData(prev => ({ ...prev, expenseType: e.target.value as ExpenseType }))}
            className="input-field w-full"
          >
            {expenseTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1.5">Budget Amount</label>
          <input
            type="number"
            value={formData.budgetAmount || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, budgetAmount: Number(e.target.value) }))}
            className="input-field w-full"
            placeholder="0"
            min="0"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {editItem ? 'Update' : 'Add'} Budget
          </button>
        </div>
      </form>
    </FormModal>
  );
};
