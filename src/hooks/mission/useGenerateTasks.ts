
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FamilyGoal } from '@/types/goals';
import { GoalTask, TaskStatus } from '@/types/tasks';
import { toast } from '@/components/ui/use-toast';
import { useTaskActions } from '@/hooks/mission/useTaskActions';

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
      
      if (!data || !data.tasks || !Array.isArray(data.tasks)) {
        console.error('Invalid response format:', data);
        toast({
          title: 'Error generating tasks',
          description: 'Received invalid response from the task generator',
          variant: 'destructive'
        });
        return;
      }
      
      // Create each task in the database
      const generatedTasks = data.tasks as GeneratedTask[];
      
      if (generatedTasks.length === 0) {
        toast({
          title: 'No tasks generated',
          description: 'The AI couldn\'t generate any tasks for this goal.',
          variant: 'destructive'
        });
        return;
      }
      
      for (const taskData of generatedTasks) {
        await createTask({
          goal_id: goalId,
          title: taskData.title,
          description: taskData.description,
          assigned_to: null,
          target_date: null,
          completed: false,
          status: 'todo' as TaskStatus,
          properties: {
            priority: 'medium',
            status: 'todo'
          }
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
