import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CashAdjustmentFormProps {
  onClose: () => void;
}

export const CashAdjustmentForm: React.FC<CashAdjustmentFormProps> = ({ onClose }) => {
  const { data, setCashBalance } = useFinance();
  const [balance, setBalance] = useState(data.cashBalance.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCashBalance(Number(balance) || 0);
    toast.success('Cash balance updated');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Current Cash Balance</Label>
        <Input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0" />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">Update</Button>
      </div>
    </form>
  );
};
