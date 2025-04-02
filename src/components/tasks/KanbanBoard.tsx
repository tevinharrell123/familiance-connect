
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { GoalTask, KanbanColumn } from '@/types/tasks';
import { Button } from '../ui/button';
import { FamilyGoal } from '@/types/goals';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  columns: KanbanColumn[];
  goals: FamilyGoal[];
  onTaskMove: (taskId: string, sourceColId: string, destColId: string, index: number) => void;
  onEditTask: (task: GoalTask) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteTask: (task: GoalTask) => void;
  onAddTask: (status: string) => void;
}

export function KanbanBoard({
  columns,
  goals,
  onTaskMove,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onAddTask
}: KanbanBoardProps) {
  const getGoalTitle = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.title || '';
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped back at the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Call the parent handler to update the state and possibly the database
    onTaskMove(
      draggableId,
      source.droppableId,
      destination.droppableId,
      destination.index
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-hidden">
        {columns.map((column) => (
          <Card key={column.id} className="flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-200px)]">
            <CardHeader className="pb-2 pt-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium">
                  {column.title}
                  <span className="ml-2 text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    {column.tasks.length}
                  </span>
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={() => onAddTask(column.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-2 pb-4 overflow-hidden">
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "h-full p-1 overflow-y-auto rounded-md space-y-2",
                      snapshot.isDraggingOver && "bg-muted"
                    )}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "mb-2",
                              snapshot.isDragging && "opacity-50"
                            )}
                          >
                            <TaskCard
                              task={task}
                              goalTitle={getGoalTitle(task.goal_id)}
                              onComplete={() => onCompleteTask(task)}
                              onEdit={() => onEditTask(task)}
                              onDelete={() => onDeleteTask(task.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {column.tasks.length === 0 && (
                      <div className="flex items-center justify-center h-24 border border-dashed rounded-md border-muted-foreground/20 text-muted-foreground text-sm">
                        No tasks in this column
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
        ))}
      </div>
    </DragDropContext>
  );
}
