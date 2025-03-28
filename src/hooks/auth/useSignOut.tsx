
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function useSignOut(
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  navigate: ReturnType<typeof useNavigate>
) {
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      navigate('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { signOut };
}
