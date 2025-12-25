import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  FinanceData, 
  Income, 
  Expense, 
  Budget, 
  SavingsEntry, 
  Loan 
} from '@/types/finance';
import { generateId, formatMonth, calculateAutoSavings, calculateUsableIncome } from '@/lib/financeUtils';

interface FinanceContextType {
  data: FinanceData;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  addIncome: (income: Omit<Income, 'id' | 'month' | 'autoSavings' | 'usableIncome'>) => void;
  updateIncome: (id: string, income: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'month'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addSavings: (savings: Omit<SavingsEntry, 'id'>) => void;
  updateSavings: (id: string, savings: Partial<SavingsEntry>) => void;
  deleteSavings: (id: string) => void;
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const STORAGE_KEY = 'finance_data';

const getInitialData = (): FinanceData => {
  if (typeof window === 'undefined') {
    return { incomes: [], expenses: [], budgets: [], savings: [], loans: [] };
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { incomes: [], expenses: [], budgets: [], savings: [], loans: [] };
    }
  }
  return { incomes: [], expenses: [], budgets: [], savings: [], loans: [] };
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<FinanceData>(getInitialData);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => formatMonth(new Date()));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Auto-create savings entry when income is added
  const createAutoSavingsEntry = useCallback((income: Income) => {
    const savingsEntry: SavingsEntry = {
      id: generateId(),
      date: income.date,
      savingsType: 'Auto',
      account: 'Bank',
      inAmount: income.autoSavings,
      outAmount: 0,
      purpose: `Auto savings from ${income.source} income`,
      linkedIncomeId: income.id,
    };
    return savingsEntry;
  }, []);

  const addIncome = useCallback((incomeData: Omit<Income, 'id' | 'month' | 'autoSavings' | 'usableIncome'>) => {
    const autoSavings = calculateAutoSavings(incomeData.grossIncome);
    const usableIncome = calculateUsableIncome(incomeData.grossIncome, autoSavings);
    
    const income: Income = {
      ...incomeData,
      id: generateId(),
      month: formatMonth(incomeData.date),
      autoSavings,
      usableIncome,
    };

    const savingsEntry = createAutoSavingsEntry(income);

    setData(prev => ({
      ...prev,
      incomes: [...prev.incomes, income],
      savings: [...prev.savings, savingsEntry],
    }));
  }, [createAutoSavingsEntry]);

  const updateIncome = useCallback((id: string, updates: Partial<Income>) => {
    setData(prev => {
      const incomes = prev.incomes.map(income => {
        if (income.id !== id) return income;
        
        const updated = { ...income, ...updates };
        if (updates.grossIncome !== undefined) {
          updated.autoSavings = calculateAutoSavings(updates.grossIncome);
          updated.usableIncome = calculateUsableIncome(updates.grossIncome, updated.autoSavings);
        }
        if (updates.date !== undefined) {
          updated.month = formatMonth(updates.date);
        }
        return updated;
      });

      // Update linked savings entry
      const updatedIncome = incomes.find(i => i.id === id);
      const savings = prev.savings.map(s => {
        if (s.linkedIncomeId === id && updatedIncome) {
          return { ...s, inAmount: updatedIncome.autoSavings, date: updatedIncome.date };
        }
        return s;
      });

      return { ...prev, incomes, savings };
    });
  }, []);

  const deleteIncome = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      incomes: prev.incomes.filter(i => i.id !== id),
      savings: prev.savings.filter(s => s.linkedIncomeId !== id),
    }));
  }, []);

  const addExpense = useCallback((expenseData: Omit<Expense, 'id' | 'month'>) => {
    const expense: Expense = {
      ...expenseData,
      id: generateId(),
      month: formatMonth(expenseData.date),
    };
    setData(prev => ({ ...prev, expenses: [...prev.expenses, expense] }));
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => {
        if (e.id !== id) return e;
        const updated = { ...e, ...updates };
        if (updates.date !== undefined) {
          updated.month = formatMonth(updates.date);
        }
        return updated;
      }),
    }));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  }, []);

  const addBudget = useCallback((budgetData: Omit<Budget, 'id'>) => {
    const budget: Budget = { ...budgetData, id: generateId() };
    setData(prev => ({ ...prev, budgets: [...prev.budgets, budget] }));
  }, []);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setData(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
  }, []);

  const addSavings = useCallback((savingsData: Omit<SavingsEntry, 'id'>) => {
    const savings: SavingsEntry = { ...savingsData, id: generateId() };
    setData(prev => ({ ...prev, savings: [...prev.savings, savings] }));
  }, []);

  const updateSavings = useCallback((id: string, updates: Partial<SavingsEntry>) => {
    setData(prev => ({
      ...prev,
      savings: prev.savings.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const deleteSavings = useCallback((id: string) => {
    setData(prev => ({ ...prev, savings: prev.savings.filter(s => s.id !== id) }));
  }, []);

  const addLoan = useCallback((loanData: Omit<Loan, 'id'>) => {
    const loan: Loan = { ...loanData, id: generateId() };
    setData(prev => ({ ...prev, loans: [...prev.loans, loan] }));
  }, []);

  const updateLoan = useCallback((id: string, updates: Partial<Loan>) => {
    setData(prev => ({
      ...prev,
      loans: prev.loans.map(l => l.id === id ? { ...l, ...updates } : l),
    }));
  }, []);

  const deleteLoan = useCallback((id: string) => {
    setData(prev => ({ ...prev, loans: prev.loans.filter(l => l.id !== id) }));
  }, []);

  return (
    <FinanceContext.Provider value={{
      data,
      selectedMonth,
      setSelectedMonth,
      addIncome,
      updateIncome,
      deleteIncome,
      addExpense,
      updateExpense,
      deleteExpense,
      addBudget,
      updateBudget,
      deleteBudget,
      addSavings,
      updateSavings,
      deleteSavings,
      addLoan,
      updateLoan,
      deleteLoan,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
