
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function useRequireAuth(redirectUrl = '/auth') {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate(redirectUrl);
    }
  }, [user, isLoading, navigate, redirectUrl]);

  return { user, isLoading };
}
