
import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GoalTask } from '@/types/tasks';
import { Chore, WeekDay } from '@/types/chores';
import { TaskCard } from './TaskCard';
import { ChoreCard } from './ChoreCard';
import { FamilyGoal } from '@/types/goals';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(today, { weekStartsOn: 1 }));
  
  // Week navigation handlers
  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };
  
  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };
  
  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
  };
  
  // Generate the days of the week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const day = addDays(currentWeekStart, i);
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
  
  // Find goal title by id
  const getGoalTitle = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.title || '';
  };

  // Check if a chore is completed today
  const isChoreCompletedToday = (chore: Chore) => {
    const today = new Date().toISOString().split('T')[0];
    return chore.completed_dates.includes(today);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2 bg-card p-2 rounded-lg">
        <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        
        <div className="flex items-center">
          <CalendarDays className="h-4 w-4 mr-2" />
          <span className="font-medium">
            {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </span>
          {!isSameDay(startOfWeek(today, { weekStartsOn: 1 }), currentWeekStart) && (
            <Button variant="ghost" size="sm" onClick={goToCurrentWeek} className="ml-2">
              Today
            </Button>
          )}
        </div>
        
        <Button variant="outline" size="sm" onClick={goToNextWeek}>
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Weekly Chores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dayEnum = dayNameToEnum[day.name];
              const dayChores = chores.filter(chore => chore.weekdays.includes(dayEnum));
              
              return (
                <div key={day.name} className="space-y-3">
                  <div className={`text-center p-2 rounded-md ${isSameDay(day.date, today) ? 'bg-primary/20 font-semibold' : 'bg-muted'}`}>
                    <div className="text-sm">{day.shortName}</div>
                    <div className="text-lg">{format(day.date, 'd')}</div>
                  </div>
                  
                  {dayChores.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground p-2 border border-dashed rounded-md">
                      No chores
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dayChores.map(chore => (
                        <Card key={chore.id} className={`shadow-sm ${isChoreCompletedToday(chore) ? 'bg-green-50' : ''}`}>
                          <CardContent className="p-2">
                            <div className="font-medium text-sm truncate">{chore.title}</div>
                            <div className="flex items-center justify-between mt-1">
                              <Badge variant="outline" className="text-xs">
                                {chore.points} pt
                              </Badge>
                              <div className="text-xs text-muted-foreground truncate">
                                {chore.assigned_to_name || 'Unassigned'}
                              </div>
                            </div>
                            <div className="flex justify-end mt-2">
                              <Button
                                variant={isChoreCompletedToday(chore) ? "outline" : "default"}
                                size="sm"
                                className="h-6 text-xs w-full"
                                onClick={() => onCompleteChore(chore)}
                              >
                                {isChoreCompletedToday(chore) ? 'Done' : 'Complete'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Weekly Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dayTasks = tasks.filter(task => {
                if (!task.target_date) return false;
                return isSameDay(new Date(task.target_date), day.date);
              });
              
              return (
                <div key={day.name} className="space-y-3">
                  <div className={`text-center p-2 rounded-md ${isSameDay(day.date, today) ? 'bg-primary/20 font-semibold' : 'bg-muted'}`}>
                    <div className="text-sm">{day.shortName}</div>
                    <div className="text-lg">{format(day.date, 'd')}</div>
                  </div>
                  
                  {dayTasks.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground p-2 border border-dashed rounded-md">
                      No tasks
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dayTasks.map(task => (
                        <Card key={task.id} className={`shadow-sm ${task.completed ? 'bg-green-50' : ''}`}>
                          <CardContent className="p-2">
                            <div className="font-medium text-sm truncate">{task.title}</div>
                            <div className="flex flex-col mt-1">
                              <div className="text-xs text-muted-foreground truncate">
                                {task.assigned_to_name || 'Unassigned'}
                              </div>
                              <Badge variant="outline" className="text-xs mt-1 w-fit">
                                {getGoalTitle(task.goal_id)}
                              </Badge>
                            </div>
                            <div className="flex justify-end mt-2">
                              <Button
                                variant={task.completed ? "outline" : "default"}
                                size="sm"
                                className="h-6 text-xs w-full"
                                onClick={() => onCompleteTask(task)}
                              >
                                {task.completed ? 'Done' : 'Complete'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
