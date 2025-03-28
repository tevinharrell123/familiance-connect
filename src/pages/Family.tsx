
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
  const { user } = useAuth();
  const { 
    loading,
    authLoading,
    membership,
    household,
    error,
    fetchAttempted,
    clearError,
    refetch,
    isPolling,
    pollCount
  } = useFamilyMembership();
  
  // Log when component mounts for debugging
  useEffect(() => {
    console.log('Family component rendered', { 
      hasUser: !!user, 
      loading, 
      error, 
      fetchAttempted,
      hasHousehold: !!household,
      isPolling,
      pollCount
    });
    
    // Show helpful toast for debugging purposes in development
    if (isPolling && pollCount === 1) {
      toast({
        title: "Checking Membership",
        description: "Verifying your family membership status...",
      });
    }
    
    // Show toast when polling completes
    if (isPolling && pollCount > 0 && !loading && household) {
      toast({
        title: "Success",
        description: "Your family data has been loaded successfully.",
      });
    }
  }, [user, loading, error, household, fetchAttempted, isPolling, pollCount]);
  
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
    return (
      <FamilyLoading 
        isPolling={isPolling}
        pollCount={pollCount}
        maxPolls={12}
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
