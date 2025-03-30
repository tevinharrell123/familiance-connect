
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FamilyGoal } from '@/types/goals';

export function useGoals() {
  const [goals, setGoals] = useState<FamilyGoal[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { household } = useAuth();

  const fetchGoals = async () => {
    if (!household) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('family_goals')
        .select(`
          *,
          user_profiles:profiles(full_name, avatar_url)
        `)
        .eq('household_id', household.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data into FamilyGoal type
      const formattedGoals: FamilyGoal[] = data.map(goal => ({
        id: goal.id,
        household_id: goal.household_id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        target_date: goal.target_date,
        assigned_to: goal.assigned_to,
        image_url: goal.image_url,
        created_at: goal.created_at,
        updated_at: goal.updated_at,
        assigned_to_name: goal.user_profiles?.full_name || null,
        completed: goal.completed || false // Ensure completed is always a boolean
      }));

      setGoals(formattedGoals);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(formattedGoals.map(goal => goal.category)));
      setCategories(uniqueCategories);

    } catch (err: any) {
      console.error('Error fetching goals:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [household]);

  return {
    goals,
    categories,
    isLoading,
    error,
    refreshGoals: fetchGoals
  };
}
