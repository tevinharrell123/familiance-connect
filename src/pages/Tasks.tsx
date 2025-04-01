
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { KanbanBoard, KanbanColumn as KanbanColumnType } from '@/components/tasks/KanbanBoard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TasksList } from '@/components/tasks/TasksList';
import { ChoresWeeklyView } from '@/components/tasks/ChoresWeeklyView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { ChoreDialog } from '@/components/tasks/ChoreDialog';
import { OrphanedItemsHolder } from '@/components/tasks/OrphanedItemsHolder';
import { useTasks } from '@/hooks/mission/useTasks';
import { useTaskActions } from '@/hooks/mission/useTaskActions';
import { useChores } from '@/hooks/mission/useChores';
import { useChoreActions } from '@/hooks/mission/useChoreActions';
import { useGoals } from '@/hooks/mission/useGoals';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { GoalTask } from '@/types/tasks';
import { Chore } from '@/types/chores';
import { Calendar, KanbanSquare, List, Plus, Trophy, Users } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { toast } from '@/components/ui/use-toast';

export default function Tasks() {
  useRequireAuth();
  
  // State for dialogs
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isChoreDialogOpen, setIsChoreDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GoalTask | null>(null);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  
  // State for tabs
  const [tabView, setTabView] = useState<string>('kanban');
  
  // State for kanban board columns and orphaned items
  const [columns, setColumns] = useState<KanbanColumnType[]>([]);
  const [orphanedItems, setOrphanedItems] = useState<(GoalTask | Chore)[]>([]);
  
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
      await createTask({
        ...data,
        completed: false
      });
      toast({
        title: "Task created",
        description: "New task has been added successfully."
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateTask = async (data: any) => {
    if (!editingTask) return;
    await updateTask({
      ...editingTask,
      ...data
    });
    setEditingTask(null);
  };
  
  const handleToggleTaskCompletion = async (task: GoalTask) => {
    await toggleTaskCompletion(task);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    // Also remove from orphaned items if it exists there
    setOrphanedItems(prevItems => 
      prevItems.filter(item => 
        !('goal_id' in item) || item.id !== taskId
      )
    );
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
        description: "New chore has been added successfully."
      });
    } catch (error) {
      console.error("Error creating chore:", error);
      toast({
        title: "Error",
        description: "Failed to create chore. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateChore = async (data: any) => {
    if (!editingChore) return;
    await updateChore({
      ...editingChore,
      ...data
    });
    setEditingChore(null);
  };
  
  const handleMarkChoreCompleted = async (chore: Chore) => {
    await markChoreCompleted(chore);
  };
  
  const handleDeleteChore = async (choreId: string) => {
    await deleteChore(choreId);
    // Also remove from orphaned items if it exists there
    setOrphanedItems(prevItems => 
      prevItems.filter(item => 
        ('goal_id' in item) || item.id !== choreId
      )
    );
  };
  
  // Handler for orphaned items
  const handleMoveItemsToOrphaned = (items: (GoalTask | Chore)[]) => {
    setOrphanedItems(prevItems => [...prevItems, ...items]);
  };
  
  // Initialize default columns when data is loaded
  useEffect(() => {
    if (tasks.length > 0 || chores.length > 0) {
      // Only set columns if they haven't been set yet
      if (columns.length === 0) {
        setColumns([
          {
            id: 'to-do',
            title: 'To Do',
            items: tasks.filter(task => !task.completed),
            type: 'tasks'
          },
          {
            id: 'in-progress',
            title: 'In Progress',
            items: [],
            type: 'tasks'
          },
          {
            id: 'completed',
            title: 'Completed',
            items: tasks.filter(task => task.completed),
            type: 'tasks'
          },
          {
            id: 'daily-chores',
            title: 'Daily Chores',
            items: chores,
            type: 'chores'
          }
        ]);
      } else {
        // Update existing columns with new data
        setColumns(prevColumns => 
          prevColumns.map(column => {
            if (column.type === 'tasks') {
              if (column.id === 'completed') {
                return {
                  ...column,
                  items: tasks.filter(task => task.completed)
                };
              } else if (column.id === 'to-do') {
                return {
                  ...column,
                  items: tasks.filter(task => !task.completed)
                };
              }
            } else if (column.type === 'chores') {
              return {
                ...column,
                items: chores
              };
            }
            return column;
          })
        );
      }
    }
  }, [tasks, chores]);
  
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
  
  // Handle column operations
  const handleEditColumn = (columnId: string, newTitle: string) => {
    setColumns(prevColumns => 
      prevColumns.map(column => 
        column.id === columnId ? { ...column, title: newTitle } : column
      )
    );
    toast({
      title: "Column updated",
      description: "Column title has been updated."
    });
  };
  
  const handleDeleteColumn = (columnId: string) => {
    // Filter out the deleted column
    setColumns(prevColumns => prevColumns.filter(column => column.id !== columnId));
    toast({
      title: "Column deleted",
      description: "Column has been removed and its items have been moved to the orphaned items section."
    });
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
            <Button onClick={() => setIsTaskDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
            <Button onClick={() => setIsChoreDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Chore
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={tabView} onValueChange={setTabView} className="mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="kanban">
                  <KanbanSquare className="h-4 w-4 mr-2" />
                  Kanban Board
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="weekly">
                  <Calendar className="h-4 w-4 mr-2" />
                  Weekly View
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="kanban" className="mt-0">
                <KanbanBoard 
                  tasks={tasks}
                  chores={chores}
                  goals={goals}
                  defaultColumns={columns}
                  onCompleteTask={handleToggleTaskCompletion}
                  onEditTask={(task) => {
                    setEditingTask(task);
                    setIsTaskDialogOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                  onCompleteChore={handleMarkChoreCompleted}
                  onEditChore={(chore) => {
                    setEditingChore(chore);
                    setIsChoreDialogOpen(true);
                  }}
                  onDeleteChore={handleDeleteChore}
                  onAddTask={handleCreateTask}
                  onAddChore={handleCreateChore}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                  onMoveItemsToOrphaned={handleMoveItemsToOrphaned}
                />
                
                {orphanedItems.length > 0 && (
                  <OrphanedItemsHolder
                    items={orphanedItems}
                    goals={goals}
                    onCompleteTask={handleToggleTaskCompletion}
                    onEditTask={(task) => {
                      setEditingTask(task);
                      setIsTaskDialogOpen(true);
                    }}
                    onDeleteTask={handleDeleteTask}
                    onCompleteChore={handleMarkChoreCompleted}
                    onEditChore={(chore) => {
                      setEditingChore(chore);
                      setIsChoreDialogOpen(true);
                    }}
                    onDeleteChore={handleDeleteChore}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="list" className="mt-0">
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>All Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TasksList
                        tasks={tasks}
                        goals={goals}
                        onComplete={handleToggleTaskCompletion}
                        onEdit={(task) => {
                          setEditingTask(task);
                          setIsTaskDialogOpen(true);
                        }}
                        onDelete={handleDeleteTask}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="weekly" className="mt-0">
                <div className="space-y-6">
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
                </div>
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
                        <KanbanSquare className="h-4 w-4" />
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
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        defaultValues={editingTask || undefined}
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
