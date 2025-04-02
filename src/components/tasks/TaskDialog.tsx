
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { DEFAULT_PRIORITIES, DEFAULT_STATUSES, GoalTask } from '@/types/tasks';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { useGoals } from '@/hooks/mission/useGoals';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => Promise<void>;
  defaultValues?: Partial<GoalTask>;
  title: string;
}

export function TaskDialog({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  title
}: TaskDialogProps) {
  const { members } = useFamilyMembers();
  const { goals } = useGoals();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskData, setTaskData] = useState({
    id: '',
    goal_id: '',
    title: '',
    description: '',
    assigned_to: 'unassigned',
    target_date: undefined as Date | undefined,
    completed: false,
    properties: {
      status: 'To Do',
      priority: 'medium' as ('low' | 'medium' | 'high')
    }
  });

  // Initialize form when defaultValues changes
  useEffect(() => {
    if (defaultValues) {
      setTaskData({
        id: defaultValues.id || '',
        goal_id: defaultValues.goal_id || (goals.length > 0 ? goals[0].id : ''),
        title: defaultValues.title || '',
        description: defaultValues.description || '',
        assigned_to: defaultValues.assigned_to || 'unassigned',
        target_date: defaultValues.target_date ? new Date(defaultValues.target_date) : undefined,
        completed: defaultValues.completed || false,
        properties: defaultValues.properties || {
          status: 'To Do',
          priority: 'medium'
        }
      });
    } else {
      // Reset form for new task
      setTaskData({
        id: '',
        goal_id: goals.length > 0 ? goals[0].id : '',
        title: '',
        description: '',
        assigned_to: 'unassigned',
        target_date: undefined,
        completed: false,
        properties: {
          status: 'To Do',
          priority: 'medium'
        }
      });
    }
  }, [defaultValues, isOpen, goals]);

  const handleChange = (field: string, value: any) => {
    setTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertyChange = (field: string, value: any) => {
    setTaskData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!taskData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for the task",
        variant: "destructive",
      });
      return;
    }

    if (!taskData.goal_id) {
      toast({
        title: "Goal required",
        description: "Please select a goal for this task",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const dataToSubmit = {
        ...taskData,
        assigned_to: taskData.assigned_to === 'unassigned' ? null : taskData.assigned_to,
        target_date: taskData.target_date ? format(taskData.target_date, 'yyyy-MM-dd') : null,
      };
      
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error saving task",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="completed" className="text-right">
              Completed
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="completed"
                checked={taskData.completed}
                onCheckedChange={(checked) => handleChange('completed', checked)}
              />
              <Label htmlFor="completed">
                {taskData.completed ? 'Completed' : 'Not completed'}
              </Label>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              className="col-span-3"
              value={taskData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goal" className="text-right">
              Goal
            </Label>
            <Select
              value={taskData.goal_id}
              onValueChange={(value) => handleChange('goal_id', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={taskData.properties.status}
              onValueChange={(value) => handlePropertyChange('status', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <Select
              value={taskData.properties.priority}
              onValueChange={(value) => handlePropertyChange('priority', value as any)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the task"
              className="col-span-3"
              value={taskData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="targetDate" className="text-right">
              Due Date
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {taskData.target_date ? format(taskData.target_date, 'PPP') : <span>Select a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={taskData.target_date}
                    onSelect={(date) => handleChange('target_date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="assignedTo" className="text-right">
              Assign To
            </Label>
            <Select
              value={taskData.assigned_to}
              onValueChange={(value) => handleChange('assigned_to', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Optional: Assign to member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {members?.map((member) => (
                  <SelectItem key={member.id} value={member.user_id}>
                    {member.user_profiles?.full_name || 'Unknown Member'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
