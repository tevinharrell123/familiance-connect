
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WeekDayBoard } from '@/components/tasks/WeekDayBoard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { ChoreDialog } from '@/components/tasks/ChoreDialog';
import { TaskCard } from '@/components/tasks/TaskCard';
import { ChoreCard } from '@/components/tasks/ChoreCard';
import { useTasks } from '@/hooks/mission/useTasks';
import { useTaskActions } from '@/hooks/mission/useTaskActions';
import { useChores } from '@/hooks/mission/useChores';
import { useChoreActions } from '@/hooks/mission/useChoreActions';
import { useGoals } from '@/hooks/mission/useGoals';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { GoalTask } from '@/types/tasks';
import { Chore } from '@/types/chores';
import { Calendar, CalendarDays, Plus, Trophy, Users } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function Tasks() {
  useRequireAuth();
  
  // State for dialogs
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isChoreDialogOpen, setIsChoreDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<GoalTask | null>(null);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  
  // State for filters
  const [filterMember, setFilterMember] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
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
    await createTask({
      ...data,
      completed: false
    });
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
  };
  
  // Handlers for chore operations
  const handleCreateChore = async (data: any) => {
    await createChore({
      ...data,
      completed_dates: []
    });
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
  };
  
  // Filter tasks and chores
  const filteredTasks = tasks.filter(task => {
    if (filterMember !== 'all' && task.assigned_to !== filterMember) return false;
    if (filterCategory !== 'all') {
      const goal = goals.find(g => g.id === task.goal_id);
      if (goal?.category !== filterCategory) return false;
    }
    return true;
  });
  
  const filteredChores = chores.filter(chore => {
    if (filterMember !== 'all' && chore.assigned_to !== filterMember) return false;
    return true;
  });
  
  // Get all unique categories from goals
  const categories = Array.from(new Set(goals.map(goal => goal.category)));
  
  // Check if a chore is completed today
  const isChoreCompletedToday = (chore: Chore) => {
    const today = new Date().toISOString().split('T')[0];
    return chore.completed_dates.includes(today);
  };
  
  // Find goal title by id
  const getGoalTitle = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.title || '';
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
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Filter by Member</label>
                  <Select value={filterMember} onValueChange={setFilterMember}>
                    <SelectTrigger>
                      <SelectValue placeholder="All members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All members</SelectItem>
                      {members?.map(member => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.user_profiles?.full_name || 'Unnamed Member'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">Filter by Category</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <WeekDayBoard 
              tasks={filteredTasks}
              chores={filteredChores}
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
                        <CalendarDays className="h-4 w-4" />
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
                        const dayName = today.toLocaleDateString('en-US', { weekday: 'lowercase' });
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
        
        <Tabs defaultValue="tasks" className="mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
            <TabsTrigger value="tasks">All Tasks</TabsTrigger>
            <TabsTrigger value="chores">All Chores</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No tasks found. Create a new task to get started!
                  </p>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          goalTitle={getGoalTitle(task.goal_id)}
                          onComplete={() => handleToggleTaskCompletion(task)}
                          onEdit={() => {
                            setEditingTask(task);
                            setIsTaskDialogOpen(true);
                          }}
                          onDelete={() => handleDeleteTask(task.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="chores" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Chores ({filteredChores.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredChores.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No chores found. Create a new chore to get started!
                  </p>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredChores.map(chore => (
                        <ChoreCard
                          key={chore.id}
                          chore={chore}
                          isCompletedToday={isChoreCompletedToday(chore)}
                          onComplete={() => handleMarkChoreCompleted(chore)}
                          onEdit={() => {
                            setEditingChore(chore);
                            setIsChoreDialogOpen(true);
                          }}
                          onDelete={() => handleDeleteChore(chore.id)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
