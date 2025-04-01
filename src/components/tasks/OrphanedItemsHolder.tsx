
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from './TaskCard';
import { ChoreCard } from './ChoreCard';
import { GoalTask } from '@/types/tasks';
import { Chore } from '@/types/chores';
import { FamilyGoal } from '@/types/goals';
import { ScrollArea } from '@/components/ui/scroll-area';

interface OrphanedItemsHolderProps {
  items: (GoalTask | Chore)[];
  goals: FamilyGoal[];
  onCompleteTask: (task: GoalTask) => void;
  onEditTask: (task: GoalTask) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteChore: (chore: Chore) => void;
  onEditChore: (chore: Chore) => void;
  onDeleteChore: (choreId: string) => void;
}

export function OrphanedItemsHolder({
  items,
  goals,
  onCompleteTask,
  onEditTask,
  onDeleteTask,
  onCompleteChore,
  onEditChore,
  onDeleteChore
}: OrphanedItemsHolderProps) {
  if (items.length === 0) {
    return null;
  }

  const isChoreCompletedToday = (chore: Chore) => {
    const today = new Date().toISOString().split('T')[0];
    return chore.completed_dates.includes(today);
  };

  const getGoalTitle = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.title || '';
  };

  return (
    <Card className="shadow-md mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Items from Deleted Columns</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <ScrollArea className="max-h-[300px]">
          <div className="grid grid-cols-1 gap-3">
            {items.map(item => {
              if ('goal_id' in item) {
                const task = item as GoalTask;
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    goalTitle={getGoalTitle(task.goal_id)}
                    onComplete={() => onCompleteTask(task)}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task.id)}
                  />
                );
              } else {
                const chore = item as Chore;
                return (
                  <ChoreCard
                    key={chore.id}
                    chore={chore}
                    isCompletedToday={isChoreCompletedToday(chore)}
                    onComplete={() => onCompleteChore(chore)}
                    onEdit={() => onEditChore(chore)}
                    onDelete={() => onDeleteChore(chore.id)}
                  />
                );
              }
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
