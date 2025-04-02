
import React from 'react';
import { GoalTask } from '@/types/tasks';
import { format, isToday, isThisWeek, isPast, isFuture } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar, AlertCircle, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type GroupingType = 'status' | 'date' | 'priority' | 'assignee' | 'custom';

interface CustomColumn {
  id: string;
  label: string;
}

interface ListViewProps {
  tasks: GoalTask[];
  isLoading: boolean;
  groupBy: GroupingType;
  customColumns?: CustomColumn[];
  onEditTask: (task: GoalTask) => void;
  onToggleTask: (task: GoalTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  isLoading,
  groupBy,
  customColumns = [],
  onEditTask,
  onToggleTask,
  onDeleteTask
}) => {
  // Define groups based on groupBy type
  const getGroups = (): { id: string; label: string }[] => {
    switch (groupBy) {
      case 'status':
        return [
          { id: 'todo', label: 'To Do' },
          { id: 'in-progress', label: 'In Progress' },
          { id: 'done', label: 'Done' }
        ];
      case 'date':
        return [
          { id: 'today', label: 'Today' },
          { id: 'this-week', label: 'This Week' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'no-date', label: 'No Date' },
        ];
      case 'priority':
        return [
          { id: 'high', label: 'High Priority' },
          { id: 'medium', label: 'Medium Priority' },
          { id: 'low', label: 'Low Priority' },
        ];
      case 'assignee':
        // For assignee, we would ideally generate this dynamically based on available assignees
        // For now, we'll create a group for assigned and unassigned
        return [
          { id: 'assigned', label: 'Assigned' },
          { id: 'unassigned', label: 'Unassigned' }
        ];
      case 'custom':
        return customColumns;
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
      case 'custom':
        // For custom groups, we'll use the task status to determine which group it belongs to
        // In a real app, you might want to store custom group assignments separately
        const customGroupIndex = customColumns.findIndex(col => col.id === groupId);
        if (customGroupIndex === 0) { // First group (To Do)
          return tasks.filter(task => task.status === 'todo');
        } else if (customGroupIndex === customColumns.length - 1) { // Last group (Done)
          return tasks.filter(task => task.status === 'done');
        } else if (customGroupIndex === 1) { // Second group (In Progress)
          return tasks.filter(task => task.status === 'in-progress');
        } else {
          // For additional groups, we don't have a direct mapping
          return [];
        }
      default:
        return [];
    }
  };

  const groups = getGroups();

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map(i => (
          <div key={i}>
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map(j => (
                <Skeleton key={j} className="h-16 w-full rounded-md" />
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
      case 'high': return 'text-red-700';
      case 'medium': return 'text-yellow-700';
      case 'low': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {groups.map(group => {
        const groupTasks = filterTasksByGroup(group.id);
        
        return (
          <div key={group.id}>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              {group.label}
              <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">
                {groupTasks.length}
              </span>
            </h3>
            
            {groupTasks.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-md">
                No tasks in this group
              </div>
            ) : (
              <div className="divide-y">
                {groupTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={cn(
                      "py-3 px-4 hover:bg-muted/20 rounded-md transition-colors",
                      task.completed ? "bg-muted/10" : ""
                    )}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          checked={task.completed}
                          onCheckedChange={() => onToggleTask(task)}
                          className="mt-1"
                        />
                        
                        <div>
                          <h4 className={cn(
                            "text-base font-medium",
                            task.completed ? "line-through text-muted-foreground" : ""
                          )}>
                            {task.title}
                          </h4>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-3 mt-2">
                            {task.properties.priority && (
                              <div className="flex items-center text-xs">
                                <AlertCircle className={cn("h-3 w-3 mr-1", getPriorityColor(task.properties.priority))} />
                                <span className={getPriorityColor(task.properties.priority)}>
                                  {task.properties.priority.charAt(0).toUpperCase() + task.properties.priority.slice(1)}
                                </span>
                              </div>
                            )}
                            
                            {task.target_date && (
                              <div className="flex items-center text-xs text-blue-700">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{format(new Date(task.target_date), 'MMM d, yyyy')}</span>
                              </div>
                            )}
                            
                            {task.assigned_to && (
                              <div className="flex items-center text-xs">
                                <User className="h-3 w-3 mr-1" />
                                <span>{task.assigned_to_name || 'Unknown'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEditTask(task)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
