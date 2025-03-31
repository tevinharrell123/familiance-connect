
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chore } from '@/types/chores';
import { Check, Edit, Trash2, Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface ChoreCardProps {
  chore: Chore;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isCompletedToday: boolean;
}

export function ChoreCard({ chore, onComplete, onEdit, onDelete, isCompletedToday }: ChoreCardProps) {
  // Get the initials from the assigned person's name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Format the weekdays to display nicely
  const formatWeekdays = (weekdays: string[]) => {
    if (weekdays.length === 7) return 'Everyday';
    if (weekdays.length <= 3) {
      return weekdays.map(day => day.charAt(0).toUpperCase() + day.slice(1, 3)).join(', ');
    }
    return `${weekdays.length} days/week`;
  };

  return (
    <Card className={`shadow-md transition-all duration-300 h-full flex flex-col ${isCompletedToday ? 'bg-green-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold truncate">{chore.title}</CardTitle>
          <Badge variant={isCompletedToday ? "outline" : "default"} className="ml-2">
            {isCompletedToday ? "Completed Today" : formatWeekdays(chore.weekdays)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-1">
        {chore.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{chore.description}</p>
        )}
        <div className="flex items-center mt-2">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={undefined} alt={chore.assigned_to_name || 'Unassigned'} />
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {chore.assigned_to_name ? getInitials(chore.assigned_to_name) : '?'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate">{chore.assigned_to_name || 'Unassigned'}</span>
          
          <div className="ml-auto flex items-center">
            <Trophy className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-bold">{chore.points}</span>
          </div>
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
          variant={isCompletedToday ? "outline" : "default"} 
          size="sm"
          onClick={onComplete}
          disabled={isCompletedToday}
          className={`${isCompletedToday ? 'bg-green-100 text-green-800 border-green-300' : ''}`}
        >
          <Check className="h-4 w-4 mr-1" />
          {isCompletedToday ? 'Done' : 'Complete'}
        </Button>
      </CardFooter>
    </Card>
  );
}
