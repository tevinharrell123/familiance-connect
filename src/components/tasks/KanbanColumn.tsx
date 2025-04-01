import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { ChoreCard } from './ChoreCard';
import { GoalTask } from '@/types/tasks';
import { Chore } from '@/types/chores';
import { FamilyGoal } from '@/types/goals';
import { Plus, MoreHorizontal, Check, X } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  onEditColumn?: (columnId: string, newTitle: string) => void;
  onDeleteColumn?: (columnId: string) => void;
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
  onAddChore,
  onEditColumn,
  onDeleteColumn
}: KanbanColumnProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addItemType, setAddItemType] = useState<'task' | 'chore'>('task');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const isChoreCompletedToday = (chore: Chore) => {
    const today = new Date().toISOString().split('T')[0];
    return chore.completed_dates.includes(today);
  };

  const getGoalTitle = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.title || '';
  };

  const handleAddItem = (type: 'task' | 'chore') => {
    setAddItemType(type);
    setAddDialogOpen(true);
  };

  const handleAddTask = async (data: any): Promise<void> => {
    if (onAddTask) {
      onAddTask({
        ...data,
        completed: false
      });
    }
    setAddDialogOpen(false);
    return Promise.resolve();
  };

  const handleAddChore = async (data: any): Promise<void> => {
    if (onAddChore) {
      onAddChore({
        ...data,
        completed_dates: []
      });
    }
    setAddDialogOpen(false);
    return Promise.resolve();
  };

  const handleSaveTitle = () => {
    if (onEditColumn && editedTitle.trim() !== '') {
      onEditColumn(column.id, editedTitle);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(column.title);
    setIsEditing(false);
  };

  const handleDeleteColumn = () => {
    if (onDeleteColumn) {
      onDeleteColumn(column.id);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div className="flex flex-col h-full border-r bg-muted/10">
      <div className="flex justify-between items-center p-4 border-b bg-muted/30">
        {isEditing ? (
          <div className="flex items-center space-x-1 w-full">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="h-7 text-sm"
              autoFocus
            />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveTitle}>
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <h3 className="font-semibold text-sm uppercase tracking-wider truncate">{column.title}</h3>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              Edit Column
            </DropdownMenuItem>
            {onDeleteColumn && (
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Column
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {column.items.map(item => {
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
          <div className="flex flex-col sm:flex-row gap-2">
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this column? This action cannot be undone and any tasks or chores in this column will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (onDeleteColumn) {
                  onDeleteColumn(column.id);
                }
                setDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
