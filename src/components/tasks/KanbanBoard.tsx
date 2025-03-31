
import React, { useState } from 'react';
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from '@/components/ui/resizable';
import { KanbanColumn } from './KanbanColumn';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoalTask } from '@/types/tasks';
import { Chore } from '@/types/chores';
import { FamilyGoal } from '@/types/goals';
import { Plus, MoreHorizontal } from 'lucide-react';

export type KanbanColumn = {
  id: string;
  title: string;
  items: (GoalTask | Chore)[];
  type: 'tasks' | 'chores' | 'mixed';
};

interface KanbanBoardProps {
  tasks: GoalTask[];
  chores: Chore[];
  goals: FamilyGoal[];
  defaultColumns?: KanbanColumn[];
  onCompleteTask: (task: GoalTask) => void;
  onEditTask: (task: GoalTask) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteChore: (chore: Chore) => void;
  onEditChore: (chore: Chore) => void;
  onDeleteChore: (choreId: string) => void;
}

export function KanbanBoard({ 
  tasks, 
  chores, 
  goals,
  defaultColumns,
  onCompleteTask, 
  onEditTask, 
  onDeleteTask,
  onCompleteChore,
  onEditChore,
  onDeleteChore
}: KanbanBoardProps) {
  // Initialize columns: if defaultColumns provided, use them, otherwise create default columns
  const [columns, setColumns] = useState<KanbanColumn[]>(defaultColumns || [
    {
      id: 'todo',
      title: 'To Do',
      items: tasks.filter(task => !task.completed),
      type: 'tasks'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      items: [],
      type: 'tasks'
    },
    {
      id: 'completed',
      title: 'Completed',
      items: tasks.filter(task => task.completed),
      type: 'tasks'
    },
    {
      id: 'chores',
      title: 'Daily Chores',
      items: chores,
      type: 'chores'
    }
  ]);
  
  const [newColumnOpen, setNewColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  
  // Add a new column
  const addColumn = () => {
    if (!newColumnTitle.trim()) return;
    
    const newColumn: KanbanColumn = {
      id: `column-${Date.now()}`,
      title: newColumnTitle,
      items: [],
      type: 'mixed'
    };
    
    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setNewColumnOpen(false);
  };
  
  // Move an item between columns
  const moveItem = (itemId: string, sourceColumnId: string, targetColumnId: string, itemType: 'task' | 'chore') => {
    const sourceColumn = columns.find(col => col.id === sourceColumnId);
    const targetColumn = columns.find(col => col.id === targetColumnId);
    
    if (!sourceColumn || !targetColumn) return;
    
    const newColumns = columns.map(column => {
      if (column.id === sourceColumnId) {
        return {
          ...column,
          items: column.items.filter(item => 
            itemType === 'task' ? (item as GoalTask).id !== itemId : (item as Chore).id !== itemId
          )
        };
      }
      
      if (column.id === targetColumnId) {
        const item = sourceColumn.items.find(item => 
          itemType === 'task' ? (item as GoalTask).id === itemId : (item as Chore).id === itemId
        );
        
        if (item) {
          return {
            ...column,
            items: [...column.items, item]
          };
        }
      }
      
      return column;
    });
    
    setColumns(newColumns);
  };
  
  // Handle completion of a task
  const handleCompleteTask = (task: GoalTask) => {
    onCompleteTask(task);
    
    // If we're in a Kanban board with specific columns for completion states,
    // we should also move the task to the appropriate column
    if (task.completed && columns.some(col => col.id === 'completed')) {
      const sourceColumnId = columns.find(col => 
        col.items.some(item => 'goal_id' in item && item.id === task.id)
      )?.id;
      
      if (sourceColumnId && sourceColumnId !== 'completed') {
        moveItem(task.id, sourceColumnId, 'completed', 'task');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Task Board</h2>
        <Button size="sm" onClick={() => setNewColumnOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Column
        </Button>
      </div>
      
      <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
        {columns.map((column, index) => (
          <React.Fragment key={column.id}>
            <ResizablePanel defaultSize={100 / columns.length} minSize={20}>
              <KanbanColumn
                column={column}
                goals={goals}
                onCompleteTask={handleCompleteTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onCompleteChore={onCompleteChore}
                onEditChore={onEditChore}
                onDeleteChore={onDeleteChore}
              />
            </ResizablePanel>
            {index < columns.length - 1 && (
              <ResizableHandle withHandle />
            )}
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
      
      {/* Dialog for adding a new column */}
      <Dialog open={newColumnOpen} onOpenChange={setNewColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="column-title">Column Title</Label>
              <Input 
                id="column-title" 
                placeholder="Enter column title..." 
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewColumnOpen(false)}>Cancel</Button>
            <Button onClick={addColumn}>Add Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
