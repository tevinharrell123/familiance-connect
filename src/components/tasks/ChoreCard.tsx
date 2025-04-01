
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chore } from '@/types/chores';
import { Calendar, Check, Edit, Trash2, Star } from 'lucide-react';

interface ChoreCardProps {
  chore: Chore;
  isCompletedToday: boolean;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ChoreCard({ chore, isCompletedToday, onComplete, onEdit, onDelete }: ChoreCardProps) {
  // Get the initials from the assigned person's name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Format weekdays for display
  const formatWeekdays = (weekdays: string[]) => {
    if (weekdays.length === 7) return 'Every day';
    if (weekdays.length === 0) return 'No days set';
    
    // Abbreviate weekday names
    return weekdays.map(day => day.substring(0, 3)).join(', ');
  };

  return (
    <Card className={`shadow-md transition-all duration-300 h-full flex flex-col ${isCompletedToday ? 'bg-green-50' : ''} overflow-hidden`}>
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base font-bold line-clamp-2 break-words max-w-[75%]">
            {chore.title}
          </CardTitle>
          <Badge className="flex-shrink-0" variant="outline">
            {chore.points} {chore.points === 1 ? 'point' : 'points'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-2 px-3 flex-1 overflow-hidden">
        {chore.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2 break-words">
            {chore.description}
          </p>
        )}
        <div className="flex items-center mt-2 flex-wrap gap-2">
          <div className="flex items-center min-w-0 max-w-full">
            <Avatar className="h-6 w-6 mr-2 flex-shrink-0">
              <AvatarImage src={undefined} alt={chore.assigned_to_name || 'Unassigned'} />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {chore.assigned_to_name ? getInitials(chore.assigned_to_name) : '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">{chore.assigned_to_name || 'Unassigned'}</span>
          </div>
          
          <Badge variant="outline" className="ml-auto flex-shrink-0">
            {chore.frequency}
          </Badge>
        </div>
        
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">{formatWeekdays(chore.weekdays)}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-3 px-3 flex justify-between gap-2">
        <div className="flex-shrink-0 flex space-x-1">
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
          className={`${isCompletedToday ? 'bg-green-100 text-green-800 border-green-300' : ''} whitespace-nowrap`}
        >
          <Check className="h-4 w-4 mr-1" />
          {isCompletedToday ? 'Completed' : 'Complete'}
        </Button>
      </CardFooter>
    </Card>
  );
}
