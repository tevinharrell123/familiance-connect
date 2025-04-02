
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GoalTask, TaskProperties } from '@/types/tasks';

export function useTasks(goalId?: string) {
  const [tasks, setTasks] = useState<GoalTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to parse task properties safely
  const parseTaskProperties = (data: any): TaskProperties => {
    // Default properties
    const defaultProperties: TaskProperties = {
      status: 'To Do',
      priority: 'medium'
    };

    // Return default properties if data properties is null or undefined
    if (!data.properties) {
      return defaultProperties;
    }

    try {
      // If properties is already an object, extract the fields we need
      if (typeof data.properties === 'object' && !Array.isArray(data.properties)) {
        return {
          status: data.properties.status || defaultProperties.status,
          priority: data.properties.priority || defaultProperties.priority
        };
      }
      
      // If properties is a string, parse it as JSON
      if (typeof data.properties === 'string') {
        try {
          const parsed = JSON.parse(data.properties);
          return {
            status: parsed.status || defaultProperties.status,
            priority: parsed.priority || defaultProperties.priority
          };
        } catch (e) {
          return defaultProperties;
        }
      }
      
      // Default fallback
      return defaultProperties;
    } catch (e) {
      console.error('Error parsing task properties:', e);
      return defaultProperties;
    }
  };

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
        assigned_to_name: task.user_profiles?.full_name || null,
        properties: parseTaskProperties(task)
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
