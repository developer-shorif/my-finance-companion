import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Users,
  Calendar,
  Filter,
  Building2,
  HandCoins,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Target
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useFinance } from '@/contexts/FinanceContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  formatCurrency, 
  calculateSavingsBalance,
} from '@/lib/financeUtils';

type ReportCategory = 'all' | 'income' | 'expense' | 'budget' | 'savings' | 'loans' | 'cashflow' | 'networth';

const ReportsPage: React.FC = () => {
  const { data, selectedMonth, getAllExpenseCategories } = useFinance();
  const [category, setCategory] = useState<ReportCategory>('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterPerson, setFilterPerson] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');

  // Get unique years from data
  const years = useMemo(() => {
    const allDates = [
      ...data.incomes.map(i => i.date),
      ...data.expenses.map(e => e.date),
    ];
    const uniqueYears = [...new Set(allDates.map(d => new Date(d).getFullYear()))];
    if (uniqueYears.length === 0) uniqueYears.push(new Date().getFullYear());
    return uniqueYears.sort((a, b) => b - a);
  }, [data.incomes, data.expenses]);

  // Get unique persons
  const persons = useMemo(() => {
    const allPersons = data.expenses
      .filter(e => e.responsibility)
      .map(e => e.responsibility!);
    return ['all', ...new Set(allPersons)];
  }, [data.expenses]);

  // Calculate report data
  const reportData = useMemo(() => {
    const yearIncomes = data.incomes.filter(i => new Date(i.date).getFullYear().toString() === filterYear);
    const yearExpenses = data.expenses.filter(e => {
      const matchYear = new Date(e.date).getFullYear().toString() === filterYear;
      const matchPerson = filterPerson === 'all' || e.responsibility === filterPerson;
      return matchYear && matchPerson;
    });

    const totalGrossIncome = yearIncomes.reduce((sum, i) => sum + i.grossIncome, 0);
    const totalAutoSavings = yearIncomes.reduce((sum, i) => sum + i.autoSavings, 0);
    const totalUsableIncome = yearIncomes.reduce((sum, i) => sum + i.usableIncome, 0);
    const totalExpenses = yearExpenses.reduce((sum, e) => sum + e.amount, 0);

    // By source
    const incomeBySource = yearIncomes.reduce((acc, i) => {
      acc[i.source] = (acc[i.source] || 0) + i.grossIncome;
      return acc;
    }, {} as Record<string, number>);

    // By category
    const expenseByCategory = yearExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    // By expense type
    const expenseByType = yearExpenses.reduce((acc, e) => {
      acc[e.expenseType] = (acc[e.expenseType] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    // By person
    const expenseByPerson = yearExpenses.reduce((acc, e) => {
      const person = e.responsibility || 'Unassigned';
      acc[person] = (acc[person] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

    // Monthly breakdown
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    yearIncomes.forEach(i => {
      if (!monthlyData[i.month]) monthlyData[i.month] = { income: 0, expense: 0 };
      monthlyData[i.month].income += i.grossIncome;
    });
    yearExpenses.forEach(e => {
      if (!monthlyData[e.month]) monthlyData[e.month] = { income: 0, expense: 0 };
      monthlyData[e.month].expense += e.amount;
    });

    // Savings
    const savingsBalance = calculateSavingsBalance(data.savings);
    const autoSavingsTotal = data.savings.filter(s => s.savingsType === 'Auto').reduce((sum, s) => sum + s.inAmount - s.outAmount, 0);
    const manualSavingsTotal = data.savings.filter(s => s.savingsType === 'Manual').reduce((sum, s) => sum + s.inAmount - s.outAmount, 0);

    // Loans
    const loanReceivable = data.loans.filter(l => l.direction === 'Given').reduce((sum, l) => sum + (l.amount - l.inAmount), 0);
    const loanPayable = data.loans.filter(l => l.direction === 'Taken').reduce((sum, l) => sum + (l.amount - l.outAmount), 0);

    // Net worth
    const totalBankBalance = data.bankAccounts.reduce((sum, a) => sum + a.currentBalance, 0);
    const netWorth = totalBankBalance + data.cashBalance + savingsBalance + loanReceivable - loanPayable;

    // Cash flow
    const cashInflow = totalGrossIncome;
    const cashOutflow = totalExpenses;
    const netCashFlow = cashInflow - cashOutflow;

    return {
      totalGrossIncome,
      totalAutoSavings,
      totalUsableIncome,
      totalExpenses,
      incomeBySource,
      expenseByCategory,
      expenseByType,
      expenseByPerson,
      monthlyData,
      savingsBalance,
      autoSavingsTotal,
      manualSavingsTotal,
      loanReceivable,
      loanPayable,
      totalBankBalance,
      netWorth,
      cashInflow,
      cashOutflow,
      netCashFlow,
    };
  }, [data, filterYear, filterPerson]);

  const renderReportCard = (title: string, value: number, icon: React.ElementType, variant: 'default' | 'success' | 'destructive' | 'warning' = 'default', subtitle?: string) => {
    const Icon = icon;
    const variantStyles = {
      default: 'bg-primary/10 text-primary',
      success: 'bg-success/10 text-success',
      destructive: 'bg-destructive/10 text-destructive',
      warning: 'bg-warning/10 text-warning',
    };

    return (
      <div className="stat-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-xl font-bold text-foreground mt-1">৳{formatCurrency(value)}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${variantStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    );
  };

  const renderBreakdownList = (title: string, data: Record<string, number>, total: number) => (
    <div className="stat-card">
      <h3 className="font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm text-foreground truncate">{key}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">৳{formatCurrency(value)}</span>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {total > 0 ? ((value / total) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        ))}
        {Object.keys(data).length === 0 && (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </div>
    </div>
  );

  const reportCategories: { id: ReportCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all', label: 'All Reports', icon: BarChart3 },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expense', label: 'Expenses', icon: TrendingDown },
    { id: 'budget', label: 'Budget', icon: Target },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'loans', label: 'Loans', icon: HandCoins },
    { id: 'cashflow', label: 'Cash Flow', icon: ArrowUpRight },
    { id: 'networth', label: 'Net Worth', icon: Wallet },
  ];

  return (
    <MainLayout>
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Detailed financial insights</p>
        </div>

        {/* Filters */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Filters</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Year</label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Person</label>
              <Select value={filterPerson} onValueChange={setFilterPerson}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {persons.map(p => <SelectItem key={p} value={p}>{p === 'all' ? 'All Persons' : p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as ReportCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {reportCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Account</label>
              <Select value={filterAccount} onValueChange={setFilterAccount}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {data.bankAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.bankName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {reportCategories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                category === c.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              <c.icon className="h-4 w-4" />
              {c.label}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        {(category === 'all' || category === 'income' || category === 'cashflow') && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {renderReportCard('Gross Income', reportData.totalGrossIncome, TrendingUp, 'success', filterYear)}
            {renderReportCard('Auto Savings', reportData.totalAutoSavings, PiggyBank, 'default', '20% of income')}
            {renderReportCard('Usable Income', reportData.totalUsableIncome, Wallet, 'default', 'After savings')}
            {renderReportCard('Total Expenses', reportData.totalExpenses, TrendingDown, 'destructive', filterYear)}
          </div>
        )}

        {/* Income Reports */}
        {(category === 'all' || category === 'income') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderBreakdownList('Income by Source', reportData.incomeBySource, reportData.totalGrossIncome)}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-4">Income Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Gross Income</span>
                  <span className="font-medium">৳{formatCurrency(reportData.totalGrossIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Auto Savings</span>
                  <span className="font-medium text-success">৳{formatCurrency(reportData.totalAutoSavings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Usable Income</span>
                  <span className="font-medium">৳{formatCurrency(reportData.totalUsableIncome)}</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-foreground">Average Monthly Income</span>
                    <span className="font-bold text-primary">৳{formatCurrency(reportData.totalGrossIncome / 12)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expense Reports */}
        {(category === 'all' || category === 'expense') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderBreakdownList('Expenses by Category', reportData.expenseByCategory, reportData.totalExpenses)}
            {renderBreakdownList('Expenses by Type', reportData.expenseByType, reportData.totalExpenses)}
            {renderBreakdownList('Expenses by Person', reportData.expenseByPerson, reportData.totalExpenses)}
            <div className="stat-card">
              <h3 className="font-semibold text-foreground mb-4">Expense Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Expenses</span>
                  <span className="font-medium text-destructive">৳{formatCurrency(reportData.totalExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Monthly Expense</span>
                  <span className="font-medium">৳{formatCurrency(reportData.totalExpenses / 12)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Categories Used</span>
                  <span className="font-medium">{Object.keys(reportData.expenseByCategory).length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Savings Reports */}
        {(category === 'all' || category === 'savings') && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {renderReportCard('Total Savings', reportData.savingsBalance, PiggyBank, 'success')}
            {renderReportCard('Auto Savings', reportData.autoSavingsTotal, TrendingUp, 'default', 'From income')}
            {renderReportCard('Manual Savings', reportData.manualSavingsTotal, Wallet, 'default', 'Self deposited')}
            {renderReportCard('Bank Balance', reportData.totalBankBalance, Building2, 'default', 'All accounts')}
          </div>
        )}

        {/* Loan Reports */}
        {(category === 'all' || category === 'loans') && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {renderReportCard('Loan Receivable', reportData.loanReceivable, ArrowUpRight, 'success', 'Money to receive')}
            {renderReportCard('Loan Payable', reportData.loanPayable, ArrowDownRight, 'destructive', 'Money to pay')}
            {renderReportCard('Net Loan Position', reportData.loanReceivable - reportData.loanPayable, HandCoins, reportData.loanReceivable >= reportData.loanPayable ? 'success' : 'destructive')}
            {renderReportCard('Active Loans', data.loans.filter(l => l.status !== 'Closed').length, Users, 'default')}
          </div>
        )}

        {/* Cash Flow Reports */}
        {(category === 'all' || category === 'cashflow') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderReportCard('Cash Inflow', reportData.cashInflow, ArrowUpRight, 'success', filterYear)}
            {renderReportCard('Cash Outflow', reportData.cashOutflow, ArrowDownRight, 'destructive', filterYear)}
            {renderReportCard('Net Cash Flow', reportData.netCashFlow, Wallet, reportData.netCashFlow >= 0 ? 'success' : 'destructive', filterYear)}
          </div>
        )}

        {/* Net Worth */}
        {(category === 'all' || category === 'networth') && (
          <div className="stat-card gradient-card border-primary/20">
            <h3 className="font-semibold text-foreground mb-4">Net Worth Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bank Accounts</span>
                <span className="font-medium">৳{formatCurrency(reportData.totalBankBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Cash Balance</span>
                <span className="font-medium">৳{formatCurrency(data.cashBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Savings Balance</span>
                <span className="font-medium text-success">৳{formatCurrency(reportData.savingsBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Loans Receivable</span>
                <span className="font-medium text-success">+৳{formatCurrency(reportData.loanReceivable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Loans Payable</span>
                <span className="font-medium text-destructive">-৳{formatCurrency(reportData.loanPayable)}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total Net Worth</span>
                  <span className="text-2xl font-bold text-primary">৳{formatCurrency(reportData.netWorth)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Trend */}
        {(category === 'all' || category === 'cashflow') && Object.keys(reportData.monthlyData).length > 0 && (
          <div className="stat-card">
            <h3 className="font-semibold text-foreground mb-4">Monthly Trend ({filterYear})</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {Object.entries(reportData.monthlyData).sort().map(([month, data]) => (
                <div key={month} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm font-medium text-foreground">{month}</span>
                  <div className="flex gap-4">
                    <span className="text-sm text-success">+৳{formatCurrency(data.income)}</span>
                    <span className="text-sm text-destructive">-৳{formatCurrency(data.expense)}</span>
                    <span className={`text-sm font-medium ${data.income - data.expense >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ৳{formatCurrency(data.income - data.expense)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
