
import React from 'react';
import { DollarSign, PieChart, ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Family Budget</h1>
        <p className="text-muted-foreground">
          Track your household income and expenses, and plan for your financial future.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1">
          <ArrowDownUp className="h-4 w-4" />
          <span className="hidden md:inline">Transaction</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          <PieChart className="h-4 w-4" />
          <span className="hidden md:inline">Reports</span>
        </Button>
        <Button size="sm" className="gap-1">
          <DollarSign className="h-4 w-4" />
          <span>New Budget Item</span>
        </Button>
      </div>
    </div>
  );
}
