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

export type AccountType = 'Savings' | 'Current' | 'Salary' | 'Fixed Deposit';
export type WalletAccountType = 'Bank' | 'Mobile Wallet' | 'Cash';

export interface AppBranding {
  appName: string;
  appIcon?: string; // base64 or URL
  appLogo?: string; // base64 or URL
}

export interface Income {
  id: string;
  date: string;
  month: string; // mmm-yyyy
  source: string; // Now supports custom sources
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
  category: string; // Now supports custom categories
  subCategory: string;
  amount: number;
  paidBy: PaymentMethod;
  note: string;
  responsibility?: string; // Person responsible
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

export interface BankAccount {
  id: string;
  bankName: string;
  accountType: AccountType;
  walletType: WalletAccountType; // Bank, Mobile Wallet, Cash
  openingBalance: number;
  currentBalance: number;
  createdAt: string;
  isAutoSavingsAccount?: boolean;
}

export interface Transfer {
  id: string;
  date: string;
  fromType: 'bank' | 'cash';
  toType: 'bank' | 'cash';
  fromBankId?: string; // If from bank
  toBankId?: string; // If to bank
  amount: number;
  note: string;
}

export interface CustomSettings {
  customExpenseCategories: string[];
  customIncomeSources: string[];
  appBranding: AppBranding;
  autoSavingsAccountId?: string; // ID of the account for auto savings
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
  totalBankBalance: number;
  totalCashBalance: number;
}

export interface FinanceData {
  incomes: Income[];
  expenses: Expense[];
  budgets: Budget[];
  savings: SavingsEntry[];
  loans: Loan[];
  bankAccounts: BankAccount[];
  transfers: Transfer[];
  cashBalance: number;
  customSettings: CustomSettings;
}
