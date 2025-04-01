
import React, { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { GoalTask, GroupByOption } from '@/types/tasks';
import { Chore, ChoreGroupByOption } from '@/types/chores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid } from 'lucide-react';

type KanbanViewProps = {
  tasks: GoalTask[];
  chores: Chore[];
  goals: any[];
  members: any[];
  onTaskUpdate?: (task: GoalTask) => void;
  onChoreUpdate?: (chore: Chore) => void;
};

export function KanbanView({
  tasks,
  chores,
  goals,
  members,
  onTaskUpdate,
  onChoreUpdate
}: KanbanViewProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'chores'>('tasks');
  const [taskGroupBy, setTaskGroupBy] = useState<GroupByOption>('status');
  const [choreGroupBy, setChoreGroupBy] = useState<ChoreGroupByOption>('status');

  const handleTaskUpdate = (task: GoalTask) => {
    if (onTaskUpdate) {
      onTaskUpdate(task);
    }
  };

  const handleChoreUpdate = (chore: Chore) => {
    if (onChoreUpdate) {
      onChoreUpdate(chore);
    }
  };

  const handleItemUpdate = (item: GoalTask | Chore) => {
    if ('goal_id' in item && onTaskUpdate) {
      onTaskUpdate(item as GoalTask);
    } else if ('weekdays' in item && onChoreUpdate) {
      onChoreUpdate(item as Chore);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="flex items-center">
              <LayoutGrid className="h-5 w-5 mr-2" />
              Kanban Board
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as 'tasks' | 'chores')} 
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="chores">Chores</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {activeTab === 'tasks' && (
                <Select 
                  value={taskGroupBy} 
                  onValueChange={(value) => setTaskGroupBy(value as GroupByOption)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="assigned_to">Assigned To</SelectItem>
                    <SelectItem value="goal_id">Goal</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {activeTab === 'chores' && (
                <Select 
                  value={choreGroupBy} 
                  onValueChange={(value) => setChoreGroupBy(value as ChoreGroupByOption)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Group by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="assigned_to">Assigned To</SelectItem>
                    <SelectItem value="weekdays">Days</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[calc(100vh-350px)] min-h-[500px]">
            {activeTab === 'tasks' && (
              <KanbanBoard
                items={tasks}
                type="tasks"
                groupBy={taskGroupBy}
                goals={goals}
                members={members}
                onItemUpdate={handleItemUpdate}
              />
            )}
            
            {activeTab === 'chores' && (
              <KanbanBoard
                items={chores}
                type="chores"
                groupBy={choreGroupBy}
                goals={goals}
                members={members}
                onItemUpdate={handleItemUpdate}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
