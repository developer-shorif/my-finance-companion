import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface TransferFormProps {
  onClose: () => void;
}

export const TransferForm: React.FC<TransferFormProps> = ({ onClose }) => {
  const { data, addTransfer } = useFinance();
  
  const [fromType, setFromType] = useState<'bank' | 'cash'>('bank');
  const [toType, setToType] = useState<'bank' | 'cash'>('cash');
  const [fromBankId, setFromBankId] = useState(data.bankAccounts[0]?.id || '');
  const [toBankId, setToBankId] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    addTransfer({
      date: new Date().toISOString(),
      fromType,
      toType,
      fromBankId: fromType === 'bank' ? fromBankId : undefined,
      toBankId: toType === 'bank' ? toBankId : undefined,
      amount: Number(amount),
      note: '',
    });
    
    toast.success('Transfer completed');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>From</Label>
          <Select value={fromType} onValueChange={(v) => setFromType(v as 'bank' | 'cash')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>To</Label>
          <Select value={toType} onValueChange={(v) => setToType(v as 'bank' | 'cash')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {fromType === 'bank' && (
        <div className="space-y-2">
          <Label>From Bank</Label>
          <Select value={fromBankId} onValueChange={setFromBankId}>
            <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
            <SelectContent>
              {data.bankAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.bankName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {toType === 'bank' && (
        <div className="space-y-2">
          <Label>To Bank</Label>
          <Select value={toBankId} onValueChange={setToBankId}>
            <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
            <SelectContent>
              {data.bankAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.bankName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Amount</Label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1">Transfer</Button>
      </div>
    </form>
  );
};
