
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FamilyGoal } from '@/types/goals';

export function useGoalProgress() {
  const [isLoading, setIsLoading] = useState(false);

  const updateGoalProgress = async (goalId: string, progress: number): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Update the progress field
      const { error } = await supabase
        .from('family_goals')
        .update({
          progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgressFromTasks = async (goalId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // First, get all tasks for this goal
      const { data: tasks, error: tasksError } = await supabase
        .from('goal_tasks')
        .select('id, completed')
        .eq('goal_id', goalId);
      
      if (tasksError) throw tasksError;
      
      if (!tasks || tasks.length === 0) {
        // No tasks, set progress to 0
        await updateGoalProgress(goalId, 0);
        return;
      }
      
      // Calculate percentage of completed tasks
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.completed).length;
      const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
      
      // Update goal progress
      await updateGoalProgress(goalId, progressPercentage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateGoalProgress,
    calculateProgressFromTasks,
    isLoading
  };
}
