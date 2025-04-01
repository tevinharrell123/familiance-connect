
import React, { useState, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { GoalTask } from '@/types/tasks';
import { Chore } from '@/types/chores';
import { GroupByOption, TaskStatus } from '@/types/tasks';
import { ChoreGroupByOption, ChoreStatus } from '@/types/chores';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

type KanbanItem = GoalTask | Chore;

type KanbanBoardProps = {
  items: KanbanItem[];
  type: 'tasks' | 'chores';
  groupBy: GroupByOption | ChoreGroupByOption;
  goals?: any[];
  members?: any[];
  onItemUpdate?: (item: KanbanItem) => void;
  onColumnCreate?: (title: string) => void;
  onColumnDelete?: (columnId: string) => void;
  onColumnEdit?: (columnId: string, newTitle: string) => void;
};

export function KanbanBoard({ 
  items, 
  type, 
  groupBy, 
  goals, 
  members,
  onItemUpdate,
  onColumnCreate,
  onColumnDelete,
  onColumnEdit
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<{ id: string; title: string; items: KanbanItem[] }[]>([]);
  const [orphanedItems, setOrphanedItems] = useState<KanbanItem[]>([]);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false);
  const [isEditColumnDialogOpen, setIsEditColumnDialogOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [editingColumn, setEditingColumn] = useState<{ id: string; title: string } | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const boardRef = React.useRef<HTMLDivElement>(null);

  // Group items by the selected property
  useEffect(() => {
    const getItemProperty = (item: KanbanItem): string => {
      if (groupBy === 'assigned_to') {
        return item.assigned_to || 'unassigned';
      } else if (groupBy === 'goal_id' && 'goal_id' in item) {
        return item.goal_id;
      } else if (groupBy === 'weekdays' && 'weekdays' in item) {
        return item.weekdays.join(',') || 'no-days';
      } else if (groupBy === 'status') {
        return item.status || 'todo';
      } else if (item.properties && groupBy in item.properties) {
        return item.properties[groupBy] || 'none';
      }
      return 'unsorted';
    };

    // Get unique column values based on groupBy
    const uniqueValues = new Set<string>();
    items.forEach(item => {
      const value = getItemProperty(item);
      uniqueValues.add(value);
    });

    // Create columns
    const newColumns = Array.from(uniqueValues).map(value => {
      // Format the column title based on the property
      let title = value;
      if (groupBy === 'assigned_to') {
        const member = members?.find(m => m.user_id === value);
        title = member ? member.user_profiles?.full_name || 'Unnamed' : 'Unassigned';
      } else if (groupBy === 'goal_id') {
        const goal = goals?.find(g => g.id === value);
        title = goal ? goal.title : 'No Goal';
      } else if (groupBy === 'status') {
        // Format status value for better display
        title = value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ');
      }

      return {
        id: value,
        title,
        items: items.filter(item => getItemProperty(item) === value)
      };
    });

    setColumns(newColumns);
    setOrphanedItems([]);
  }, [items, groupBy, goals, members]);

  const handleItemDrop = (itemId: string, fromColumnId: string, toColumnId: string) => {
    // Find the item
    const fromColumn = columns.find(col => col.id === fromColumnId);
    if (!fromColumn) return;

    const itemIndex = fromColumn.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    const item = fromColumn.items[itemIndex];
    
    // Create updated item with new property
    const updatedItem = { ...item };
    
    if (groupBy === 'assigned_to') {
      updatedItem.assigned_to = toColumnId === 'unassigned' ? null : toColumnId;
    } else if (groupBy === 'status') {
      updatedItem.status = toColumnId as any;
      if (type === 'tasks' && toColumnId === 'done') {
        (updatedItem as GoalTask).completed = true;
      } else if (type === 'tasks') {
        (updatedItem as GoalTask).completed = false;
      }
    } else if (groupBy === 'goal_id' && 'goal_id' in updatedItem) {
      (updatedItem as GoalTask).goal_id = toColumnId;
    } else {
      // Handle other property types
      if (!updatedItem.properties) {
        updatedItem.properties = {};
      }
      updatedItem.properties[groupBy] = toColumnId;
    }
    
    // Call the update handler
    if (onItemUpdate) {
      onItemUpdate(updatedItem);
    }
    
    // Update local state for immediate UI feedback
    const newColumns = columns.map(col => {
      if (col.id === fromColumnId) {
        return {
          ...col,
          items: col.items.filter(i => i.id !== itemId)
        };
      }
      if (col.id === toColumnId) {
        return {
          ...col,
          items: [...col.items, updatedItem]
        };
      }
      return col;
    });
    
    setColumns(newColumns);
  };

  const handleColumnCreate = () => {
    if (!newColumnTitle.trim()) return;
    
    if (onColumnCreate) {
      onColumnCreate(newColumnTitle);
    }
    
    // Create a new column locally
    setColumns([
      ...columns,
      {
        id: newColumnTitle.toLowerCase().replace(/\s+/g, '_'),
        title: newColumnTitle,
        items: []
      }
    ]);
    
    setNewColumnTitle('');
    setIsAddColumnDialogOpen(false);
  };

  const handleColumnDelete = (columnId: string) => {
    // Move items to orphaned items collection
    const columnToDelete = columns.find(col => col.id === columnId);
    if (columnToDelete) {
      setOrphanedItems([...orphanedItems, ...columnToDelete.items]);
    }
    
    // Remove the column
    setColumns(columns.filter(col => col.id !== columnId));
    
    if (onColumnDelete) {
      onColumnDelete(columnId);
    }
  };

  const handleColumnEdit = () => {
    if (!editingColumn || !newColumnTitle.trim()) return;
    
    // Update the column title
    setColumns(columns.map(col => 
      col.id === editingColumn.id 
        ? { ...col, title: newColumnTitle } 
        : col
    ));
    
    if (onColumnEdit) {
      onColumnEdit(editingColumn.id, newColumnTitle);
    }
    
    setNewColumnTitle('');
    setEditingColumn(null);
    setIsEditColumnDialogOpen(false);
  };

  const openEditColumnDialog = (column: { id: string; title: string }) => {
    setEditingColumn(column);
    setNewColumnTitle(column.title);
    setIsEditColumnDialogOpen(true);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!boardRef.current) return;
    
    const scrollAmount = 300;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;
      
    boardRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleScroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          size="sm" 
          onClick={() => setIsAddColumnDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div 
          ref={boardRef}
          className="flex-1 overflow-x-auto pb-4 h-full" 
          style={{ scrollbarWidth: 'thin' }}
        >
          <ResizablePanelGroup 
            direction="horizontal"
            className="min-h-[500px] w-max min-w-full"
          >
            {columns.map((column, index) => (
              <React.Fragment key={column.id}>
                <ResizablePanel 
                  defaultSize={25} 
                  minSize={15}
                  className="min-w-[250px]"
                >
                  <KanbanColumn
                    id={column.id}
                    title={column.title}
                    items={column.items}
                    onItemDrop={handleItemDrop}
                    onDelete={() => handleColumnDelete(column.id)}
                    onEdit={() => openEditColumnDialog(column)}
                  />
                </ResizablePanel>
                {index < columns.length - 1 && (
                  <ResizableHandle withHandle />
                )}
              </React.Fragment>
            ))}
          </ResizablePanelGroup>
        </div>
      </div>
      
      {orphanedItems.length > 0 && (
        <div className="mt-6 border p-4 rounded-lg bg-muted/20">
          <h3 className="text-lg font-semibold mb-2">Orphaned Items</h3>
          <ScrollArea className="h-[200px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {orphanedItems.map(item => (
                <div 
                  key={item.id} 
                  className="bg-card p-3 rounded-md border shadow-sm"
                >
                  <h4 className="font-medium text-sm truncate">{item.title}</h4>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      
      {/* Add Column Dialog */}
      <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="column-title">Column Title</Label>
              <Input
                id="column-title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddColumnDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleColumnCreate}>Add Column</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Column Dialog */}
      <Dialog open={isEditColumnDialogOpen} onOpenChange={setIsEditColumnDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Column</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-column-title">Column Title</Label>
              <Input
                id="edit-column-title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditColumnDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleColumnEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
