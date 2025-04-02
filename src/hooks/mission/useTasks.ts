
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GoalTask } from '@/types/tasks';

export function useTasks(goalId?: string) {
  const [tasks, setTasks] = useState<GoalTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('goal_tasks')
        .select(`
          *,
          user_profiles:profiles(full_name, avatar_url)
        `)
        .order('target_date', { ascending: true });

      if (goalId) {
        query = query.eq('goal_id', goalId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data into GoalTask type
      const formattedTasks: GoalTask[] = data.map(task => ({
        id: task.id,
        goal_id: task.goal_id,
        title: task.title,
        description: task.description,
        assigned_to: task.assigned_to,
        target_date: task.target_date,
        completed: task.completed || false,
        created_at: task.created_at,
        updated_at: task.updated_at,
        assigned_to_name: task.user_profiles?.full_name || null
      }));

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
