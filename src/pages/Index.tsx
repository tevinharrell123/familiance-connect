
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { CalendarWidget } from '@/components/dashboard/Calendar';
import { BudgetSummary, GoalsSummary } from '@/components/dashboard/SummaryCards';
import { QuickActions, TasksAndChores, WeeklyRoutines } from '@/components/dashboard/QuickActions';
import { FamilyMembersWidget } from '@/components/dashboard/FamilyMembers';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const Dashboard = () => {
  const { user, isLoading } = useRequireAuth();
  const { profile, household } = useAuth();
  
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

  // If no household is set up yet, prompt to create/join one
  if (!household) {
    return (
      <MainLayout>
        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center p-4">
          <Home className="h-16 w-16 text-primary mb-6" />
          <h1 className="text-3xl font-bold mb-4">Welcome to FamPilot</h1>
          <p className="text-lg text-muted-foreground mb-8">
            To get started, you need to create or join a household. This will be your family's central hub for managing tasks, calendars, and more.
          </p>
          <Button asChild size="lg">
            <Link to="/household">Set Up Your Household</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Normal dashboard view if user has a household
  const familyName = household.name || 'Your Family';

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {familyName}</h1>
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
