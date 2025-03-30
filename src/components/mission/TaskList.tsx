
import React from 'react';
import { GoalTask } from '@/types/tasks';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Check, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTaskActions } from '@/hooks/mission/useTaskActions';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: GoalTask[];
  isLoading: boolean;
  onEdit: (task: GoalTask) => void;
  onToggle: (task: GoalTask) => void;
  onDelete: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  onEdit,
  onToggle,
  onDelete
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 border rounded-md">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <div className="space-y-2 flex-grow">
              <Skeleton className="h-4 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        No tasks created yet. Add tasks or use "Generate Tasks" to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className={cn(
            "flex items-start p-3 border rounded-md hover:bg-muted/30 transition-colors",
            task.completed ? "bg-muted/20 border-muted" : ""
          )}
        >
          <Checkbox 
            checked={task.completed}
            onCheckedChange={() => onToggle(task)}
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
            
            <div className="flex items-center mt-2 space-x-4 text-xs text-muted-foreground">
              {task.target_date && (
                <span className="flex items-center">
                  Due: {format(new Date(task.target_date), 'MMM d, yyyy')}
                </span>
              )}
              
              {task.assigned_to && (
                <span className="flex items-center">
                  Assigned to: 
                  <span className="flex items-center ml-1">
                    <Avatar className="h-4 w-4 mr-1">
                      <AvatarFallback className="text-[8px]">
                        {task.assigned_to_name ? task.assigned_to_name.substring(0, 2).toUpperCase() : '?'}
                      </AvatarFallback>
                    </Avatar>
                    {task.assigned_to_name || 'Unknown'}
                  </span>
                </span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button
              variant="ghost" 
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit(task)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            
            <Button
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
