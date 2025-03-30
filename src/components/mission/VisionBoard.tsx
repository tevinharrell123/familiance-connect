
import React from 'react';
import { FamilyGoal } from '@/types/goals';
import { GoalCard } from './GoalCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface VisionBoardProps {
  goals: FamilyGoal[];
  isLoading: boolean;
  onGoalClick: (goal: FamilyGoal) => void;
}

export const VisionBoard: React.FC<VisionBoardProps> = ({ goals, isLoading, onGoalClick }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <Skeleton className="h-32 w-full rounded-md mb-2" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <p className="text-muted-foreground mb-2">No goals added yet</p>
        <p className="text-sm">Add goals to see them on your vision board</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[70vh] pr-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {goals.map((goal) => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
            onClick={onGoalClick}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
