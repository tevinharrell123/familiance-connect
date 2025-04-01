
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GoalTask } from '@/types/tasks';
import { Chore } from '@/types/chores';
import { format } from 'date-fns';
import { Calendar, Circle, CheckCircle2 } from 'lucide-react';

type KanbanItemProps = {
  item: GoalTask | Chore;
  columnId: string;
};

export function KanbanItem({ item, columnId }: KanbanItemProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.setData('fromColumn', columnId);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Determine if it's a task or chore
  const isTask = 'goal_id' in item;
  const isChore = 'weekdays' in item;

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return format(new Date(dateString), 'MMM d');
  };

  // Get completion status
  const isCompleted = isTask 
    ? item.completed 
    : (item as Chore).completed_dates?.includes(new Date().toISOString().split('T')[0]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white border rounded-lg p-3 cursor-grab select-none transition-all shadow-sm
        ${isDragging ? 'opacity-50 ring-2 ring-primary' : ''}
        hover:border-primary hover:shadow-md`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium break-words line-clamp-2">{item.title}</h3>
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        
        {item.description && (
          <p className="text-xs text-muted-foreground break-words line-clamp-2">{item.description}</p>
        )}
        
        <div className="flex flex-wrap gap-1 text-xs pt-1">
          {isTask && (item as GoalTask).target_date && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              {formatDate((item as GoalTask).target_date)}
            </Badge>
          )}
          
          {isChore && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border-purple-200">
              {(item as Chore).points} {(item as Chore).points === 1 ? 'point' : 'points'}
            </Badge>
          )}
          
          {item.assigned_to_name && (
            <div className="flex items-center gap-1 ml-auto">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] bg-purple-200">
                  {item.assigned_to_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs truncate max-w-[80px]">{item.assigned_to_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
