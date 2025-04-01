
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskDialog } from './TaskDialog';
import { ChoreDialog } from './ChoreDialog';

interface KanbanColumnProps {
  column: KanbanColumnType;
  goals: FamilyGoal[];
  onCompleteTask: (task: GoalTask) => void;
  onEditTask: (task: GoalTask) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteChore: (chore: Chore) => void;
  onEditChore: (chore: Chore) => void;
  onDeleteChore: (choreId: string) => void;
  onAddTask?: (task: Omit<GoalTask, 'id' | 'created_at' | 'updated_at'>) => void;
  onAddChore?: (chore: Omit<Chore, 'id' | 'created_at' | 'updated_at'>) => void;
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addItemType, setAddItemType] = useState<'task' | 'chore'>('task');
  
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

  // Handle opening the appropriate dialog
  const handleAddItem = (type: 'task' | 'chore') => {
    setAddItemType(type);
    setAddDialogOpen(true);
  };

  // Handle adding a new task
  const handleAddTask = (data: any) => {
    if (onAddTask) {
      onAddTask({
        ...data,
        completed: false
      });
    }
    setAddDialogOpen(false);
  };

  // Handle adding a new chore
  const handleAddChore = (data: any) => {
    if (onAddChore) {
      onAddChore({
        ...data,
        completed_dates: []
      });
    }
    setAddDialogOpen(false);
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
        {column.type === 'tasks' ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground"
            onClick={() => handleAddItem('task')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        ) : column.type === 'chores' ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground"
            onClick={() => handleAddItem('chore')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Chore
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 justify-start text-muted-foreground"
              onClick={() => handleAddItem('task')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 justify-start text-muted-foreground"
              onClick={() => handleAddItem('chore')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Chore
            </Button>
          </div>
        )}
      </div>

      {/* Dialog for adding a new task or chore */}
      {addDialogOpen && addItemType === 'task' && (
        <TaskDialog
          isOpen={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onSubmit={handleAddTask}
          title="Add Task to Column"
        />
      )}

      {addDialogOpen && addItemType === 'chore' && (
        <ChoreDialog
          isOpen={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onSubmit={handleAddChore}
          title="Add Chore to Column"
        />
      )}
    </div>
  );
}
