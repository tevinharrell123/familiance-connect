
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
    <Card className={`shadow-md transition-all duration-300 h-full flex flex-col ${isCompletedToday ? 'bg-green-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold truncate">{chore.title}</CardTitle>
          <Badge className="ml-2" variant="outline">
            {chore.points} {chore.points === 1 ? 'point' : 'points'}
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
        </div>
        
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatWeekdays(chore.weekdays)}</span>
          <Badge variant="outline" className="ml-auto">
            {chore.frequency}
          </Badge>
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
          className={`${isCompletedToday ? 'bg-green-100 text-green-800 border-green-300' : ''}`}
        >
          <Check className="h-4 w-4 mr-1" />
          {isCompletedToday ? 'Completed' : 'Complete'}
        </Button>
      </CardFooter>
    </Card>
  );
}
