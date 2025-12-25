import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { StatCard } from '@/components/ui/StatCard';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { BudgetComparisonChart } from '@/components/charts/BudgetComparisonChart';
import { 
  getMonthSummary, 
  getBudgetsWithActual, 
  formatCurrency,
  calculateSavingsBalance 
} from '@/lib/financeUtils';

const Dashboard: React.FC = () => {
  const { data, selectedMonth } = useFinance();
  
  const summary = getMonthSummary(
    data.incomes,
    data.expenses,
    data.budgets,
    data.savings,
    data.loans,
    selectedMonth
  );

  const budgetsWithActual = getBudgetsWithActual(data.budgets, data.expenses, selectedMonth);
  const overBudgetItems = budgetsWithActual.filter(b => b.status === 'Over Budget');
  const savingsBalance = calculateSavingsBalance(data.savings);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your finances</p>
          </div>
          <MonthSelector />
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gross Income"
            value={summary.totalGrossIncome}
            icon={TrendingUp}
            variant="primary"
          />
          <StatCard
            title="Auto Savings (20%)"
            value={summary.totalAutoSavings}
            icon={PiggyBank}
            variant="success"
          />
          <StatCard
            title="Usable Income"
            value={summary.totalUsableIncome}
            icon={Wallet}
            variant="default"
          />
          <StatCard
            title="Total Expenses"
            value={summary.totalActualExpense}
            icon={TrendingDown}
            variant="destructive"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={summary.savingsOrDeficit >= 0 ? 'Monthly Surplus' : 'Monthly Deficit'}
            value={Math.abs(summary.savingsOrDeficit)}
            icon={summary.savingsOrDeficit >= 0 ? ArrowUpRight : ArrowDownRight}
            variant={summary.savingsOrDeficit >= 0 ? 'success' : 'destructive'}
          />
          <StatCard
            title="Total Budget"
            value={summary.totalBudget}
            icon={Target}
            variant="default"
          />
          <StatCard
            title="Loan Receivable"
            value={summary.totalLoanReceivable}
            icon={ArrowUpRight}
            variant="success"
            subtitle="Money to receive"
          />
          <StatCard
            title="Loan Payable"
            value={summary.totalLoanPayable}
            icon={ArrowDownRight}
            variant="warning"
            subtitle="Money to pay"
          />
        </div>

        {/* Net Worth Card */}
        <div className="stat-card gradient-card border-primary/20 glow-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Worth</p>
              <p className="text-3xl font-bold text-primary mt-1">৳{formatCurrency(summary.netWorth)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Savings (৳{formatCurrency(savingsBalance)}) + Receivable - Payable
              </p>
            </div>
            <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeExpenseChart />
          <BudgetComparisonChart />
        </div>

        {/* Alerts */}
        {overBudgetItems.length > 0 && (
          <div className="stat-card border-warning/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Over Budget Alerts</h3>
                <div className="mt-2 space-y-1">
                  {overBudgetItems.map(item => (
                    <p key={item.id} className="text-sm text-muted-foreground">
                      <span className="text-warning font-medium">{item.expenseType}</span>: 
                      Over by ৳{formatCurrency(Math.abs(item.difference))}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
