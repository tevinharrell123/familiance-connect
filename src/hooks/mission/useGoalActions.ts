
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FamilyGoal } from '@/types/goals';
import { toast } from '@/components/ui/use-toast';

export function useGoalActions() {
  const [isLoading, setIsLoading] = useState(false);

  const updateGoal = async (goal: FamilyGoal): Promise<FamilyGoal> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('family_goals')
        .update({
          title: goal.title,
          description: goal.description,
          category: goal.category,
          target_date: goal.target_date,
          assigned_to: goal.assigned_to === "unassigned" ? null : goal.assigned_to,
          completed: goal.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', goal.id)
        .select()
        .single();

      if (error) throw error;

      return data as FamilyGoal;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoalCompletion = async (goal: FamilyGoal): Promise<FamilyGoal> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('family_goals')
        .update({
          completed: !goal.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', goal.id)
        .select()
        .single();

      if (error) throw error;

      return data as FamilyGoal;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoal = async (goalId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('family_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateGoal,
    toggleGoalCompletion,
    deleteGoal,
    isLoading
  };
}
