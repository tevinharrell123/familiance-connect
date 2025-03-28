
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { MainLayout } from '@/components/layout/MainLayout';
import { CalendarWidget } from '@/components/dashboard/Calendar';
import { BudgetSummary, GoalsSummary } from '@/components/dashboard/SummaryCards';
import { QuickActions, TasksAndChores, WeeklyRoutines } from '@/components/dashboard/QuickActions';
import { FamilyMembersWidget } from '@/components/dashboard/FamilyMembers';
import { OnboardingFlow } from '@/components/family/OnboardingFlow';
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState<any>(null);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }
        
        setUser(session.user);
        
        // Check if user has a household
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('household_id')
          .eq('user_id', session.user.id)
          .single();
        
        if (membershipError && membershipError.code !== 'PGRST116') {
          console.error('Error fetching membership:', membershipError);
        }
        
        if (membershipData) {
          // Fetch household data
          const { data: householdData, error: householdError } = await supabase
            .from('households')
            .select('*')
            .eq('id', membershipData.household_id)
            .single();
          
          if (householdError) {
            console.error('Error fetching household:', householdError);
          } else {
            setHousehold(householdData);
          }
        }
        
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserSession();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="p-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </Card>
      </div>
    );
  }

  // If user is not authenticated, show the onboarding flow
  if (!user) {
    return <OnboardingFlow user={null} />;
  }

  // If user is authenticated but has no household, redirect to Family page
  if (!household) {
    return <Navigate to="/family" />;
  }

  // If user is authenticated and has a household, show their dashboard
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome, {household.name}</h1>
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
