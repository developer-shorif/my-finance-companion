import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { FormModal } from '@/components/ui/FormModal';
import type { Expense, ExpenseType, ExpenseCategory, PaymentMethod } from '@/types/finance';

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
  editItem?: Expense;
}

const expenseTypes: ExpenseType[] = [
  'Personal-Self', 'Personal-Family', 'Personal-Spouse', 'Personal-Children', 'Parents', 'Office'
];
const categories: ExpenseCategory[] = [
  'Food', 'Rent', 'Transport', 'Utility', 'EMI', 'Medical', 'Entertainment', 'Shopping', 'Other'
];
const paymentMethods: PaymentMethod[] = ['Cash', 'Bkash', 'Bank', 'Card'];

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ open, onClose, editItem }) => {
  const { addExpense, updateExpense } = useFinance();
  
  const [formData, setFormData] = useState({
    date: editItem?.date || new Date().toISOString().split('T')[0],
    expenseType: editItem?.expenseType || 'Personal-Self' as ExpenseType,
    category: editItem?.category || 'Food' as ExpenseCategory,
    subCategory: editItem?.subCategory || '',
    amount: editItem?.amount || 0,
    paidBy: editItem?.paidBy || 'Cash' as PaymentMethod,
    note: editItem?.note || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editItem) {
      updateExpense(editItem.id, formData);
    } else {
      addExpense(formData);
    }
    
    onClose();
  };

  return (
    <FormModal open={open} onClose={onClose} title={editItem ? 'Edit Expense' : 'Add Expense'}>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ExpenseCategory }))}
              className="input-field w-full"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Sub-Category</label>
            <input
              type="text"
              value={formData.subCategory}
              onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
              className="input-field w-full"
              placeholder="e.g., Groceries"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Amount</label>
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="input-field w-full"
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Paid By</label>
            <select
              value={formData.paidBy}
              onChange={(e) => setFormData(prev => ({ ...prev, paidBy: e.target.value as PaymentMethod }))}
              className="input-field w-full"
            >
              {paymentMethods.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
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
            {editItem ? 'Update' : 'Add'} Expense
          </button>
        </div>
      </form>
    </FormModal>
  );
};
