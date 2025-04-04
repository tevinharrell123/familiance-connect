import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Calendar, CheckCircle, Edit, Plus, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FamilyGoal } from '@/types/goals';
import { EditGoalDialog } from '@/components/mission/EditGoalDialog';
import { TaskList } from '@/components/mission/TaskList';
import { TaskDialog } from '@/components/mission/TaskDialog';
import { useTasks } from '@/hooks/mission/useTasks';
import { useTaskActions } from '@/hooks/mission/useTaskActions';
import { useGoalProgress } from '@/hooks/mission/useGoalProgress';
import { useGenerateTasks } from '@/hooks/mission/useGenerateTasks';
import { GoalTask } from '@/types/tasks';
import { Skeleton } from '@/components/ui/skeleton';

export function GoalDetails() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  
  const [goal, setGoal] = useState<FamilyGoal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GoalTask | undefined>(undefined);
  
  const { tasks, isLoading: tasksLoading, refreshTasks } = useTasks(goalId);
  const { createTask, updateTask, toggleTaskCompletion, deleteTask, isLoading: taskActionLoading } = useTaskActions(() => {
    refreshTasks();
    calculateProgress();
  });
  const { calculateProgressFromTasks, isLoading: progressLoading } = useGoalProgress();
  const { generateTasks, isLoading: generatingTasks } = useGenerateTasks(goalId || '', () => {
    refreshTasks();
    calculateProgress();
  });
  
  useEffect(() => {
    if (!goalId) return;
    
    const fetchGoal = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('family_goals')
          .select(`
            *,
            user_profiles:profiles(full_name, avatar_url)
          `)
          .eq('id', goalId)
          .single();
          
        if (error) throw error;
        
        setGoal({
          id: data.id,
          household_id: data.household_id,
          title: data.title,
          description: data.description,
          category: data.category,
          target_date: data.target_date,
          assigned_to: data.assigned_to,
          image_url: data.image_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
          assigned_to_name: data.user_profiles?.full_name || null,
          completed: data.completed || false,
          progress: data.progress || 0,
          show_on_vision_board: data.show_on_vision_board || false
        });
      } catch (err: any) {
        console.error('Error fetching goal:', err);
        setError(err);
        toast({
          title: "Error loading goal",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGoal();
  }, [goalId]);
  
  const calculateProgress = async () => {
    if (!goalId) return;
    try {
      await calculateProgressFromTasks(goalId);
      const { data, error } = await supabase
        .from('family_goals')
        .select('progress, completed')
        .eq('id', goalId)
        .single();
        
      if (error) throw error;
      
      if (goal) {
        setGoal(prevGoal => ({
          ...prevGoal,
          progress: data.progress || 0,
          completed: data.completed || false
        }));
      }
    } catch (err: any) {
      console.error('Error calculating progress:', err);
    }
  };
  
  useEffect(() => {
    if (tasks.length > 0) {
      calculateProgress();
    }
  }, []);
  
  const handleEditGoal = () => {
    setEditGoalOpen(true);
  };
  
  const handleGoalUpdate = () => {
    setEditGoalOpen(false);
    if (goalId) {
      const fetchGoal = async () => {
        const { data, error } = await supabase
          .from('family_goals')
          .select(`
            *,
            user_profiles:profiles(full_name, avatar_url)
          `)
          .eq('id', goalId)
          .single();
          
        if (error) throw error;
        
        setGoal({
          ...data,
          assigned_to_name: data.user_profiles?.full_name || null,
          completed: data.completed || false
        });
      };
      
      fetchGoal();
    }
  };
  
  const handleDeleteGoal = async () => {
    if (!goalId) return;
    
    try {
      const { error } = await supabase
        .from('family_goals')
        .delete()
        .eq('id', goalId);
        
      if (error) throw error;
      
      toast({
        title: "Goal deleted",
        description: "The goal has been successfully deleted."
      });
      
      navigate('/goals');
    } catch (err: any) {
      console.error('Error deleting goal:', err);
      toast({
        title: "Error deleting goal",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
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
          description: "New task has been added to the goal."
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
  
  const handleGenerateTasks = async () => {
    if (!goal) return;
    
    try {
      await generateTasks(goal);
    } catch (err: any) {
      console.error('Error generating tasks:', err);
      toast({
        title: "Error generating tasks",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  const handleViewTasks = () => {
    if (goalId) {
      navigate(`/tasks/${goalId}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-20" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  if (!goal) {
    return (
      <div className="container mx-auto py-6 px-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/goals')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
        </div>
        
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>Goal Not Found</CardTitle>
            <CardDescription>
              The goal you're looking for doesn't exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/goals')}>
              Return to Goals Page
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/goals')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold truncate max-w-[200px] sm:max-w-none">{goal.title}</h1>
        </div>
        
        <div className="flex space-x-2 mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            onClick={handleEditGoal}
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Goal
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setDeleteAlertOpen(true)}
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <CardTitle className="flex items-center">
                    <Badge className="mr-2" variant="outline">
                      {goal.category}
                    </Badge>
                    Goal Details
                    {goal.completed && (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Progress: {goal.progress || 0}%
                  </CardDescription>
                </div>
                {goal.target_date && (
                  <Badge variant="secondary" className="flex items-center self-start">
                    <Calendar className="h-3 w-3 mr-1" />
                    Due: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={goal.progress || 0} className="h-2 mb-6" />
              
              {goal.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
              )}
              
              {goal.image_url && (
                <div className="mb-6">
                  <div className="aspect-video relative overflow-hidden rounded-md">
                    <img 
                      src={goal.image_url} 
                      alt={goal.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
              )}
              
              {goal.assigned_to && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Assigned To</h3>
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback>
                        {goal.assigned_to_name ? goal.assigned_to_name.substring(0, 2).toUpperCase() : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{goal.assigned_to_name || 'Unknown'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Tasks</CardTitle>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerateTasks}
                    disabled={generatingTasks}
                    className="w-full sm:w-auto"
                  >
                    {generatingTasks ? (
                      <>Generating...</>
                    ) : (
                      <>Generate Tasks</>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleAddTask}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleViewTasks}
                    className="w-full sm:w-auto"
                  >
                    View All Tasks
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TaskList 
                tasks={tasks}
                isLoading={tasksLoading}
                onEdit={handleEditTask}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Goal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(goal.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(goal.updated_at), 'MMM d, yyyy')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="text-sm">
                    {goal.completed ? (
                      <Badge variant="secondary" className="mt-1 bg-green-500 text-white">Completed</Badge>
                    ) : goal.progress && goal.progress > 0 ? (
                      <Badge variant="secondary" className="mt-1">In Progress ({goal.progress || 0}%)</Badge>
                    ) : (
                      <Badge variant="outline" className="mt-1">Not Started</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Tasks Completed</p>
                  <p className="text-sm text-muted-foreground">
                    {tasks.filter(t => t.completed).length} of {tasks.length} tasks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <EditGoalDialog 
        goal={goal}
        open={editGoalOpen}
        onOpenChange={setEditGoalOpen}
        onSave={handleGoalUpdate}
      />
      
      <TaskDialog 
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSave={handleSaveTask}
        task={selectedTask}
        goalId={goalId || ''}
        isLoading={taskActionLoading}
      />
      
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the goal "{goal.title}" and all associated tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteGoal}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
