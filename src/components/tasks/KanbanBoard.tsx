import React, { useState, useEffect } from 'react';
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
import { GoalTask, TaskProperty } from '@/types/tasks';
import { Chore } from '@/types/chores';
import { FamilyGoal } from '@/types/goals';
import { Plus, Filter, Columns } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

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
  onAddTask?: (task: Omit<GoalTask, 'id' | 'created_at' | 'updated_at'>) => void;
  onAddChore?: (chore: Omit<Chore, 'id' | 'created_at' | 'updated_at'>) => void;
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
  onDeleteChore,
  onAddTask,
  onAddChore
}: KanbanBoardProps) {
  const createDefaultColumns = (): KanbanColumn[] => {
    const hasStatusProperties = tasks.some(task => 
      task.properties?.some(prop => prop.type === 'status' && prop.value)
    );

    if (hasStatusProperties) {
      const statusValues = new Set<string>();
      tasks.forEach(task => {
        const statusProp = task.properties?.find(prop => prop.type === 'status');
        if (statusProp?.value) {
          statusValues.add(statusProp.value);
        }
      });

      const statusColumns: KanbanColumn[] = Array.from(statusValues).map(status => ({
        id: status.toLowerCase().replace(/\s+/g, '-'),
        title: status,
        items: tasks.filter(task => {
          const statusProp = task.properties?.find(prop => prop.type === 'status');
          return statusProp?.value === status;
        }),
        type: 'tasks'
      }));

      return [
        ...statusColumns,
        {
          id: 'no-status',
          title: 'No Status',
          items: tasks.filter(task => 
            !task.properties?.some(prop => prop.type === 'status' && prop.value)
          ),
          type: 'tasks'
        },
        {
          id: 'chores',
          title: 'Daily Chores',
          items: chores,
          type: 'chores'
        }
      ];
    } else {
      return [
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
      ];
    }
  };

  const [columns, setColumns] = useState<KanbanColumn[]>(defaultColumns || createDefaultColumns());
  const [columnFilterType, setColumnFilterType] = useState<'all' | 'name' | 'progress'>('all');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [progressFilter, setProgressFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [newColumnOpen, setNewColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  useEffect(() => {
    if (defaultColumns) {
      const updatedColumns = defaultColumns.map(column => {
        if (column.type === 'tasks') {
          if (column.id !== 'todo' && column.id !== 'in-progress' && column.id !== 'completed' && column.id !== 'no-status') {
            return {
              ...column,
              items: tasks.filter(task => {
                const statusProp = task.properties?.find(prop => prop.type === 'status');
                return statusProp?.value?.toLowerCase().replace(/\s+/g, '-') === column.id;
              })
            };
          } else if (column.id === 'completed') {
            return {
              ...column,
              items: tasks.filter(task => task.completed)
            };
          } else if (column.id === 'no-status') {
            return {
              ...column,
              items: tasks.filter(task => 
                !task.properties?.some(prop => prop.type === 'status' && prop.value)
              )
            };
          } else {
            return {
              ...column,
              items: tasks.filter(task => !task.completed)
            };
          }
        } else if (column.type === 'chores') {
          return {
            ...column,
            items: chores
          };
        } else {
          return {
            ...column,
            items: column.items.map(item => {
              if ('goal_id' in item) {
                const updatedTask = tasks.find(task => task.id === item.id);
                return updatedTask || item;
              } else {
                const updatedChore = chores.find(chore => chore.id === item.id);
                return updatedChore || item;
              }
            })
          };
        }
      });
      
      setColumns(updatedColumns);
    } else {
      setColumns(createDefaultColumns());
    }
  }, [tasks, chores, defaultColumns]);

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
          if (itemType === 'task') {
            const taskItem = item as GoalTask;
            const targetColumnStatus = columns.find(col => col.id === targetColumnId)?.title;
            
            if (targetColumnStatus && 
                !['To Do', 'In Progress', 'Completed', 'No Status', 'Daily Chores'].includes(targetColumnStatus)) {
              
              const updatedTask = { ...taskItem };
              
              if (updatedTask.properties) {
                const statusPropIndex = updatedTask.properties.findIndex(prop => prop.type === 'status');
                if (statusPropIndex >= 0) {
                  const updatedProperties = [...updatedTask.properties];
                  updatedProperties[statusPropIndex] = {
                    ...updatedProperties[statusPropIndex],
                    value: targetColumnStatus
                  };
                  updatedTask.properties = updatedProperties;
                } else {
                  updatedTask.properties.push({
                    id: `status_${Date.now()}`,
                    name: 'Status',
                    type: 'status',
                    value: targetColumnStatus
                  });
                }
              } else {
                updatedTask.properties = [{
                  id: `status_${Date.now()}`,
                  name: 'Status',
                  type: 'status',
                  value: targetColumnStatus
                }];
              }
              
              onEditTask(updatedTask);
              
              return {
                ...column,
                items: [...column.items, updatedTask]
              };
            }
          }
          
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

  const handleCompleteTask = (task: GoalTask) => {
    onCompleteTask(task);
    
    if (task.completed && columns.some(col => col.id === 'completed')) {
      const sourceColumnId = columns.find(col => 
        col.items.some(item => 'goal_id' in item && item.id === task.id)
      )?.id;
      
      if (sourceColumnId && sourceColumnId !== 'completed') {
        moveItem(task.id, sourceColumnId, 'completed', 'task');
      }
    }
  };

  const handleAddTaskToColumn = (columnId: string, task: Omit<GoalTask, 'id' | 'created_at' | 'updated_at'>) => {
    if (onAddTask) {
      const column = columns.find(col => col.id === columnId);
      if (column && !['todo', 'in-progress', 'completed', 'no-status', 'chores'].includes(columnId)) {
        const taskWithStatus = { ...task };
        
        if (!taskWithStatus.properties) {
          taskWithStatus.properties = [];
        }
        
        const statusPropIndex = taskWithStatus.properties.findIndex(prop => prop.type === 'status');
        if (statusPropIndex >= 0) {
          taskWithStatus.properties[statusPropIndex].value = column.title;
        } else {
          taskWithStatus.properties.push({
            id: `status_${Date.now()}`,
            name: 'Status',
            type: 'status',
            value: column.title
          });
        }
        
        onAddTask(taskWithStatus);
      } else {
        onAddTask(task);
      }
    }
  };

  const handleAddChoreToColumn = (columnId: string, chore: Omit<Chore, 'id' | 'created_at' | 'updated_at'>) => {
    if (onAddChore) {
      onAddChore(chore);
    }
  };

  const handleEditColumn = (columnId: string, newTitle: string) => {
    const updatedColumns = columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          title: newTitle
        };
      }
      return column;
    });
    
    setColumns(updatedColumns);
  };

  const handleDeleteColumn = (columnId: string) => {
    const updatedColumns = columns.filter(column => column.id !== columnId);
    setColumns(updatedColumns);
  };

  useEffect(() => {
    setSelectedColumns(columns.map(col => col.id));
  }, [columns]);

  const progressTypes = Array.from(new Set(columns.map(col => col.id)))
    .filter(id => ['todo', 'in-progress', 'completed'].includes(id));

  const filteredColumns = columns.filter(column => {
    if (columnFilterType === 'name') {
      return selectedColumns.includes(column.id);
    }
    
    if (columnFilterType === 'progress') {
      if (progressFilter === 'all') return true;
      return column.id === progressFilter;
    }
    
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Task Board</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
            <Label htmlFor="column-filter" className="text-xs whitespace-nowrap">Filter by:</Label>
            <Select value={columnFilterType} onValueChange={(value: 'all' | 'name' | 'progress') => setColumnFilterType(value)}>
              <SelectTrigger id="column-filter" className="h-8 w-[120px]">
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Columns</SelectItem>
                <SelectItem value="name">Column Names</SelectItem>
                <SelectItem value="progress">Progress Status</SelectItem>
              </SelectContent>
            </Select>
            
            {columnFilterType === 'name' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 flex gap-1">
                    <Columns className="h-4 w-4" />
                    <span>Columns</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {columns.map(column => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={selectedColumns.includes(column.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedColumns([...selectedColumns, column.id]);
                        } else {
                          setSelectedColumns(selectedColumns.filter(id => id !== column.id));
                        }
                      }}
                    >
                      {column.title}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {columnFilterType === 'progress' && (
              <Select value={progressFilter} onValueChange={(value: 'all' | 'todo' | 'in-progress' | 'completed') => setProgressFilter(value)}>
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue placeholder="Progress" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Progress</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <Button size="sm" onClick={() => setNewColumnOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Column
          </Button>
        </div>
      </div>
      
      {filteredColumns.length === 0 ? (
        <div className="flex items-center justify-center p-8 border rounded-md bg-muted/30 text-muted-foreground">
          No columns match your current filters. Try adjusting your filter settings.
        </div>
      ) : (
        <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
          {filteredColumns.map((column, index) => (
            <React.Fragment key={column.id}>
              <ResizablePanel defaultSize={100 / filteredColumns.length} minSize={20}>
                <KanbanColumn
                  column={column}
                  goals={goals}
                  onCompleteTask={handleCompleteTask}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  onCompleteChore={onCompleteChore}
                  onEditChore={onEditChore}
                  onDeleteChore={onDeleteChore}
                  onAddTask={(task) => {
                    handleAddTaskToColumn(column.id, task);
                  }}
                  onAddChore={(chore) => {
                    handleAddChoreToColumn(column.id, chore);
                  }}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                />
              </ResizablePanel>
              {index < filteredColumns.length - 1 && (
                <ResizableHandle withHandle />
              )}
            </React.Fragment>
          ))}
        </ResizablePanelGroup>
      )}
      
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
