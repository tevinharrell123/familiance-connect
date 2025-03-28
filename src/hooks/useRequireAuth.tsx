
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function useRequireAuth(redirectUrl = '/auth') {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if loading is complete and there's no user
    if (!isLoading && !user) {
      console.log('No authenticated user found, redirecting to', redirectUrl);
      navigate(redirectUrl);
    }
  }, [user, isLoading, navigate, redirectUrl]);

  return { user, isLoading };
}
