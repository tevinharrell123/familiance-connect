
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GoalTask } from '@/types/tasks';

export function useTasks(goalId?: string) {
  const [tasks, setTasks] = useState<GoalTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = async () => {
    if (!goalId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('goal_tasks')
        .select(`
          *,
          user_profiles:profiles(full_name, avatar_url)
        `)
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data into GoalTask type
      const formattedTasks: GoalTask[] = data.map(task => {
        // Ensure properties has the correct shape
        const taskProperties = task.properties || {};
        const properties = {
          priority: (typeof taskProperties === 'object' && 'priority' in taskProperties) 
            ? (taskProperties.priority as 'low' | 'medium' | 'high') 
            : 'medium',
          status: (typeof taskProperties === 'object' && 'status' in taskProperties)
            ? String(taskProperties.status)
            : 'todo'
        };
        
        // Determine the status from properties or default to 'todo'
        const status = (typeof taskProperties === 'object' && 'status' in taskProperties)
          ? String(taskProperties.status) as 'todo' | 'in-progress' | 'done'
          : 'todo';

        return {
          id: task.id,
          goal_id: task.goal_id,
          title: task.title,
          description: task.description,
          assigned_to: task.assigned_to,
          assigned_to_name: task.user_profiles?.full_name || null,
          target_date: task.target_date,
          completed: task.completed || false,
          created_at: task.created_at,
          updated_at: task.updated_at,
          status: status,
          properties: properties
        };
      });

      setTasks(formattedTasks);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [goalId]);

  return {
    tasks,
    isLoading,
    error,
    refreshTasks: fetchTasks
  };
}
