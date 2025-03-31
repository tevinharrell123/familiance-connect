
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { GoalTask } from '@/types/tasks';
import { FamilyGoal } from '@/types/goals';

interface TasksListProps {
  tasks: GoalTask[];
  goals: FamilyGoal[];
  onComplete: (task: GoalTask) => void;
  onEdit: (task: GoalTask) => void;
  onDelete: (taskId: string) => void;
}

export function TasksList({ tasks, goals, onComplete, onEdit, onDelete }: TasksListProps) {
  // Find goal title by id
  const getGoalTitle = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.title || '';
  };

  // Get the initials from the assigned person's name
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead style={{ width: 50 }}>Status</TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Goal</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No tasks found.
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow 
                key={task.id}
                className={task.completed ? "bg-muted/30" : ""}
              >
                <TableCell>
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={() => onComplete(task)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {task.target_date && format(new Date(task.target_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{getGoalTitle(task.goal_id)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="text-xs">
                        {task.assigned_to_name ? getInitials(task.assigned_to_name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {task.assigned_to_name || 'Unassigned'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(task)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(task.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
