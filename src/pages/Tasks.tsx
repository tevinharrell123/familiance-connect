
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { ChoreDialog } from '@/components/tasks/ChoreDialog';
import { useTasks } from '@/hooks/mission/useTasks';
import { useTaskActions } from '@/hooks/mission/useTaskActions';
import { useChores } from '@/hooks/mission/useChores';
import { useChoreActions } from '@/hooks/mission/useChoreActions';
import { useGoals } from '@/hooks/mission/useGoals';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { GoalTask } from '@/types/tasks';
import { Chore } from '@/types/chores';
import { Calendar, ChevronDown, Layout, Plus, Trophy, Users } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { ChoresWeeklyView } from '@/components/tasks/ChoresWeeklyView';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_STATUSES } from '@/types/tasks';
import { toast } from '@/components/ui/use-toast';

export default function Tasks() {
  useRequireAuth();
  
  // State for dialogs
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isChoreDialogOpen, setIsChoreDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GoalTask | null>(null);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [initialStatus, setInitialStatus] = useState<string | undefined>(undefined);
  
  // State for content views
  const [contentView, setContentView] = useState<'tasks' | 'chores'>('tasks');
  
  // Load data
  const { tasks, refreshTasks, isLoading: tasksLoading } = useTasks();
  const { chores, refreshChores, isLoading: choresLoading } = useChores();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { members, isLoading: membersLoading } = useFamilyMembers();
  
  // Action hooks
  const { createTask, updateTask, toggleTaskCompletion, deleteTask } = useTaskActions(refreshTasks);
  const { 
    createChore, updateChore, markChoreCompleted, deleteChore 
  } = useChoreActions(refreshChores);
  
  // Handlers for task operations
  const handleCreateTask = async (data: any) => {
    try {
      // Set default status if coming from a kanban column
      if (initialStatus && !data.properties) {
        data.properties = { 
          status: initialStatus, 
          priority: 'medium' 
        };
      }
      
      await createTask({
        ...data,
        completed: false
      });
      
      toast({
        title: "Task created",
        description: "Your task has been successfully created"
      });
    } catch (error) {
      toast({
        title: "Error creating task",
        description: "There was a problem creating your task",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    
    try {
      await updateTask({
        ...editingTask,
        ...data
      });
      
      setEditingTask(null);
      
      toast({
        title: "Task updated",
        description: "Your task has been successfully updated"
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "There was a problem updating your task",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleTaskCompletion = async (task: GoalTask) => {
    try {
      // If completing a task, also update its status to Done
      let updatedTask = { ...task, completed: !task.completed };
      
      if (!task.completed) {
        // We're completing the task, set status to Done
        if (!updatedTask.properties) {
          updatedTask.properties = { status: 'Done', priority: 'medium' };
        } else {
          updatedTask.properties.status = 'Done';
        }
      }
      
      await updateTask(updatedTask);
      
      toast({
        title: updatedTask.completed ? "Task completed" : "Task reopened",
        description: updatedTask.completed 
          ? "Your task has been marked as complete" 
          : "Your task has been reopened"
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "There was a problem updating your task status",
        variant: "destructive"
      });
    }
  };
  
  const handleMoveTask = async (task: GoalTask, newStatus: string) => {
    try {
      await updateTask(task);
      
      toast({
        title: "Task updated",
        description: `Task moved to ${newStatus}`
      });
    } catch (error) {
      toast({
        title: "Error moving task",
        description: "There was a problem moving your task",
        variant: "destructive"
      });
      
      // Refresh tasks to revert the UI to the correct state
      refreshTasks();
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      
      toast({
        title: "Task deleted",
        description: "Your task has been successfully deleted"
      });
    } catch (error) {
      toast({
        title: "Error deleting task",
        description: "There was a problem deleting your task",
        variant: "destructive"
      });
    }
  };
  
  // Handlers for chore operations
  const handleCreateChore = async (data: any) => {
    try {
      await createChore({
        ...data,
        completed_dates: []
      });
      
      toast({
        title: "Chore created",
        description: "Your chore has been successfully created"
      });
    } catch (error) {
      toast({
        title: "Error creating chore",
        description: "There was a problem creating your chore",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateChore = async (data: any) => {
    if (!editingChore) return;
    
    try {
      await updateChore({
        ...editingChore,
        ...data
      });
      
      setEditingChore(null);
      
      toast({
        title: "Chore updated",
        description: "Your chore has been successfully updated"
      });
    } catch (error) {
      toast({
        title: "Error updating chore",
        description: "There was a problem updating your chore",
        variant: "destructive"
      });
    }
  };
  
  const handleMarkChoreCompleted = async (chore: Chore) => {
    try {
      await markChoreCompleted(chore);
      
      toast({
        title: "Chore completed",
        description: "Your chore has been marked as complete for today"
      });
    } catch (error) {
      toast({
        title: "Error completing chore",
        description: "There was a problem marking your chore as complete",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteChore = async (choreId: string) => {
    try {
      await deleteChore(choreId);
      
      toast({
        title: "Chore deleted",
        description: "Your chore has been successfully deleted"
      });
    } catch (error) {
      toast({
        title: "Error deleting chore",
        description: "There was a problem deleting your chore",
        variant: "destructive"
      });
    }
  };
  
  // Calculate points data for the scoreboard
  const memberPoints = members?.map(member => {
    const completedTasks = tasks.filter(
      task => task.assigned_to === member.user_id && task.completed
    ).length;
    
    const completedChores = chores.filter(chore => {
      if (chore.assigned_to !== member.user_id) return false;
      const today = new Date().toISOString().split('T')[0];
      return chore.completed_dates.includes(today);
    }).reduce((sum, chore) => sum + chore.points, 0);
    
    return {
      id: member.user_id,
      name: member.user_profiles?.full_name || 'Unnamed',
      avatar: member.user_profiles?.avatar_url,
      points: completedTasks + completedChores
    };
  }).sort((a, b) => b.points - a.points) || [];
  
  // Function to handle adding a new task, potentially with a preset status
  const handleAddTask = (status?: string) => {
    setInitialStatus(status);
    setEditingTask(null);
    setIsTaskDialogOpen(true);
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks & Chores</h1>
            <p className="text-muted-foreground">
              Manage your family's tasks and chores in one place
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleAddTask()}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
            <Button variant="outline" onClick={() => setIsChoreDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Chore
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <Tabs value={contentView} onValueChange={(v) => setContentView(v as any)} className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="tasks">
                  <Layout className="h-4 w-4 mr-2" />
                  Tasks Board
                </TabsTrigger>
                <TabsTrigger value="chores">
                  <Calendar className="h-4 w-4 mr-2" />
                  Chores
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="tasks" className="mt-0">
                <TaskBoard 
                  tasks={tasks}
                  goals={goals}
                  onEditTask={(task) => {
                    setEditingTask(task);
                    setIsTaskDialogOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                  onCompleteTask={handleToggleTaskCompletion}
                  onMoveTask={handleMoveTask}
                  onAddTask={handleAddTask}
                />
              </TabsContent>
              
              <TabsContent value="chores" className="mt-0">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Weekly Chores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChoresWeeklyView
                      chores={chores}
                      onComplete={handleMarkChoreCompleted}
                      onEdit={(chore) => {
                        setEditingChore(chore);
                        setIsChoreDialogOpen(true);
                      }}
                      onDelete={handleDeleteChore}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Scoreboard */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                  Family Scoreboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberPoints.map((member, index) => (
                    <div key={member.id} className="flex items-center">
                      <div className="flex items-center flex-1">
                        <div className="relative mr-3">
                          {index === 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs text-white">
                              👑
                            </div>
                          )}
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                            {member.name.substring(0, 2).toUpperCase()}
                          </div>
                        </div>
                        <div className="truncate">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.points === 1 ? '1 point' : `${member.points} points`}
                          </p>
                        </div>
                      </div>
                      <Badge className="ml-auto" variant={index === 0 ? "default" : "outline"}>
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                  
                  {memberPoints.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Complete tasks and chores to earn points!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg mt-6">
              <CardHeader className="pb-3">
                <CardTitle>Status Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span>Pending Tasks</span>
                    </div>
                    <Badge variant="outline">{tasks.filter(t => !t.completed).length}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <span>Today's Chores</span>
                    </div>
                    <Badge variant="outline">
                      {chores.filter(c => {
                        const today = new Date();
                        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                        return c.weekdays.includes(dayName as any);
                      }).length}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                        <Users className="h-4 w-4" />
                      </div>
                      <span>Family Members</span>
                    </div>
                    <Badge variant="outline">{members?.length || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Task dialog */}
      <TaskDialog
        isOpen={isTaskDialogOpen}
        onClose={() => {
          setIsTaskDialogOpen(false);
          setEditingTask(null);
          setInitialStatus(undefined);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        defaultValues={{
          ...editingTask,
          properties: editingTask?.properties || {
            status: initialStatus || 'To Do',
            priority: 'medium'
          }
        }}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      />
      
      {/* Chore dialog */}
      <ChoreDialog
        isOpen={isChoreDialogOpen}
        onClose={() => {
          setIsChoreDialogOpen(false);
          setEditingChore(null);
        }}
        onSubmit={editingChore ? handleUpdateChore : handleCreateChore}
        defaultValues={editingChore || undefined}
        title={editingChore ? 'Edit Chore' : 'Create New Chore'}
      />
    </MainLayout>
  );
}
