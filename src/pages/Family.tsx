
import React, { useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { OnboardingFlow } from '@/components/family/OnboardingFlow';
import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { FamilyError } from '@/components/family/FamilyError';
import { FamilyLoading } from '@/components/family/FamilyLoading';
import { useFamilyMembership } from '@/hooks/useFamilyMembership';
import { useAuth } from '@/contexts/AuthContext';

export default function Family() {
  const { user } = useAuth();
  const { 
    loading,
    authLoading,
    membership,
    household,
    error,
    fetchAttempted,
    clearError,
    refetch
  } = useFamilyMembership();
  
  // Log when component mounts for debugging
  useEffect(() => {
    console.log('Family component rendered', { 
      hasUser: !!user, 
      loading, 
      error, 
      fetchAttempted,
      hasHousehold: !!household 
    });
    
    if (error && error.includes('RLS-RECURSION')) {
      toast({
        title: "Database Configuration Issue",
        description: "We're experiencing a policy error in our database. You can still proceed to setup your household.",
        variant: "destructive",
      });
    }
  }, [user, loading, error, household, fetchAttempted]);
  
  // Show error state if there's an error
  if (error) {
    return (
      <FamilyError 
        error={error}
        fetchAttempted={fetchAttempted}
        hasUser={!!user}
        onRetry={refetch}
        onContinue={clearError}
      />
    );
  }

  // Show loading state while both auth and data are loading
  if (loading || authLoading) {
    return <FamilyLoading />;
  }

  // If the user already has a household, show the family dashboard
  if (household) {
    return <FamilyDashboard household={household} membership={membership} user={user} />;
  }

  // If the user is authenticated but doesn't have a household, show the onboarding
  return <OnboardingFlow />;
}
