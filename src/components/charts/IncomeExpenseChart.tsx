import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinance } from '@/contexts/FinanceContext';
import { getYearlySummary } from '@/lib/financeUtils';

export const IncomeExpenseChart: React.FC = () => {
  const { data } = useFinance();
  const currentYear = new Date().getFullYear();
  
  const chartData = getYearlySummary(data.incomes, data.expenses, currentYear);

  return (
    <div className="stat-card h-[300px]">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Income vs Expense ({currentYear})</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 47% 16%)" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
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
          <Bar dataKey="income" name="Income" fill="hsl(166 76% 48%)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
