
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FamilyGoal } from '@/types/goals';
import { GoalTask } from '@/types/tasks';
import { toast } from '@/components/ui/use-toast';
import { useTaskActions } from './useTaskActions';

interface GeneratedTask {
  title: string;
  description: string;
}

export function useGenerateTasks(goalId: string, onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const { createTask } = useTaskActions();

  const generateTasks = async (goal: FamilyGoal): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Call the edge function to generate tasks
      const { data, error } = await supabase.functions.invoke('generate-tasks', {
        body: { goal }
      });
      
      if (error) {
        console.error('Error calling generate-tasks function:', error);
        toast({
          title: 'Error generating tasks',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error('Invalid response from task generator');
      }
      
      // Create each task in the database
      const generatedTasks = data.tasks as GeneratedTask[];
      
      for (const taskData of generatedTasks) {
        await createTask({
          goal_id: goalId,
          title: taskData.title,
          description: taskData.description,
          assigned_to: null,
          target_date: null,
          completed: false
        });
      }
      
      toast({
        title: 'Tasks generated',
        description: `${generatedTasks.length} tasks have been created for this goal.`
      });
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Error generating tasks:', error);
      toast({
        title: 'Failed to generate tasks',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateTasks,
    isLoading
  };
}
