
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { ChoreCard } from './ChoreCard';
import { GoalTask } from '@/types/tasks';
import { Chore } from '@/types/chores';
import { FamilyGoal } from '@/types/goals';
import { Plus, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { KanbanColumn as KanbanColumnType } from './KanbanBoard';

interface KanbanColumnProps {
  column: KanbanColumnType;
  goals: FamilyGoal[];
  onCompleteTask: (task: GoalTask) => void;
  onEditTask: (task: GoalTask) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteChore: (chore: Chore) => void;
  onEditChore: (chore: Chore) => void;
  onDeleteChore: (choreId: string) => void;
  onAddTask?: () => void;
  onAddChore?: () => void;
}

export function KanbanColumn({
  column,
  goals,
  onCompleteTask,
  onEditTask,
  onDeleteTask,
  onCompleteChore,
  onEditChore,
  onDeleteChore,
  onAddTask,
  onAddChore
}: KanbanColumnProps) {
  // Check if a chore is completed today
  const isChoreCompletedToday = (chore: Chore) => {
    const today = new Date().toISOString().split('T')[0];
    return chore.completed_dates.includes(today);
  };
  
  // Find goal title by id
  const getGoalTitle = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.title || '';
  };

  // Determine which add button to show based on column type
  const handleAddItem = () => {
    if (column.type === 'tasks') {
      onAddTask?.();
    } else if (column.type === 'chores') {
      onAddChore?.();
    } else {
      // For mixed columns, we'll show a dialog with both options
      // Since we can't add multiple dialogs in the column footer, we'll use the first one
      onAddTask?.();
    }
  };

  return (
    <div className="flex flex-col h-full border-r bg-muted/10">
      <div className="flex justify-between items-center p-4 border-b bg-muted/30">
        <h3 className="font-semibold text-sm uppercase tracking-wider">{column.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Column</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete Column</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {column.items.map(item => {
            // Check if item is a task or chore
            if ('goal_id' in item) {
              // It's a task
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
              // It's a chore
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
      
      <div className="p-3 border-t mt-auto">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground"
          onClick={handleAddItem}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add {column.type === 'tasks' ? 'Task' : column.type === 'chores' ? 'Chore' : 'Item'}
        </Button>
      </div>
    </div>
  );
}
