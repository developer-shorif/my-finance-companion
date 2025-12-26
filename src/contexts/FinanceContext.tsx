import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  FinanceData, 
  Income, 
  Expense, 
  Budget, 
  SavingsEntry, 
  Loan,
  BankAccount,
  Transfer,
  CustomSettings
} from '@/types/finance';
import { generateId, formatMonth, calculateAutoSavings, calculateUsableIncome } from '@/lib/financeUtils';

import type { AppBranding } from '@/types/finance';

interface FinanceContextType {
  data: FinanceData;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  // Income
  addIncome: (income: Omit<Income, 'id' | 'month' | 'autoSavings' | 'usableIncome'>) => void;
  updateIncome: (id: string, income: Partial<Income>) => void;
  deleteIncome: (id: string) => void;
  // Expense
  addExpense: (expense: Omit<Expense, 'id' | 'month'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  // Budget
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  // Savings
  addSavings: (savings: Omit<SavingsEntry, 'id'>) => void;
  updateSavings: (id: string, savings: Partial<SavingsEntry>) => void;
  deleteSavings: (id: string) => void;
  // Loans
  addLoan: (loan: Omit<Loan, 'id'>) => void;
  updateLoan: (id: string, loan: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;
  // Bank Accounts
  addBankAccount: (account: Omit<BankAccount, 'id' | 'currentBalance' | 'createdAt'>) => void;
  updateBankAccount: (id: string, account: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;
  // Transfers
  addTransfer: (transfer: Omit<Transfer, 'id'>) => void;
  // Cash
  setCashBalance: (balance: number) => void;
  adjustCashBalance: (amount: number) => void;
  // Custom Settings
  addCustomExpenseCategory: (category: string) => void;
  removeCustomExpenseCategory: (category: string) => void;
  addCustomIncomeSource: (source: string) => void;
  removeCustomIncomeSource: (source: string) => void;
  // Branding
  updateAppBranding: (branding: Partial<AppBranding>) => void;
  setAutoSavingsAccount: (accountId: string | undefined) => void;
  // Helpers
  getTotalBankBalance: () => number;
  getAllExpenseCategories: () => string[];
  getAllIncomeSources: () => string[];
  getAutoSavingsAccount: () => BankAccount | undefined;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const STORAGE_KEY = 'finance_data';

const defaultCustomSettings: CustomSettings = {
  customExpenseCategories: [],
  customIncomeSources: [],
  appBranding: {
    appName: 'FinanceFlow',
  },
  autoSavingsAccountId: undefined,
};

const getInitialData = (): FinanceData => {
  if (typeof window === 'undefined') {
    return { 
      incomes: [], 
      expenses: [], 
      budgets: [], 
      savings: [], 
      loans: [],
      bankAccounts: [],
      transfers: [],
      cashBalance: 0,
      customSettings: defaultCustomSettings,
    };
  }
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure new fields exist for backwards compatibility
      return {
        incomes: parsed.incomes || [],
        expenses: parsed.expenses || [],
        budgets: parsed.budgets || [],
        savings: parsed.savings || [],
        loans: parsed.loans || [],
        bankAccounts: parsed.bankAccounts || [],
        transfers: parsed.transfers || [],
        cashBalance: parsed.cashBalance || 0,
        customSettings: parsed.customSettings || defaultCustomSettings,
      };
    } catch {
      return { 
        incomes: [], 
        expenses: [], 
        budgets: [], 
        savings: [], 
        loans: [],
        bankAccounts: [],
        transfers: [],
        cashBalance: 0,
        customSettings: defaultCustomSettings,
      };
    }
  }
  return { 
    incomes: [], 
    expenses: [], 
    budgets: [], 
    savings: [], 
    loans: [],
    bankAccounts: [],
    transfers: [],
    cashBalance: 0,
    customSettings: defaultCustomSettings,
  };
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<FinanceData>(getInitialData);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => formatMonth(new Date()));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Auto-create savings entry when income is added
  const createAutoSavingsEntry = useCallback((income: Income, autoSavingsAccountId?: string) => {
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
    return { savingsEntry, autoSavingsAccountId };
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

    const { savingsEntry } = createAutoSavingsEntry(income);
    const autoSavingsAccountId = data.customSettings.autoSavingsAccountId;

    setData(prev => {
      let bankAccounts = prev.bankAccounts;
      
      // If auto savings account is set, add the auto savings amount to that account
      if (autoSavingsAccountId) {
        bankAccounts = prev.bankAccounts.map(acc => 
          acc.id === autoSavingsAccountId 
            ? { ...acc, currentBalance: acc.currentBalance + autoSavings }
            : acc
        );
      }

      return {
        ...prev,
        incomes: [...prev.incomes, income],
        savings: [...prev.savings, savingsEntry],
        bankAccounts,
      };
    });
  }, [createAutoSavingsEntry, data.customSettings.autoSavingsAccountId]);
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

  // Bank Account methods
  const addBankAccount = useCallback((accountData: Omit<BankAccount, 'id' | 'currentBalance' | 'createdAt'>) => {
    const account: BankAccount = {
      ...accountData,
      id: generateId(),
      currentBalance: accountData.openingBalance,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, bankAccounts: [...prev.bankAccounts, account] }));
  }, []);

  const updateBankAccount = useCallback((id: string, updates: Partial<BankAccount>) => {
    setData(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map(a => a.id === id ? { ...a, ...updates } : a),
    }));
  }, []);

  const deleteBankAccount = useCallback((id: string) => {
    setData(prev => ({ ...prev, bankAccounts: prev.bankAccounts.filter(a => a.id !== id) }));
  }, []);

  // Transfer method - updates balances automatically
  const addTransfer = useCallback((transferData: Omit<Transfer, 'id'>) => {
    const transfer: Transfer = { ...transferData, id: generateId() };
    
    setData(prev => {
      let cashBalance = prev.cashBalance;
      const bankAccounts = [...prev.bankAccounts];

      // From source
      if (transferData.fromType === 'cash') {
        cashBalance -= transferData.amount;
      } else if (transferData.fromBankId) {
        const fromIdx = bankAccounts.findIndex(a => a.id === transferData.fromBankId);
        if (fromIdx !== -1) {
          bankAccounts[fromIdx] = {
            ...bankAccounts[fromIdx],
            currentBalance: bankAccounts[fromIdx].currentBalance - transferData.amount,
          };
        }
      }

      // To destination
      if (transferData.toType === 'cash') {
        cashBalance += transferData.amount;
      } else if (transferData.toBankId) {
        const toIdx = bankAccounts.findIndex(a => a.id === transferData.toBankId);
        if (toIdx !== -1) {
          bankAccounts[toIdx] = {
            ...bankAccounts[toIdx],
            currentBalance: bankAccounts[toIdx].currentBalance + transferData.amount,
          };
        }
      }

      return {
        ...prev,
        transfers: [...prev.transfers, transfer],
        bankAccounts,
        cashBalance,
      };
    });
  }, []);

  const setCashBalance = useCallback((balance: number) => {
    setData(prev => ({ ...prev, cashBalance: balance }));
  }, []);

  const adjustCashBalance = useCallback((amount: number) => {
    setData(prev => ({ ...prev, cashBalance: prev.cashBalance + amount }));
  }, []);

  // Custom settings methods
  const addCustomExpenseCategory = useCallback((category: string) => {
    setData(prev => ({
      ...prev,
      customSettings: {
        ...prev.customSettings,
        customExpenseCategories: [...prev.customSettings.customExpenseCategories, category],
      },
    }));
  }, []);

  const removeCustomExpenseCategory = useCallback((category: string) => {
    setData(prev => ({
      ...prev,
      customSettings: {
        ...prev.customSettings,
        customExpenseCategories: prev.customSettings.customExpenseCategories.filter(c => c !== category),
      },
    }));
  }, []);

  const addCustomIncomeSource = useCallback((source: string) => {
    setData(prev => ({
      ...prev,
      customSettings: {
        ...prev.customSettings,
        customIncomeSources: [...prev.customSettings.customIncomeSources, source],
      },
    }));
  }, []);

  const removeCustomIncomeSource = useCallback((source: string) => {
    setData(prev => ({
      ...prev,
      customSettings: {
        ...prev.customSettings,
        customIncomeSources: prev.customSettings.customIncomeSources.filter(s => s !== source),
      },
    }));
  }, []);

  const updateAppBranding = useCallback((branding: Partial<AppBranding>) => {
    setData(prev => ({
      ...prev,
      customSettings: {
        ...prev.customSettings,
        appBranding: { ...prev.customSettings.appBranding, ...branding },
      },
    }));
  }, []);

  const setAutoSavingsAccount = useCallback((accountId: string | undefined) => {
    setData(prev => ({
      ...prev,
      customSettings: {
        ...prev.customSettings,
        autoSavingsAccountId: accountId,
      },
    }));
  }, []);

  const getTotalBankBalance = useCallback(() => {
    return data.bankAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
  }, [data.bankAccounts]);

  const getAllExpenseCategories = useCallback(() => {
    const defaults = ['Food', 'Rent', 'Transport', 'Utility', 'EMI', 'Medical', 'Entertainment', 'Shopping', 'Other'];
    return [...defaults, ...data.customSettings.customExpenseCategories];
  }, [data.customSettings.customExpenseCategories]);

  const getAllIncomeSources = useCallback(() => {
    const defaults = ['Client', 'Salary', 'Business', 'Other'];
    return [...defaults, ...data.customSettings.customIncomeSources];
  }, [data.customSettings.customIncomeSources]);

  const getAutoSavingsAccount = useCallback(() => {
    return data.bankAccounts.find(acc => acc.id === data.customSettings.autoSavingsAccountId);
  }, [data.bankAccounts, data.customSettings.autoSavingsAccountId]);

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
      addBankAccount,
      updateBankAccount,
      deleteBankAccount,
      addTransfer,
      setCashBalance,
      adjustCashBalance,
      addCustomExpenseCategory,
      removeCustomExpenseCategory,
      addCustomIncomeSource,
      removeCustomIncomeSource,
      updateAppBranding,
      setAutoSavingsAccount,
      getTotalBankBalance,
      getAllExpenseCategories,
      getAllIncomeSources,
      getAutoSavingsAccount,
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
