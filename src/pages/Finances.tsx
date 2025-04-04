
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/finances/PageHeader';
import { BudgetOverview } from '@/components/finances/BudgetOverview';
import { ExpensesTracker } from '@/components/finances/ExpensesTracker';
import { IncomeTracker } from '@/components/finances/IncomeTracker';
import { TransactionUpload } from '@/components/finances/TransactionUpload';

export default function Finances() {
  const { isLoading } = useRequireAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <MainLayout>
      <div className="container px-4 py-6 md:px-6 md:py-8">
        <PageHeader />
        
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <BudgetOverview />
          </TabsContent>
          <TabsContent value="income" className="mt-6">
            <IncomeTracker />
          </TabsContent>
          <TabsContent value="expenses" className="mt-6">
            <ExpensesTracker />
          </TabsContent>
          <TabsContent value="upload" className="mt-6">
            <TransactionUpload />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
