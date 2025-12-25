import { format, parse } from 'date-fns';
import type { 
  Income, 
  Expense, 
  Budget, 
  BudgetWithActual, 
  SavingsEntry, 
  Loan, 
  MonthSummary,
  ExpenseType 
} from '@/types/finance';

export const formatMonth = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM-yyyy');
};

export const parseMonthString = (monthStr: string): Date => {
  return parse(monthStr, 'MMM-yyyy', new Date());
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateAutoSavings = (grossIncome: number): number => {
  return Math.round(grossIncome * 0.2);
};

export const calculateUsableIncome = (grossIncome: number, autoSavings: number): number => {
  return grossIncome - autoSavings;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getMonthlyIncomes = (incomes: Income[], month: string): Income[] => {
  return incomes.filter(i => i.month === month);
};

export const getMonthlyExpenses = (expenses: Expense[], month: string): Expense[] => {
  return expenses.filter(e => e.month === month);
};

export const getMonthlyBudgets = (budgets: Budget[], month: string): Budget[] => {
  return budgets.filter(b => b.month === month);
};

export const calculateActualExpense = (
  expenses: Expense[], 
  month: string, 
  expenseType: ExpenseType
): number => {
  return expenses
    .filter(e => e.month === month && e.expenseType === expenseType)
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getBudgetsWithActual = (
  budgets: Budget[], 
  expenses: Expense[], 
  month: string
): BudgetWithActual[] => {
  const monthlyBudgets = getMonthlyBudgets(budgets, month);
  
  return monthlyBudgets.map(budget => {
    const actualExpense = calculateActualExpense(expenses, month, budget.expenseType);
    const difference = budget.budgetAmount - actualExpense;
    const status = difference > 0 ? 'Under Budget' : difference < 0 ? 'Over Budget' : 'On Budget';
    
    return {
      ...budget,
      actualExpense,
      difference,
      status,
    };
  });
};

export const calculateSavingsBalance = (savings: SavingsEntry[]): number => {
  return savings.reduce((balance, entry) => balance + entry.inAmount - entry.outAmount, 0);
};

export const calculatePersonLoanBalance = (loans: Loan[], personName: string): number => {
  return loans
    .filter(l => l.personName === personName)
    .reduce((balance, loan) => {
      if (loan.direction === 'Given') {
        return balance + loan.outAmount - loan.inAmount;
      } else {
        return balance - loan.outAmount + loan.inAmount;
      }
    }, 0);
};

export const getTotalLoanReceivable = (loans: Loan[]): number => {
  return loans
    .filter(l => l.direction === 'Given' && l.status !== 'Closed')
    .reduce((sum, l) => sum + (l.amount - l.inAmount), 0);
};

export const getTotalLoanPayable = (loans: Loan[]): number => {
  return loans
    .filter(l => l.direction === 'Taken' && l.status !== 'Closed')
    .reduce((sum, l) => sum + (l.amount - l.outAmount), 0);
};

export const getMonthSummary = (
  incomes: Income[],
  expenses: Expense[],
  budgets: Budget[],
  savings: SavingsEntry[],
  loans: Loan[],
  month: string
): MonthSummary => {
  const monthlyIncomes = getMonthlyIncomes(incomes, month);
  const monthlyExpenses = getMonthlyExpenses(expenses, month);
  const monthlyBudgets = getMonthlyBudgets(budgets, month);

  const totalGrossIncome = monthlyIncomes.reduce((sum, i) => sum + i.grossIncome, 0);
  const totalAutoSavings = monthlyIncomes.reduce((sum, i) => sum + i.autoSavings, 0);
  const totalUsableIncome = monthlyIncomes.reduce((sum, i) => sum + i.usableIncome, 0);
  const totalBudget = monthlyBudgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalActualExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsOrDeficit = totalUsableIncome - totalActualExpense;

  const totalLoanReceivable = getTotalLoanReceivable(loans);
  const totalLoanPayable = getTotalLoanPayable(loans);
  const savingsBalance = calculateSavingsBalance(savings);
  const netWorth = savingsBalance + totalLoanReceivable - totalLoanPayable;

  return {
    month,
    totalGrossIncome,
    totalAutoSavings,
    totalUsableIncome,
    totalBudget,
    totalActualExpense,
    savingsOrDeficit,
    totalLoanReceivable,
    totalLoanPayable,
    netWorth,
  };
};

export const getAvailableMonths = (
  incomes: Income[],
  expenses: Expense[]
): string[] => {
  const months = new Set<string>();
  incomes.forEach(i => months.add(i.month));
  expenses.forEach(e => months.add(e.month));
  
  return Array.from(months).sort((a, b) => {
    const dateA = parseMonthString(a);
    const dateB = parseMonthString(b);
    return dateB.getTime() - dateA.getTime();
  });
};

export const getYearlySummary = (
  incomes: Income[],
  expenses: Expense[],
  year: number
): { month: string; income: number; expense: number }[] => {
  const months = [];
  for (let m = 0; m < 12; m++) {
    const date = new Date(year, m, 1);
    const monthStr = formatMonth(date);
    const monthlyIncomes = getMonthlyIncomes(incomes, monthStr);
    const monthlyExpenses = getMonthlyExpenses(expenses, monthStr);
    
    months.push({
      month: format(date, 'MMM'),
      income: monthlyIncomes.reduce((sum, i) => sum + i.usableIncome, 0),
      expense: monthlyExpenses.reduce((sum, e) => sum + e.amount, 0),
    });
  }
  return months;
};
