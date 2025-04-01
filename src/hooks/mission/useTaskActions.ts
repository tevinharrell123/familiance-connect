
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GoalTask, TaskProperties } from '@/types/tasks';
import { toast } from '@/components/ui/use-toast';

export function useTaskActions(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);

  const createTask = async (task: Omit<GoalTask, 'id' | 'created_at' | 'updated_at'>): Promise<GoalTask> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('goal_tasks')
        .insert({
          goal_id: task.goal_id,
          title: task.title,
          description: task.description,
          assigned_to: task.assigned_to === "unassigned" ? null : task.assigned_to,
          target_date: task.target_date,
          completed: task.completed || false,
          properties: task.properties || { status: task.status || 'todo' }
        })
        .select()
        .single();

      if (error) throw error;

      if (onSuccess) onSuccess();
      return data as GoalTask;
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
          assigned_to: task.assigned_to === "unassigned" ? null : task.assigned_to,
          target_date: task.target_date,
          completed: task.completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;

      if (onSuccess) onSuccess();
      return data as GoalTask;
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
      return data as GoalTask;
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
