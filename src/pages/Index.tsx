
import React from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Calendar } from '@/components/dashboard/Calendar';
import { BudgetSummary, GoalsSummary } from '@/components/dashboard/SummaryCards';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isLoading } = useRequireAuth();
  const { household, profile } = useAuth();
  
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

  if (!household) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold mb-4">Welcome to FamPilot, {profile?.full_name || 'New User'}!</h1>
          <p className="text-xl text-muted-foreground mb-8 text-center">
            To get started, create or join a household to organize your family activities.
          </p>
          <Button asChild size="lg">
            <Link to="/household">
              <Home className="mr-2 h-5 w-5" />
              Set Up Your Household
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Dashboard view for users with a household
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 dashboard-header">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Welcome to {household.name}</h1>
          <p className="text-base sm:text-lg text-muted-foreground">Here's your family dashboard for today</p>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <Calendar />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <BudgetSummary />
            <GoalsSummary />
            <div className="col-span-1 sm:col-span-2">
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
