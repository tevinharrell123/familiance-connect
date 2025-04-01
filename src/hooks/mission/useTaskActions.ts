
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GoalTask, TaskProperties, TaskStatus } from '@/types/tasks';
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
      
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
      
      return data as GoalTask;
    } catch (error: any) {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (task: GoalTask): Promise<GoalTask> => {
    try {
      setIsLoading(true);

      // Ensure properties includes status
      const properties: TaskProperties = {
        ...(task.properties || {}),
        status: task.status || (task.properties?.status || 'todo')
      };

      const { data, error } = await supabase
        .from('goal_tasks')
        .update({
          title: task.title,
          description: task.description,
          assigned_to: task.assigned_to === "unassigned" ? null : task.assigned_to,
          target_date: task.target_date,
          completed: task.completed,
          properties: properties,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;

      if (onSuccess) onSuccess();
      
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
      
      return data as GoalTask;
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = async (task: GoalTask): Promise<GoalTask> => {
    try {
      setIsLoading(true);
      
      // Update properties to reflect the new status
      const properties: TaskProperties = {
        ...(task.properties || {}),
        status: !task.completed ? 'done' : 'todo'
      };
      
      const { data, error } = await supabase
        .from('goal_tasks')
        .update({
          completed: !task.completed,
          properties: properties,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;

      if (onSuccess) onSuccess();
      
      toast({
        title: task.completed ? "Task reopened" : "Task completed",
        description: task.completed ? "Task has been marked as incomplete." : "Task has been marked as complete!",
      });
      
      return data as GoalTask;
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive"
      });
      throw error;
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
      
      toast({
        title: "Task deleted",
        description: "Your task has been deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive"
      });
      throw error;
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
