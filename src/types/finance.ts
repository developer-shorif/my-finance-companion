export type IncomeSource = 'Client' | 'Salary' | 'Business' | 'Other';
export type IncomeType = 'Freelance' | 'Salary' | 'Business' | 'Other';

export type ExpenseType = 
  | 'Personal-Self' 
  | 'Personal-Family' 
  | 'Personal-Spouse' 
  | 'Personal-Children' 
  | 'Parents' 
  | 'Office';

export type ExpenseCategory = 
  | 'Food' 
  | 'Rent' 
  | 'Transport' 
  | 'Utility' 
  | 'EMI' 
  | 'Medical' 
  | 'Entertainment'
  | 'Shopping'
  | 'Other';

export type PaymentMethod = 'Cash' | 'Bkash' | 'Bank' | 'Card';

export type SavingsType = 'Auto' | 'Manual';
export type SavingsAccount = 'Cash' | 'Bank' | 'Mobile Wallet';

export type LoanDirection = 'Given' | 'Taken';
export type LoanStatus = 'Open' | 'Partial' | 'Closed';

export interface Income {
  id: string;
  date: string;
  month: string; // mmm-yyyy
  source: IncomeSource;
  type: IncomeType;
  grossIncome: number;
  autoSavings: number; // 20% of gross
  usableIncome: number; // gross - autoSavings
  note: string;
}

export interface Expense {
  id: string;
  date: string;
  month: string;
  expenseType: ExpenseType;
  category: ExpenseCategory;
  subCategory: string;
  amount: number;
  paidBy: PaymentMethod;
  note: string;
}

export interface Budget {
  id: string;
  month: string;
  expenseType: ExpenseType;
  budgetAmount: number;
}

export interface BudgetWithActual extends Budget {
  actualExpense: number;
  difference: number;
  status: 'Over Budget' | 'Under Budget' | 'On Budget';
}

export interface SavingsEntry {
  id: string;
  date: string;
  savingsType: SavingsType;
  account: SavingsAccount;
  inAmount: number;
  outAmount: number;
  purpose: string;
  linkedIncomeId?: string;
}

export interface Loan {
  id: string;
  date: string;
  personName: string;
  loanType: ExpenseType;
  direction: LoanDirection;
  amount: number;
  inAmount: number;
  outAmount: number;
  dueDate: string;
  status: LoanStatus;
  note: string;
}

export interface MonthSummary {
  month: string;
  totalGrossIncome: number;
  totalAutoSavings: number;
  totalUsableIncome: number;
  totalBudget: number;
  totalActualExpense: number;
  savingsOrDeficit: number;
  totalLoanReceivable: number;
  totalLoanPayable: number;
  netWorth: number;
}

export interface FinanceData {
  incomes: Income[];
  expenses: Expense[];
  budgets: Budget[];
  savings: SavingsEntry[];
  loans: Loan[];
}
