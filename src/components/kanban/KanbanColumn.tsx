
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Edit, Plus } from 'lucide-react';
import { KanbanItem } from './KanbanItem';
import { GoalTask } from '@/types/tasks';
import { Chore } from '@/types/chores';
import { Badge } from '@/components/ui/badge';

type KanbanColumnProps = {
  id: string;
  title: string;
  items: (GoalTask | Chore)[];
  onItemDrop: (itemId: string, fromColumnId: string, toColumnId: string) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onAddItem?: () => void;
};

export function KanbanColumn({
  id,
  title,
  items,
  onItemDrop,
  onDelete,
  onEdit,
  onAddItem
}: KanbanColumnProps) {
  const [isDraggingOver, setIsDraggingOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const itemId = e.dataTransfer.getData('text/plain');
    const fromColumnId = e.dataTransfer.getData('fromColumn');
    
    if (itemId && fromColumnId) {
      onItemDrop(itemId, fromColumnId, id);
    }
  };

  return (
    <Card 
      className={`h-full flex flex-col rounded-lg ${isDraggingOver ? 'ring-2 ring-purple-500' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader className="px-3 py-2 border-b flex-shrink-0 bg-gray-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium truncate flex-1 flex items-center">
            {title} 
            <Badge className="ml-2 bg-gray-200 text-gray-700 border-0">
              {items.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-1">
            {onAddItem && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAddItem}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 overflow-hidden flex-1 bg-gray-50">
        <ScrollArea className="h-full pr-1">
          <div className="space-y-2 p-0.5">
            {items.length === 0 ? (
              <div className="text-xs text-center py-4 text-muted-foreground">
                No items
              </div>
            ) : (
              items.map((item) => (
                <KanbanItem 
                  key={item.id} 
                  item={item} 
                  columnId={id} 
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
