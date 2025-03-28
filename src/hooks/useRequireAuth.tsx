
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function useRequireAuth(redirectUrl = '/auth') {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Only run the check once loading is complete
    if (!isLoading) {
      if (!user) {
        // User is not authenticated, redirect to login page
        navigate(redirectUrl);
      }
      setIsChecked(true);
    }
  }, [user, isLoading, navigate, redirectUrl]);

  return { user, isLoading: isLoading || !isChecked };
}
