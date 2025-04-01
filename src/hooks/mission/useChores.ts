
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Chore, WeekDay, ChoreFrequency, ChoreProperties, ChoreStatus } from '@/types/chores';
import { toast } from '@/components/ui/use-toast';

export function useChores() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { household } = useAuth();

  const fetchChores = async () => {
    if (!household) {
      setChores([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('household_chores')
        .select(`
          *,
          user_profiles:profiles(full_name, avatar_url)
        `)
        .eq('household_id', household.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data into Chore type
      const formattedChores: Chore[] = data.map(chore => {
        // Create default properties object
        const properties: ChoreProperties = {
          status: isChoreCompletedToday(chore) ? 'done' : 'todo',
          priority: 'medium'
        };
        
        // Determine status based on completion
        const status: ChoreStatus = isChoreCompletedToday(chore) ? 'done' : 'todo';
        
        return {
          id: chore.id,
          household_id: chore.household_id,
          title: chore.title,
          description: chore.description,
          assigned_to: chore.assigned_to,
          weekdays: (chore.weekdays || []) as WeekDay[], // Cast to WeekDay[]
          frequency: (chore.frequency || 'weekly') as ChoreFrequency,
          points: chore.points || 1,
          completed_dates: chore.completed_dates || [],
          created_at: chore.created_at,
          updated_at: chore.updated_at,
          assigned_to_name: chore.user_profiles?.full_name || null,
          properties: properties,
          status: status
        };
      });

      setChores(formattedChores);
    } catch (err: any) {
      console.error('Error fetching chores:', err);
      setError(err);
      toast({
        title: "Error fetching chores",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to check if a chore is completed today
  const isChoreCompletedToday = (chore: any): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return (chore.completed_dates || []).includes(today);
  };

  useEffect(() => {
    fetchChores();
  }, [household]);

  return {
    chores,
    isLoading,
    error,
    refreshChores: fetchChores
  };
}
