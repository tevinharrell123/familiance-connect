
import React from 'react';
import { Navigate } from 'react-router-dom';
import { OnboardingFlow } from '@/components/family/OnboardingFlow';
import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { FamilyError } from '@/components/family/FamilyError';
import { FamilyLoading } from '@/components/family/FamilyLoading';
import { useFamilyMembership } from '@/hooks/useFamilyMembership';

export default function Family() {
  const { 
    user,
    authLoading,
    loading,
    membership,
    household,
    error,
    fetchAttempted,
    clearError,
    refetch
  } = useFamilyMembership();
  
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
