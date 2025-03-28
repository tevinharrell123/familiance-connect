
import React from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CalendarWidget } from '@/components/dashboard/Calendar';
import { BudgetSummary, GoalsSummary } from '@/components/dashboard/SummaryCards';
import { QuickActions, TasksAndChores, WeeklyRoutines } from '@/components/dashboard/QuickActions';
import { FamilyMembersWidget } from '@/components/dashboard/FamilyMembers';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { CreateHouseholdModal } from '@/components/household/CreateHouseholdModal';

const Dashboard = () => {
  const { user, isLoading } = useRequireAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout>
      <CreateHouseholdModal />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Your Dashboard</h1>
          <p className="text-lg text-muted-foreground">Here's your family dashboard for today</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <CalendarWidget />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="grid grid-cols-2 gap-6">
            <BudgetSummary />
            <GoalsSummary />
            <div className="col-span-2">
              <QuickActions />
            </div>
            <div className="col-span-2">
              <TasksAndChores />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <FamilyMembersWidget />
            <WeeklyRoutines />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
