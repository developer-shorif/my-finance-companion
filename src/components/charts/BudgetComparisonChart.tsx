import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { useFinance } from '@/contexts/FinanceContext';
import { getBudgetsWithActual } from '@/lib/financeUtils';

export const BudgetComparisonChart: React.FC = () => {
  const { data, selectedMonth } = useFinance();
  
  const budgetsWithActual = getBudgetsWithActual(data.budgets, data.expenses, selectedMonth);

  const chartData = budgetsWithActual.map(b => ({
    name: b.expenseType.replace('Personal-', ''),
    budget: b.budgetAmount,
    actual: b.actualExpense,
    isOver: b.status === 'Over Budget',
  }));

  if (chartData.length === 0) {
    return (
      <div className="stat-card h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No budget data for this month</p>
      </div>
    );
  }

  return (
    <div className="stat-card h-[300px]">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Budget vs Actual</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 16%)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }}
            axisLine={{ stroke: 'hsl(222 47% 16%)' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(222 47% 16%)' }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(222 47% 10%)',
              border: '1px solid hsl(222 47% 16%)',
              borderRadius: '8px',
              color: 'hsl(210 40% 98%)',
            }}
            formatter={(value: number) => [`৳${value.toLocaleString()}`, '']}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: 'hsl(215 20% 55%)' }}>{value}</span>}
          />
          <Bar dataKey="budget" name="Budget" fill="hsl(262 83% 58%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isOver ? 'hsl(0 72% 51%)' : 'hsl(142 76% 36%)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
