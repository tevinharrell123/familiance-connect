
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { TaskList } from '@/components/mission/TaskList';
import { useTasks } from '@/hooks/mission/useTasks';
import { useTaskActions } from '@/hooks/mission/useTaskActions';
import { GoalTask } from '@/types/tasks';
import { TaskDialog } from '@/components/mission/TaskDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useGoalProgress } from '@/hooks/mission/useGoalProgress';

const Tasks = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GoalTask | undefined>(undefined);
  
  const { tasks, isLoading, refreshTasks } = useTasks(goalId);
  const { calculateProgressFromTasks } = useGoalProgress();
  
  const { createTask, updateTask, toggleTaskCompletion, deleteTask, isLoading: taskActionLoading } = useTaskActions(() => {
    refreshTasks();
    if (goalId) {
      calculateProgressFromTasks(goalId);
    }
  });

  const handleAddTask = () => {
    setSelectedTask(undefined);
    setTaskDialogOpen(true);
  };
  
  const handleEditTask = (task: GoalTask) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };
  
  const handleSaveTask = async (taskData: Partial<GoalTask>) => {
    try {
      if (taskData.id) {
        await updateTask(taskData as GoalTask);
        toast({
          title: "Task updated",
          description: "Task has been updated successfully."
        });
      } else {
        await createTask(taskData as Omit<GoalTask, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: "Task added",
          description: "New task has been added."
        });
      }
      setTaskDialogOpen(false);
    } catch (err: any) {
      console.error('Error saving task:', err);
      toast({
        title: "Error saving task",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  const handleToggleTask = async (task: GoalTask) => {
    try {
      await toggleTaskCompletion(task);
      toast({
        title: task.completed ? "Task marked as incomplete" : "Task marked as complete",
        description: "Task status updated successfully."
      });
    } catch (err: any) {
      console.error('Error toggling task:', err);
      toast({
        title: "Error updating task",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({
        title: "Task deleted",
        description: "Task has been removed successfully."
      });
    } catch (err: any) {
      console.error('Error deleting task:', err);
      toast({
        title: "Error deleting task",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tasks</CardTitle>
            <Button 
              size="sm" 
              onClick={handleAddTask}
              disabled={!goalId}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent>
            {!goalId ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No goal selected. Please select a goal from the Goals page to manage tasks.
              </div>
            ) : (
              <TaskList 
                tasks={tasks}
                isLoading={isLoading}
                onEdit={handleEditTask}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <TaskDialog 
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSave={handleSaveTask}
        task={selectedTask}
        goalId={goalId || ''}
        isLoading={taskActionLoading}
      />
    </MainLayout>
  );
};

export default Tasks;
