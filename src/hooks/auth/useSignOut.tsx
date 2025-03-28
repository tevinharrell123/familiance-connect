
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useSignOut() {
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      // First clear local state
      localStorage.removeItem('supabase.auth.token');
      
      // Attempt to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        // Show error toast only for non-session errors
        if (error.message !== 'Session not found') {
          toast({
            title: "Sign out failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        });
      }

      // Always navigate to auth page, even if there was an error
      navigate('/auth');
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Continue with navigation despite error
      navigate('/auth');
    }
  };

  return { signOut };
}
