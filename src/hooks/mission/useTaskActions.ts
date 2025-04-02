
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GoalTask, TaskProperties } from '@/types/tasks';
import { toast } from '@/components/ui/use-toast';

export function useTaskActions(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to safely parse task properties
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

  const createTask = async (task: Partial<GoalTask>): Promise<GoalTask> => {
    try {
      setIsLoading(true);

      // Ensure properties is properly formatted
      const properties = task.properties || { status: 'To Do', priority: 'medium' };

      const { data, error } = await supabase
        .from('goal_tasks')
        .insert({
          goal_id: task.goal_id,
          title: task.title,
          description: task.description,
          assigned_to: task.assigned_to === "unassigned" ? null : task.assigned_to,
          target_date: task.target_date,
          completed: task.completed || false,
          properties
        })
        .select()
        .single();

      if (error) throw error;

      // Format returned data to match GoalTask type
      const formattedTask: GoalTask = {
        id: data.id,
        goal_id: data.goal_id,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        target_date: data.target_date,
        completed: data.completed || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        properties: parseTaskProperties(data)
      };

      if (onSuccess) onSuccess();
      return formattedTask;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (task: GoalTask): Promise<GoalTask> => {
    try {
      setIsLoading(true);

      // Ensure properties is properly formatted
      const properties = task.properties || { status: 'To Do', priority: 'medium' };

      const { data, error } = await supabase
        .from('goal_tasks')
        .update({
          title: task.title,
          description: task.description,
          assigned_to: task.assigned_to === "unassigned" ? null : task.assigned_to,
          target_date: task.target_date,
          completed: task.completed,
          properties,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;

      // Format returned data to match GoalTask type
      const formattedTask: GoalTask = {
        id: data.id,
        goal_id: data.goal_id,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        target_date: data.target_date,
        completed: data.completed || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        properties: parseTaskProperties(data)
      };

      if (onSuccess) onSuccess();
      return formattedTask;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = async (task: GoalTask): Promise<GoalTask> => {
    try {
      setIsLoading(true);
      
      // Update properties if needed when completing a task
      let properties = task.properties || { status: 'To Do', priority: 'medium' };
      
      // When marking as complete, also update status to "Done"
      if (!task.completed) {
        properties = {
          ...properties,
          status: 'Done'
        };
      }
      
      const { data, error } = await supabase
        .from('goal_tasks')
        .update({
          completed: !task.completed,
          properties,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;

      // Format returned data to match GoalTask type
      const formattedTask: GoalTask = {
        id: data.id,
        goal_id: data.goal_id,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        target_date: data.target_date,
        completed: data.completed || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        properties: parseTaskProperties(data)
      };

      if (onSuccess) onSuccess();
      return formattedTask;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('goal_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      if (onSuccess) onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    isLoading
  };
}
