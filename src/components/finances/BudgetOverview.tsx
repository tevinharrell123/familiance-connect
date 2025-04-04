
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const monthlyData = {
  income: 5200,
  expenses: 3800,
  remaining: 1400,
  categories: [
    { name: 'Housing', value: 1500, color: '#9b87f5' },
    { name: 'Food', value: 800, color: '#7E69AB' },
    { name: 'Transportation', value: 400, color: '#6E59A5' },
    { name: 'Utilities', value: 300, color: '#E5DEFF' },
    { name: 'Entertainment', value: 500, color: '#D6BCFA' },
    { name: 'Other', value: 300, color: '#F2FCE2' },
  ]
};

export function BudgetOverview() {
  const spentPercentage = Math.round((monthlyData.expenses / monthlyData.income) * 100);
  
  const chartConfig = {
    "Housing": { theme: { light: "#9b87f5", dark: "#9b87f5" } },
    "Food": { theme: { light: "#7E69AB", dark: "#7E69AB" } },
    "Transportation": { theme: { light: "#6E59A5", dark: "#6E59A5" } },
    "Utilities": { theme: { light: "#E5DEFF", dark: "#E5DEFF" } },
    "Entertainment": { theme: { light: "#D6BCFA", dark: "#D6BCFA" } },
    "Other": { theme: { light: "#F2FCE2", dark: "#F2FCE2" } },
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Monthly Budget Summary</CardTitle>
          <CardDescription>April 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Budget spent</span>
                <span className="text-sm font-medium">{spentPercentage}%</span>
              </div>
              <Progress value={spentPercentage} className="h-2 mt-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Income</span>
                <span className="text-2xl font-bold">${monthlyData.income}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Expenses</span>
                <span className="text-2xl font-bold">${monthlyData.expenses}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Remaining</span>
                <span className="text-2xl font-bold">${monthlyData.remaining}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Category distribution</CardDescription>
          </div>
          <PieChartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full"
            >
              <PieChart 
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                width={500}
                height={240}
                cx="50%"
                cy="50%"
              >
                <Pie
                  data={monthlyData.categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {monthlyData.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
