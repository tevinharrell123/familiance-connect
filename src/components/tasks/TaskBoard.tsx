
import React, { useMemo, useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { TasksList } from './TasksList';
import { 
  DEFAULT_STATUSES, 
  DEFAULT_PRIORITIES, 
  GoalTask, 
  GroupBy, 
  KanbanColumn,
  ViewType
} from '@/types/tasks';
import { FamilyGoal } from '@/types/goals';
import { format, isToday, isThisWeek, parseISO, isAfter } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  KanbanSquare, 
  ListTodo, 
  Calendar,
  Clock,
  Filter
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Card } from '../ui/card';

interface TaskBoardProps {
  tasks: GoalTask[];
  goals: FamilyGoal[];
  onEditTask: (task: GoalTask) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteTask: (task: GoalTask) => void;
  onMoveTask: (task: GoalTask, newStatus: string) => Promise<void>;
  onAddTask: (status?: string) => void;
}

export function TaskBoard({
  tasks,
  goals,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onMoveTask,
  onAddTask
}: TaskBoardProps) {
  const [viewType, setViewType] = useState<ViewType>('kanban');
  const [groupBy, setGroupBy] = useState<GroupBy>('status');

  // Group tasks by the selected criteria
  const groupedTasks = useMemo(() => {
    switch (groupBy) {
      case 'status':
        return DEFAULT_STATUSES.map(status => ({
          id: status,
          title: status,
          tasks: tasks.filter(task => {
            const taskStatus = task.properties?.status || (task.completed ? 'Done' : 'To Do');
            return taskStatus === status;
          })
        }));

      case 'priority':
        return DEFAULT_PRIORITIES.map(priority => ({
          id: priority,
          title: priority.charAt(0).toUpperCase() + priority.slice(1),
          tasks: tasks.filter(task => {
            const taskPriority = task.properties?.priority || 'medium';
            return taskPriority === priority;
          })
        }));

      case 'date':
        return [
          {
            id: 'today',
            title: 'Today',
            tasks: tasks.filter(task => {
              if (!task.target_date) return false;
              return isToday(parseISO(task.target_date));
            })
          },
          {
            id: 'this-week',
            title: 'This Week',
            tasks: tasks.filter(task => {
              if (!task.target_date) return false;
              return !isToday(parseISO(task.target_date)) && isThisWeek(parseISO(task.target_date));
            })
          },
          {
            id: 'upcoming',
            title: 'Upcoming',
            tasks: tasks.filter(task => {
              if (!task.target_date) return true; // Tasks with no date go to upcoming
              return !isToday(parseISO(task.target_date)) && !isThisWeek(parseISO(task.target_date)) && isAfter(parseISO(task.target_date), new Date());
            })
          }
        ];

      case 'assignee':
        // Get unique assignees
        const assignees = Array.from(new Set(tasks.map(task => task.assigned_to || 'unassigned')));
        return assignees.map(assigneeId => {
          const assigneeName = tasks.find(t => t.assigned_to === assigneeId)?.assigned_to_name || 'Unassigned';
          return {
            id: assigneeId,
            title: assigneeName,
            tasks: tasks.filter(task => task.assigned_to === assigneeId)
          };
        });

      default:
        return [];
    }
  }, [tasks, groupBy]);

  const handleTaskMove = async (taskId: string, sourceColId: string, destColId: string, index: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Determine what the new status should be based on the groupBy
    let updatedTask = { ...task };

    switch (groupBy) {
      case 'status':
        // The column ID is the status name
        if (!updatedTask.properties) {
          updatedTask.properties = { status: destColId, priority: 'medium' };
        } else {
          updatedTask.properties.status = destColId;
        }
        break;
      
      case 'priority':
        // The column ID is the priority level
        if (!updatedTask.properties) {
          updatedTask.properties = { status: task.completed ? 'Done' : 'To Do', priority: destColId as any };
        } else {
          updatedTask.properties.priority = destColId as any;
        }
        break;
      
      // For date and assignee, we need a different approach since moving between columns
      // means changing the date or assignee, which isn't as straightforward
      // This would require additional UI or logic
    }

    // Update the task with the new status
    await onMoveTask(updatedTask, destColId);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as ViewType)} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="kanban">
              <KanbanSquare className="h-4 w-4 mr-2" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="list">
              <ListTodo className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="date">Due Date</SelectItem>
              <SelectItem value="assignee">Assignee</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {viewType === 'kanban' ? (
        <KanbanBoard 
          columns={groupedTasks as KanbanColumn[]}
          goals={goals}
          onTaskMove={handleTaskMove}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onCompleteTask={onCompleteTask}
          onAddTask={(status) => onAddTask(status)}
        />
      ) : (
        <Card className="p-4">
          <TasksList
            tasks={tasks}
            goals={goals}
            onComplete={onCompleteTask}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        </Card>
      )}
    </div>
  );
}
