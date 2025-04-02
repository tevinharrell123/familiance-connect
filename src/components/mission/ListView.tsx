
import React from 'react';
import { GoalTask } from '@/types/tasks';
import { format, isToday, isThisWeek, isPast, isFuture } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Clock, AlertCircle, Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type GroupingType = 'status' | 'date' | 'priority' | 'assignee';

interface ListViewProps {
  tasks: GoalTask[];
  isLoading: boolean;
  groupBy: GroupingType;
  onEditTask: (task: GoalTask) => void;
  onToggleTask: (task: GoalTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  isLoading,
  groupBy,
  onEditTask,
  onToggleTask,
  onDeleteTask
}) => {
  // Define groups based on groupBy type
  const getGroups = (): { id: string; label: string; icon?: React.ReactNode }[] => {
    switch (groupBy) {
      case 'status':
        return [
          { id: 'todo', label: 'To Do', icon: <Clock className="h-4 w-4 text-slate-400" /> },
          { id: 'in-progress', label: 'In Progress', icon: <Clock className="h-4 w-4 text-blue-400" /> },
          { id: 'done', label: 'Done', icon: <CheckCircle2 className="h-4 w-4 text-green-400" /> }
        ];
      case 'date':
        return [
          { id: 'today', label: 'Today', icon: <Calendar className="h-4 w-4 text-blue-400" /> },
          { id: 'this-week', label: 'This Week', icon: <Calendar className="h-4 w-4 text-purple-400" /> },
          { id: 'upcoming', label: 'Upcoming', icon: <Calendar className="h-4 w-4 text-orange-400" /> },
          { id: 'no-date', label: 'No Date', icon: <Calendar className="h-4 w-4 text-gray-400" /> },
        ];
      case 'priority':
        return [
          { id: 'high', label: 'High Priority', icon: <AlertCircle className="h-4 w-4 text-red-400" /> },
          { id: 'medium', label: 'Medium Priority', icon: <AlertCircle className="h-4 w-4 text-yellow-400" /> },
          { id: 'low', label: 'Low Priority', icon: <AlertCircle className="h-4 w-4 text-green-400" /> },
        ];
      case 'assignee':
        // For assignee, we would ideally generate this dynamically based on available assignees
        // For now, we'll create a column for assigned and unassigned
        return [
          { id: 'assigned', label: 'Assigned' },
          { id: 'unassigned', label: 'Unassigned' }
        ];
      default:
        return [
          { id: 'todo', label: 'To Do' },
          { id: 'in-progress', label: 'In Progress' },
          { id: 'done', label: 'Done' }
        ];
    }
  };

  // Filter tasks based on group and groupBy
  const filterTasksByGroup = (groupId: string): GoalTask[] => {
    if (isLoading) return [];

    switch (groupBy) {
      case 'status':
        return tasks.filter(task => task.status === groupId);
      case 'date':
        return tasks.filter(task => {
          if (!task.target_date && groupId === 'no-date') return true;
          if (!task.target_date) return false;
          
          const targetDate = new Date(task.target_date);
          
          if (groupId === 'today') return isToday(targetDate);
          if (groupId === 'this-week') return isThisWeek(targetDate) && !isToday(targetDate);
          if (groupId === 'upcoming') return isFuture(targetDate) && !isThisWeek(targetDate);
          
          return false;
        });
      case 'priority':
        return tasks.filter(task => task.properties.priority === groupId);
      case 'assignee':
        if (groupId === 'assigned') {
          return tasks.filter(task => task.assigned_to !== null);
        } else {
          return tasks.filter(task => task.assigned_to === null);
        }
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-md shadow-sm border p-4">
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map(j => (
                <Skeleton key={j} className="h-12 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No tasks created yet. Add tasks to get started.
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groups = getGroups();

  return (
    <Accordion type="multiple" defaultValue={groups.map(g => g.id)} className="space-y-4">
      {groups.map(group => {
        const groupTasks = filterTasksByGroup(group.id);
        if (groupTasks.length === 0) return null;
        
        return (
          <AccordionItem key={group.id} value={group.id} className="border rounded-md overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:bg-muted/20 hover:no-underline">
              <div className="flex items-center">
                {group.icon && <span className="mr-2">{group.icon}</span>}
                <span className="font-medium text-sm">{group.label}</span>
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {groupTasks.length}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0 pt-0 pb-0">
              <div className="border-t divide-y">
                {groupTasks.map(task => (
                  <div 
                    key={task.id}
                    className={cn(
                      "p-4 hover:bg-muted/10 flex justify-between items-start",
                      task.completed ? "bg-muted/5" : ""
                    )}
                  >
                    <div className="flex items-start flex-grow mr-2">
                      <Checkbox 
                        checked={task.completed}
                        onCheckedChange={() => onToggleTask(task)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-grow">
                        <p className={cn(
                          "font-medium text-sm",
                          task.completed ? "line-through text-muted-foreground" : ""
                        )}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {task.properties.priority && (
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full border",
                              getPriorityColor(task.properties.priority)
                            )}>
                              {task.properties.priority.charAt(0).toUpperCase() + task.properties.priority.slice(1)}
                            </span>
                          )}
                          
                          {task.target_date && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              {format(new Date(task.target_date), 'MMM d')}
                            </span>
                          )}
                          
                          {task.assigned_to && (
                            <span className="flex items-center text-xs">
                              <Avatar className="h-4 w-4 mr-1">
                                <AvatarFallback className="text-[8px]">
                                  {task.assigned_to_name ? task.assigned_to_name.substring(0, 2).toUpperCase() : '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate max-w-[120px]">
                                {task.assigned_to_name || 'Unknown'}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 shrink-0">
                      <Button
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onEditTask(task)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      
                      <Button
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
