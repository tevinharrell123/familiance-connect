
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GoalTask, TaskProperties, TaskStatus } from '@/types/tasks';
import { toast } from '@/components/ui/use-toast';

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

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Transform data into GoalTask type
      const formattedTasks: GoalTask[] = data.map(task => {
        // Ensure properties is an object or set default
        const properties: TaskProperties = task.properties && typeof task.properties === 'object' 
          ? task.properties as TaskProperties 
          : { status: 'todo' };
        
        // Get status from properties if it exists, otherwise use completed state
        const status: TaskStatus = properties.status || (task.completed ? 'done' : 'todo');
        
        return {
          id: task.id,
          goal_id: task.goal_id,
          title: task.title,
          description: task.description,
          assigned_to: task.assigned_to,
          target_date: task.target_date,
          completed: task.completed || false,
          created_at: task.created_at,
          updated_at: task.updated_at,
          assigned_to_name: task.user_profiles?.full_name || null,
          properties: properties,
          status: status
        };
      });

      setTasks(formattedTasks);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(err);
      toast({
        title: "Error fetching tasks",
        description: err.message,
        variant: "destructive"
      });
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
