
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { TaskList } from '@/components/mission/TaskList';
import { useTasks } from '@/hooks/mission/useTasks';
import { useTaskActions } from '@/hooks/mission/useTaskActions';
import { GoalTask } from '@/types/tasks';
import { TaskDialog } from '@/components/mission/TaskDialog';
import { Button } from '@/components/ui/button';
import { Plus, Columns, List, Calendar, CalendarDays } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useGoalProgress } from '@/hooks/mission/useGoalProgress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from '@/components/mission/KanbanBoard';
import { ListView } from '@/components/mission/ListView';

type ViewType = 'kanban' | 'list';
type GroupingType = 'status' | 'date' | 'priority' | 'assignee';

const Tasks = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<GoalTask | undefined>(undefined);
  const [viewType, setViewType] = useState<ViewType>('kanban');
  const [groupBy, setGroupBy] = useState<GroupingType>('status');
  
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

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = { 
          ...task, 
          status: newStatus as 'todo' | 'in-progress' | 'done',
          properties: {
            ...task.properties,
            status: newStatus
          }
        };
        await updateTask(updatedTask);
        toast({
          title: "Task updated",
          description: `Task moved to ${newStatus.replace('-', ' ')}`
        });
      }
    } catch (err: any) {
      console.error('Error updating task status:', err);
      toast({
        title: "Error updating task",
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
            <div className="flex space-x-2">
              <Tabs value={groupBy} onValueChange={(value) => setGroupBy(value as GroupingType)} className="mr-4">
                <TabsList>
                  <TabsTrigger value="status" className="flex items-center gap-1">
                    <Columns className="h-4 w-4" />
                    <span className="hidden sm:inline">Status</span>
                  </TabsTrigger>
                  <TabsTrigger value="date" className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    <span className="hidden sm:inline">Date</span>
                  </TabsTrigger>
                  <TabsTrigger value="priority" className="flex items-center gap-1">
                    <span className="hidden sm:inline">Priority</span>
                  </TabsTrigger>
                  <TabsTrigger value="assignee" className="flex items-center gap-1">
                    <span className="hidden sm:inline">Assignee</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Tabs value={viewType} onValueChange={(value) => setViewType(value as ViewType)}>
                <TabsList>
                  <TabsTrigger value="kanban" className="flex items-center gap-1">
                    <Columns className="h-4 w-4" />
                    <span className="hidden sm:inline">Board</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center gap-1">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">List</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button 
                size="sm" 
                onClick={handleAddTask}
                disabled={!goalId}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!goalId ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No goal selected. Please select a goal from the Goals page to manage tasks.
              </div>
            ) : (
              <>
                {viewType === 'kanban' && (
                  <KanbanBoard 
                    tasks={tasks}
                    isLoading={isLoading}
                    groupBy={groupBy}
                    onEditTask={handleEditTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                  />
                )}
                
                {viewType === 'list' && (
                  <ListView
                    tasks={tasks}
                    isLoading={isLoading}
                    groupBy={groupBy}
                    onEditTask={handleEditTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                  />
                )}
              </>
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
