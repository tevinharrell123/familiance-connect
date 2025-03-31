
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Chore, WeekDay } from '@/types/chores';
import { Check, Edit, Trash2, Star } from 'lucide-react';

interface ChoresWeeklyViewProps {
  chores: Chore[];
  onComplete: (chore: Chore) => void;
  onEdit: (chore: Chore) => void;
  onDelete: (choreId: string) => void;
}

export function ChoresWeeklyView({ chores, onComplete, onEdit, onDelete }: ChoresWeeklyViewProps) {
  // Get the initials from the assigned person's name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Check if a chore is completed today
  const isChoreCompletedToday = (chore: Chore) => {
    const today = new Date().toISOString().split('T')[0];
    return chore.completed_dates.includes(today);
  };

  // Get all weekdays in order
  const weekdays: WeekDay[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  // Format weekday for display
  const formatWeekday = (day: WeekDay) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <div className="space-y-6">
      {chores.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No chores found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {chores.map(chore => (
            <Card key={chore.id} className={`shadow-sm ${isChoreCompletedToday(chore) ? 'bg-green-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Chore details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold truncate">{chore.title}</h3>
                        {chore.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {chore.description}
                          </p>
                        )}
                      </div>
                      <Badge className="ml-2 shrink-0" variant="outline">
                        {chore.points} {chore.points === 1 ? 'point' : 'points'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center mt-3 mb-1">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback className="text-xs">
                          {chore.assigned_to_name ? getInitials(chore.assigned_to_name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {chore.assigned_to_name || 'Unassigned'}
                      </span>
                      <Badge variant="outline" className="ml-auto">
                        {chore.frequency}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Weekly schedule */}
                  <div className="flex-shrink-0 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4 mt-2 md:mt-0">
                    <div className="text-xs text-muted-foreground mb-2">Weekly Schedule:</div>
                    <div className="flex flex-wrap gap-1">
                      {weekdays.map(day => (
                        <div
                          key={day}
                          className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-medium ${
                            chore.weekdays.includes(day) 
                              ? 'bg-primary/80 text-primary-foreground' 
                              : 'bg-muted/40 text-muted-foreground'
                          }`}
                          title={formatWeekday(day)}
                        >
                          {day.substring(0, 1).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-row md:flex-col justify-end gap-1 mt-2 md:mt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(chore)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(chore.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={isChoreCompletedToday(chore) ? "outline" : "default"}
                      size="sm"
                      onClick={() => onComplete(chore)}
                      className={isChoreCompletedToday(chore) ? 'bg-green-100 text-green-800 border-green-300' : ''}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
