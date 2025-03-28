
import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHousehold } from '@/hooks/useHousehold';

type AuthGuardProps = {
  children: ReactNode;
  requiresAuth?: boolean;
  requiresHousehold?: boolean;
};

export function AuthGuard({ 
  children, 
  requiresAuth = true,
  requiresHousehold = true 
}: AuthGuardProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { household, isLoading: householdLoading } = useHousehold();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't do anything while still loading
    if (authLoading) return;

    // Handle authentication check
    if (requiresAuth && !user) {
      // If we're not on the auth page, redirect to it
      if (location.pathname !== '/auth') {
        navigate('/auth');
      }
      return;
    }

    // If already authenticated and trying to access auth page, redirect to home
    if (user && location.pathname === '/auth') {
      navigate('/');
      return;
    }

    // Don't proceed with household check if we don't need to
    if (!requiresHousehold || householdLoading) return;

    // Handle household check
    if (user && !household && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [
    user, 
    household, 
    authLoading, 
    householdLoading, 
    location.pathname, 
    navigate, 
    requiresAuth,
    requiresHousehold
  ]);

  // If we're checking auth and we're still loading, show nothing
  if ((requiresAuth && authLoading) || (requiresHousehold && !authLoading && householdLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we require auth but don't have a user, don't render anything
  // (we'll be redirected to login)
  if (requiresAuth && !user) {
    return null;
  }

  // If we require a household but don't have one, don't render anything
  // (we'll be redirected to onboarding)
  if (requiresHousehold && user && !household) {
    return null;
  }

  return <>{children}</>;
}
