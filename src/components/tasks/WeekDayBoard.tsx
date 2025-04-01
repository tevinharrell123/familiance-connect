
import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GoalTask } from '@/types/tasks';
import { Chore, WeekDay } from '@/types/chores';
import { TaskCard } from './TaskCard';
import { ChoreCard } from './ChoreCard';
import { FamilyGoal } from '@/types/goals';

interface WeekDayBoardProps {
  tasks: GoalTask[];
  chores: Chore[];
  goals: FamilyGoal[];
  onCompleteTask: (task: GoalTask) => void;
  onEditTask: (task: GoalTask) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteChore: (chore: Chore) => void;
  onEditChore: (chore: Chore) => void;
  onDeleteChore: (choreId: string) => void;
}

export function WeekDayBoard({ 
  tasks, 
  chores, 
  goals, 
  onCompleteTask, 
  onEditTask, 
  onDeleteTask,
  onCompleteChore,
  onEditChore,
  onDeleteChore
}: WeekDayBoardProps) {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  
  // Generate the days of the week
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const day = addDays(weekStart, i);
    return {
      date: day,
      name: format(day, 'EEEE'),
      shortName: format(day, 'EEE')
    };
  });
  
  // Map JS day names to our enum values
  const dayNameToEnum: Record<string, WeekDay> = {
    'Monday': 'monday',
    'Tuesday': 'tuesday',
    'Wednesday': 'wednesday',
    'Thursday': 'thursday',
    'Friday': 'friday',
    'Saturday': 'saturday',
    'Sunday': 'sunday'
  };
  
  // Filter tasks for the selected day
  const tasksForSelectedDay = tasks.filter(task => {
    if (!task.target_date) return false;
    return isSameDay(new Date(task.target_date), selectedDay);
  });
  
  // Filter chores for the selected day
  const choresForSelectedDay = chores.filter(chore => {
    const dayEnum = dayNameToEnum[format(selectedDay, 'EEEE')];
    return chore.weekdays.includes(dayEnum);
  });
  
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

  return (
    <div className="space-y-4">
      <Tabs defaultValue={format(today, 'EEEE').toLowerCase()} className="w-full">
        <TabsList className="grid grid-cols-7 mb-4">
          {weekDays.map((day) => (
            <TabsTrigger 
              key={day.name} 
              value={day.name.toLowerCase()}
              onClick={() => setSelectedDay(day.date)}
              className={`flex flex-col items-center ${isSameDay(day.date, today) ? 'bg-primary/20' : ''}`}
            >
              <span className="text-xs font-medium">{day.shortName}</span>
              <span className={`text-lg font-bold ${isSameDay(day.date, today) ? 'text-primary' : ''}`}>
                {format(day.date, 'd')}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {weekDays.map((day) => (
          <TabsContent 
            key={day.name} 
            value={day.name.toLowerCase()}
            className="mt-0"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">
                  {format(day.date, 'EEEE, MMMM d')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Tasks section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tasks</h3>
                    {tasksForSelectedDay.length === 0 ? (
                      <p className="text-muted-foreground">No tasks scheduled for this day.</p>
                    ) : (
                      <ScrollArea className="h-[250px] pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {tasksForSelectedDay.map(task => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              goalTitle={getGoalTitle(task.goal_id)}
                              onComplete={() => onCompleteTask(task)}
                              onEdit={() => onEditTask(task)}
                              onDelete={() => onDeleteTask(task.id)}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                  
                  {/* Chores section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Chores</h3>
                    {choresForSelectedDay.length === 0 ? (
                      <p className="text-muted-foreground">No chores scheduled for this day.</p>
                    ) : (
                      <ScrollArea className="h-[250px] pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {choresForSelectedDay.map(chore => (
                            <ChoreCard
                              key={chore.id}
                              chore={chore}
                              isCompletedToday={isChoreCompletedToday(chore)}
                              onComplete={() => onCompleteChore(chore)}
                              onEdit={() => onEditChore(chore)}
                              onDelete={() => onDeleteChore(chore.id)}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
