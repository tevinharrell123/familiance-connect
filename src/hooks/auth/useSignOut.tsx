
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export function useSignOut() {
  const navigate = useNavigate();

  const signOut = async () => {
    try {
      // Set a flag to prevent auth listener from reacting during signout
      localStorage.setItem('signing_out', 'true');
      
      // Remove all Supabase-related items from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('supabase.')) {
          localStorage.removeItem(key);
        }
      }
      
      // Attempt to sign out from Supabase
      try {
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (error) {
          console.error('Supabase sign out error:', error);
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
      } catch (error: any) {
        console.error('Supabase sign out error:', error);
      }

      // Force a hard redirect to auth page which will reset all state
      window.location.href = '/auth';
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      localStorage.removeItem('signing_out');
      window.location.href = '/auth';
    }
  };

  return { signOut };
}
