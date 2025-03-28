
import React, { useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { OnboardingFlow } from '@/components/family/OnboardingFlow';
import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { FamilyError } from '@/components/family/FamilyError';
import { FamilyLoading } from '@/components/family/FamilyLoading';
import { useFamilyMembership } from '@/hooks/useFamilyMembership';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

export default function Family() {
  const { user, isLoading: authLoading } = useAuth();
  const { 
    loading,
    membership,
    household,
    error,
    fetchAttempted,
    clearError,
    refetch,
    isPolling,
    pollCount,
    startOnboarding,
    pollingComplete
  } = useFamilyMembership();
  
  // Log when component mounts for debugging
  useEffect(() => {
    console.log('Family component rendered', { 
      hasUser: !!user, 
      authLoading,
      loading, 
      error, 
      fetchAttempted,
      hasHousehold: !!household,
      isPolling,
      pollCount,
      pollingComplete
    });
    
    // Show helpful toast for debugging purposes in development
    if (isPolling && pollCount === 1) {
      toast({
        title: "Checking Membership",
        description: "Verifying your family membership status...",
      });
    }
  }, [user, authLoading, loading, error, household, fetchAttempted, isPolling, pollCount, pollingComplete]);
  
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

  // Show loading state while data is loading
  if (loading || authLoading || (isPolling && !pollingComplete)) {
    return (
      <FamilyLoading 
        isPolling={isPolling}
        pollCount={pollCount}
        maxPolls={12}
        isAuthLoading={authLoading}
      />
    );
  }

  // If polling is complete but no household found, or if user wants to create/join a household
  if ((pollingComplete && !household) || (!household && user && fetchAttempted)) {
    return (
      <FamilyLoading 
        isPolling={false}
        pollCount={12}
        maxPolls={12}
        onCreateHousehold={startOnboarding}
        onRetry={refetch}
      />
    );
  }

  // If the user already has a household, show the family dashboard
  if (household) {
    return <FamilyDashboard household={household} membership={membership} />;
  }

  // If the user is authenticated but doesn't have a household, show the onboarding
  return <OnboardingFlow />;
}
