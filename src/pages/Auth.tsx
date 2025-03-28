
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthCard } from '@/components/auth/AuthCard';

const Auth = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    console.log("Auth page - User:", user, "isLoading:", isLoading);
  }, [user, isLoading]);

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
      <AuthCard />
    </div>
  );
};

export default Auth;
