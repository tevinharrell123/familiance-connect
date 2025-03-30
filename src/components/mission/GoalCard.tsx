
import React from 'react';
import { FamilyGoal } from '@/types/goals';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CameraIcon, CheckCircle } from 'lucide-react';

interface GoalCardProps {
  goal: FamilyGoal;
  onClick: (goal: FamilyGoal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick }) => {
  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer ${goal.completed ? 'opacity-60' : ''}`}
      onClick={() => onClick(goal)}
    >
      <div className="aspect-square relative overflow-hidden">
        {goal.image_url ? (
          <img 
            src={goal.image_url} 
            alt={goal.title}
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <CameraIcon className="h-12 w-12 text-muted-foreground opacity-30" />
          </div>
        )}
        <Badge 
          variant="secondary" 
          className="absolute top-2 right-2"
        >
          {goal.category}
        </Badge>
        {goal.completed && (
          <div className="absolute top-2 left-2">
            <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{goal.title}</h3>
        {goal.target_date && (
          <p className="text-xs text-muted-foreground mt-1">
            By {format(new Date(goal.target_date), 'MMM d, yyyy')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
