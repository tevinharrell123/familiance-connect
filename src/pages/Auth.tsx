
import React, { useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthCard } from '@/components/auth/AuthCard';

const Auth = () => {
  const { user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');

  useEffect(() => {
    console.log("Auth page - User:", user, "isLoading:", isLoading);
    if (inviteCode) {
      console.log("Invite code detected:", inviteCode);
    }
  }, [user, isLoading, inviteCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    console.log("User is authenticated, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("Auth page rendering login/register form");
  return (
    <div className="min-h-screen flex items-center justify-center bg-fampilot-background p-4">
      <AuthCard defaultTab={inviteCode ? 'register' : 'login'} inviteCode={inviteCode} />
    </div>
  );
};

export default Auth;
