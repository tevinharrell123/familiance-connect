
import { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { GoalTask } from '@/types/tasks';
import { Chore, WeekDay } from '@/types/chores';
import { TaskCard } from './TaskCard';
import { ChoreCard } from './ChoreCard';
import { FamilyGoal } from '@/types/goals';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

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
    const newWeekStart = subWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newWeekStart);
  };
  
  const goToNextWeek = () => {
    const newWeekStart = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newWeekStart);
  };
  
  const goToCurrentWeek = () => {
    const newWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    setCurrentWeekStart(newWeekStart);
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
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayTasks = tasks.filter(task => {
            if (!task.target_date) return false;
            return isSameDay(new Date(task.target_date), day.date);
          });
          
          const dayChores = chores.filter(chore => {
            const dayEnum = dayNameToEnum[format(day.date, 'EEEE')];
            return chore.weekdays.includes(dayEnum);
          });
          
          return (
            <div key={day.name} className="flex flex-col h-full">
              <div className={`text-center p-2 rounded-t-lg ${isSameDay(day.date, today) ? 'bg-primary/20' : 'bg-muted/20'}`}>
                <div className="text-xs font-medium">{day.shortName}</div>
                <div className={`text-lg font-bold ${isSameDay(day.date, today) ? 'text-primary' : ''}`}>
                  {format(day.date, 'd')}
                </div>
              </div>
              
              <ScrollArea className="flex-grow h-[400px] p-1 border rounded-b-lg bg-muted/5">
                <div className="space-y-4">
                  {/* Chores section */}
                  {dayChores.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Chores</h4>
                      <div className="space-y-2">
                        {dayChores.map(chore => (
                          <div key={chore.id} className="text-xs p-2 rounded bg-card border hover:shadow-sm transition-shadow">
                            <div className="font-medium truncate">{chore.title}</div>
                            <div className="flex justify-between items-center mt-1">
                              <div className="truncate text-muted-foreground">
                                {chore.assigned_to_name || 'Unassigned'}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0" 
                                onClick={() => onCompleteChore(chore)}
                              >
                                {isChoreCompletedToday(chore) ? '✓' : '○'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Tasks section */}
                  {dayTasks.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tasks</h4>
                      <div className="space-y-2">
                        {dayTasks.map(task => (
                          <div 
                            key={task.id} 
                            className={`text-xs p-2 rounded ${task.completed ? 'bg-primary/10' : 'bg-card'} border hover:shadow-sm transition-shadow`}
                          >
                            <div className="font-medium truncate">{task.title}</div>
                            <div className="flex justify-between items-center mt-1">
                              <div className="truncate text-muted-foreground">
                                {task.assigned_to_name || 'Unassigned'}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0" 
                                onClick={() => onCompleteTask(task)}
                              >
                                {task.completed ? '✓' : '○'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {dayChores.length === 0 && dayTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">No items</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
