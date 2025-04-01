
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GoalTask } from '@/types/tasks';
import { toast } from '@/components/ui/use-toast';

export function useTaskActions(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const createTask = async (taskData: Omit<GoalTask, 'id' | 'created_at' | 'updated_at'>): Promise<GoalTask> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('goal_tasks')
        .insert({
          goal_id: taskData.goal_id,
          title: taskData.title,
          description: taskData.description,
          assigned_to: taskData.assigned_to,
          target_date: taskData.target_date,
          completed: taskData.completed,
          properties: {
            priority: taskData.properties.priority || 'medium',
            status: taskData.status || 'todo'
          }
        })
        .select('*')
        .single();

      if (error) throw error;

      if (onSuccess) onSuccess();
      
      // Ensure returned data matches GoalTask structure
      const result: GoalTask = {
        id: data.id,
        goal_id: data.goal_id,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        assigned_to_name: null,
        target_date: data.target_date,
        completed: data.completed || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.properties?.status || 'todo',
        properties: {
          priority: data.properties?.priority || 'medium',
          status: data.properties?.status || 'todo'
        }
      };
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (task: GoalTask): Promise<GoalTask> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('goal_tasks')
        .update({
          title: task.title,
          description: task.description,
          assigned_to: task.assigned_to,
          target_date: task.target_date,
          completed: task.completed,
          properties: {
            priority: task.properties.priority || 'medium',
            status: task.status || 'todo'
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;

      if (onSuccess) onSuccess();
      
      // Ensure returned data matches GoalTask structure
      const result: GoalTask = {
        id: data.id,
        goal_id: data.goal_id,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        assigned_to_name: null,
        target_date: data.target_date,
        completed: data.completed || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.properties?.status || 'todo',
        properties: {
          priority: data.properties?.priority || 'medium',
          status: data.properties?.status || 'todo'
        }
      };
      
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = async (task: GoalTask): Promise<GoalTask> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('goal_tasks')
        .update({
          completed: !task.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;

      if (onSuccess) onSuccess();
      
      // Ensure returned data matches GoalTask structure
      const result: GoalTask = {
        id: data.id,
        goal_id: data.goal_id,
        title: data.title,
        description: data.description,
        assigned_to: data.assigned_to,
        assigned_to_name: null,
        target_date: data.target_date,
        completed: data.completed || false,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.properties?.status || 'todo',
        properties: {
          priority: data.properties?.priority || 'medium',
          status: data.properties?.status || 'todo'
        }
      };
      
      return result;
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
