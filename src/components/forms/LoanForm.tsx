import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { FormModal } from '@/components/ui/FormModal';
import type { Loan, ExpenseType, LoanDirection, LoanStatus } from '@/types/finance';

interface LoanFormProps {
  open: boolean;
  onClose: () => void;
  editItem?: Loan;
}

const loanTypes: ExpenseType[] = ['Personal-Self', 'Parents', 'Office'];
const directions: LoanDirection[] = ['Given', 'Taken'];
const statuses: LoanStatus[] = ['Open', 'Partial', 'Closed'];

export const LoanForm: React.FC<LoanFormProps> = ({ open, onClose, editItem }) => {
  const { addLoan, updateLoan } = useFinance();
  
  const [formData, setFormData] = useState({
    date: editItem?.date || new Date().toISOString().split('T')[0],
    personName: editItem?.personName || '',
    loanType: editItem?.loanType || 'Personal-Self' as ExpenseType,
    direction: editItem?.direction || 'Given' as LoanDirection,
    amount: editItem?.amount || 0,
    inAmount: editItem?.inAmount || 0,
    outAmount: editItem?.outAmount || 0,
    dueDate: editItem?.dueDate || '',
    status: editItem?.status || 'Open' as LoanStatus,
    note: editItem?.note || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editItem) {
      updateLoan(editItem.id, formData);
    } else {
      // Set initial out/in based on direction
      const initialData = {
        ...formData,
        outAmount: formData.direction === 'Given' ? formData.amount : 0,
        inAmount: formData.direction === 'Taken' ? formData.amount : 0,
      };
      addLoan(initialData);
    }
    
    onClose();
  };

  return (
    <FormModal open={open} onClose={onClose} title={editItem ? 'Edit Loan' : 'Add Loan'}>
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
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Person Name</label>
            <input
              type="text"
              value={formData.personName}
              onChange={(e) => setFormData(prev => ({ ...prev, personName: e.target.value }))}
              className="input-field w-full"
              placeholder="Enter name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Loan Type</label>
            <select
              value={formData.loanType}
              onChange={(e) => setFormData(prev => ({ ...prev, loanType: e.target.value as ExpenseType }))}
              className="input-field w-full"
            >
              {loanTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Direction</label>
            <select
              value={formData.direction}
              onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value as LoanDirection }))}
              className="input-field w-full"
            >
              {directions.map(dir => (
                <option key={dir} value={dir}>{dir} {dir === 'Given' ? '(I will receive)' : '(I need to pay)'}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">
              {editItem ? 'Original Amount' : 'Amount'}
            </label>
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              className="input-field w-full"
              placeholder="0"
              min="0"
              required
              disabled={!!editItem}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="input-field w-full"
            />
          </div>
        </div>

        {editItem && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Received</label>
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
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Paid</label>
              <input
                type="number"
                value={formData.outAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, outAmount: Number(e.target.value) }))}
                className="input-field w-full"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1.5">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as LoanStatus }))}
                className="input-field w-full"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        )}

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
            {editItem ? 'Update' : 'Add'} Loan
          </button>
        </div>
      </form>
    </FormModal>
  );
};
