
import React from 'react';
import { GoalTask, TaskStatus } from '@/types/tasks';
import { format, isToday, isThisWeek, isPast, isFuture } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Clock, AlertCircle, Calendar, Edit, Trash2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

type GroupingType = 'status' | 'date' | 'priority' | 'assignee';

interface KanbanBoardProps {
  tasks: GoalTask[];
  isLoading: boolean;
  groupBy: GroupingType;
  onEditTask: (task: GoalTask) => void;
  onToggleTask: (task: GoalTask) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, newStatus: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  isLoading,
  groupBy,
  onEditTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTaskStatus
}) => {
  // Define columns based on groupBy type
  const getColumns = (): { id: string; label: string; icon?: React.ReactNode }[] => {
    switch (groupBy) {
      case 'status':
        return [
          { id: 'todo', label: 'To Do', icon: <Circle className="h-4 w-4 text-slate-400" /> },
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

  // Filter tasks based on column and groupBy
  const filterTasksByColumn = (columnId: string): GoalTask[] => {
    if (isLoading) return [];

    switch (groupBy) {
      case 'status':
        return tasks.filter(task => task.status === columnId);
      case 'date':
        return tasks.filter(task => {
          if (!task.target_date && columnId === 'no-date') return true;
          if (!task.target_date) return false;
          
          const targetDate = new Date(task.target_date);
          
          if (columnId === 'today') return isToday(targetDate);
          if (columnId === 'this-week') return isThisWeek(targetDate) && !isToday(targetDate);
          if (columnId === 'upcoming') return isFuture(targetDate) && !isThisWeek(targetDate);
          
          return false;
        });
      case 'priority':
        return tasks.filter(task => task.properties.priority === columnId);
      case 'assignee':
        if (columnId === 'assigned') {
          return tasks.filter(task => task.assigned_to !== null);
        } else {
          return tasks.filter(task => task.assigned_to === null);
        }
      default:
        return [];
    }
  };

  // Handle task drag and drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.classList) {
      e.currentTarget.classList.add('bg-muted/40');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('bg-muted/40');
    }
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('bg-muted/40');
    }
    const taskId = e.dataTransfer.getData('taskId');
    
    if (groupBy === 'status') {
      onUpdateTaskStatus(taskId, columnId);
    }
    // For other groupings, handle appropriately (would need more complex logic for date/priority/assignee)
  };

  const columns = getColumns();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-md shadow-sm border p-4">
            <Skeleton className="h-6 w-28 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map(j => (
                <Skeleton key={j} className="h-24 w-full rounded-md" />
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pb-4">
      {columns.map(column => (
        <div 
          key={column.id}
          className="bg-muted/10 rounded-md shadow-sm border p-4 min-h-[12rem]"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={e => handleDrop(e, column.id)}
        >
          <div className="flex items-center mb-4">
            {column.icon && <span className="mr-2">{column.icon}</span>}
            <h3 className="font-medium text-sm">{column.label}</h3>
            <span className="ml-2 rounded-full bg-muted px-2 text-xs">
              {filterTasksByColumn(column.id).length}
            </span>
          </div>
          
          <div className="space-y-3">
            {filterTasksByColumn(column.id).map(task => (
              <div 
                key={task.id}
                className={cn(
                  "bg-card rounded-md shadow-sm border p-3 cursor-move",
                  task.completed ? "border-muted bg-muted/20" : ""
                )}
                draggable
                onDragStart={e => handleDragStart(e, task.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start">
                    <Checkbox 
                      checked={task.completed}
                      onCheckedChange={() => onToggleTask(task)}
                      className="mt-1 mr-2"
                    />
                    <div>
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
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onEditTask(task)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => onDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
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
            ))}
            
            {filterTasksByColumn(column.id).length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground bg-muted/5 border border-dashed rounded-md">
                No tasks in this column
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
