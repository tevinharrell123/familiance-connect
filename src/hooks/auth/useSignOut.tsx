
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useSignOut(
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  navigate: ReturnType<typeof useNavigate>
) {
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Check if there's an active session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session exists, just clear local state and redirect
        console.log('No active session found, clearing local state only');
        localStorage.removeItem('supabase.auth.token');
        navigate('/auth');
        return;
      }
      
      // Attempt to sign out with global scope to clear all sessions
      const { error } = await supabase.auth.signOut({ 
        scope: 'global' 
      });
      
      if (error) {
        console.warn('Sign out error, falling back to manual cleanup:', error);
        // Even if signOut fails, clear localStorage tokens to ensure local logout
        localStorage.removeItem('supabase.auth.token');
      }

      // Always navigate to auth page, regardless of server-side logout success
      navigate('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: "We couldn't complete the sign-out process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { signOut };
}
