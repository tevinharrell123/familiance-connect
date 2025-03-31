
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chore } from '@/types/chores';
import { toast } from '@/components/ui/use-toast';

export function useChoreActions(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const createChore = async (chore: Omit<Chore, 'id' | 'created_at' | 'updated_at'>): Promise<Chore> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('household_chores')
        .insert({
          household_id: chore.household_id,
          title: chore.title,
          description: chore.description,
          assigned_to: chore.assigned_to === "unassigned" ? null : chore.assigned_to,
          weekdays: chore.weekdays || [],
          frequency: chore.frequency || 'weekly',
          points: chore.points || 1,
          completed_dates: chore.completed_dates || []
        })
        .select()
        .single();

      if (error) throw error;

      if (onSuccess) onSuccess();
      
      toast({
        title: "Chore created",
        description: "The chore has been created successfully.",
      });
      
      return data as Chore;
    } finally {
      setIsLoading(false);
    }
  };

  const updateChore = async (chore: Chore): Promise<Chore> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('household_chores')
        .update({
          title: chore.title,
          description: chore.description,
          assigned_to: chore.assigned_to === "unassigned" ? null : chore.assigned_to,
          weekdays: chore.weekdays,
          frequency: chore.frequency,
          points: chore.points,
          completed_dates: chore.completed_dates,
          updated_at: new Date().toISOString()
        })
        .eq('id', chore.id)
        .select()
        .single();

      if (error) throw error;

      if (onSuccess) onSuccess();
      
      toast({
        title: "Chore updated",
        description: "The chore has been updated successfully.",
      });
      
      return data as Chore;
    } finally {
      setIsLoading(false);
    }
  };

  const markChoreCompleted = async (chore: Chore): Promise<Chore> => {
    try {
      setIsLoading(true);
      
      // Add today's date to the completed_dates array
      const today = new Date().toISOString().split('T')[0];
      const updatedCompletedDates = [...chore.completed_dates, today];
      
      const { data, error } = await supabase
        .from('household_chores')
        .update({
          completed_dates: updatedCompletedDates,
          updated_at: new Date().toISOString()
        })
        .eq('id', chore.id)
        .select()
        .single();

      if (error) throw error;

      if (onSuccess) onSuccess();
      
      toast({
        title: "Chore completed",
        description: "Great job! The chore has been marked as completed for today.",
      });
      
      return data as Chore;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChore = async (choreId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('household_chores')
        .delete()
        .eq('id', choreId);

      if (error) throw error;
      
      if (onSuccess) onSuccess();
      
      toast({
        title: "Chore deleted",
        description: "The chore has been deleted successfully.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createChore,
    updateChore,
    markChoreCompleted,
    deleteChore,
    isLoading
  };
}
