import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { parseMonthString, formatMonth } from '@/lib/financeUtils';
import { useFinance } from '@/contexts/FinanceContext';

export const MonthSelector: React.FC = () => {
  const { selectedMonth, setSelectedMonth } = useFinance();

  const currentDate = parseMonthString(selectedMonth);

  const goToPreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setSelectedMonth(formatMonth(newDate));
  };

  const goToNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setSelectedMonth(formatMonth(newDate));
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(formatMonth(new Date()));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goToPreviousMonth}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-muted"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      <button
        onClick={goToCurrentMonth}
        className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 transition-colors hover:bg-muted"
      >
        <Calendar className="h-4 w-4 text-primary" />
        <span className="font-medium">{format(currentDate, 'MMMM yyyy')}</span>
      </button>
      
      <button
        onClick={goToNextMonth}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-muted"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
