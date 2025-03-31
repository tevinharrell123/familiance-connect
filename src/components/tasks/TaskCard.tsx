
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GoalTask } from '@/types/tasks';
import { Calendar, Check, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: GoalTask;
  goalTitle?: string;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TaskCard({ task, goalTitle, onComplete, onEdit, onDelete }: TaskCardProps) {
  // Get the initials from the assigned person's name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className={`shadow-md transition-all duration-300 h-full flex flex-col ${task.completed ? 'bg-green-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold truncate">{task.title}</CardTitle>
          {goalTitle && (
            <Badge className="ml-2" variant="outline">
              {goalTitle}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-1">
        {task.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center mt-2">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={undefined} alt={task.assigned_to_name || 'Unassigned'} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {task.assigned_to_name ? getInitials(task.assigned_to_name) : '?'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate">{task.assigned_to_name || 'Unassigned'}</span>
          
          {task.target_date && (
            <div className="ml-auto flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm">{format(new Date(task.target_date), 'MMM d')}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex space-x-1">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onEdit}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onDelete}
            className="h-8 w-8 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant={task.completed ? "outline" : "default"} 
          size="sm"
          onClick={onComplete}
          className={`${task.completed ? 'bg-green-100 text-green-800 border-green-300' : ''}`}
        >
          <Check className="h-4 w-4 mr-1" />
          {task.completed ? 'Completed' : 'Complete'}
        </Button>
      </CardFooter>
    </Card>
  );
}
