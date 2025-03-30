
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Image as ImageIcon, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { useGoalActions } from '@/hooks/mission/useGoalActions';
import { FamilyGoal } from '@/types/goals';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const GOAL_CATEGORIES = [
  'Financial', 'Relationship', 'Children', 'Fitness',
  'Career', 'Personal', 'Other', 'Travel', 'Spiritual'
];

interface EditGoalDialogProps {
  goal: FamilyGoal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const EditGoalDialog: React.FC<EditGoalDialogProps> = ({
  goal,
  open,
  onOpenChange,
  onSave
}) => {
  const { members } = useFamilyMembers();
  const { updateGoal, toggleGoalCompletion, deleteGoal, isLoading } = useGoalActions();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [completed, setCompleted] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Initialize form values when goal changes
  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setCategory(goal.category);
      setTargetDate(goal.target_date ? new Date(goal.target_date) : undefined);
      setAssignedTo(goal.assigned_to || 'unassigned');
      setCompleted(goal.completed || false);
    }
  }, [goal]);

  const handleSave = async () => {
    if (!goal) return;
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your goal",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateGoal({
        ...goal,
        title,
        description: description || null,
        category,
        target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : null,
        assigned_to: assignedTo,
        completed
      });
      
      toast({
        title: "Goal updated",
        description: "Your goal has been updated successfully",
      });
      
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error updating goal",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleToggleCompletion = async () => {
    if (!goal) return;
    
    try {
      await toggleGoalCompletion(goal);
      setCompleted(!completed);
      
      toast({
        title: completed ? "Goal marked as incomplete" : "Goal marked as complete",
        description: "Goal status updated successfully",
      });
      
      onSave();
    } catch (error: any) {
      toast({
        title: "Error updating goal",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!goal) return;
    
    try {
      await deleteGoal(goal.id);
      
      toast({
        title: "Goal deleted",
        description: "Your goal has been deleted successfully",
      });
      
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error deleting goal",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  if (!goal) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="completed" className="text-right">
                Completed
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="completed"
                  checked={completed}
                  onCheckedChange={setCompleted}
                />
                <Label htmlFor="completed">
                  {completed ? 'Completed' : 'Not completed'}
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                placeholder="Enter goal title"
                className="col-span-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {GOAL_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your goal"
                className="col-span-3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="targetDate" className="text-right">
                Target Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetDate ? format(targetDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={setTargetDate}
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
                value={assignedTo}
                onValueChange={setAssignedTo}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Optional: Assign to member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="unassigned" value="unassigned">Unassigned</SelectItem>
                  {members?.map((member) => (
                    <SelectItem key={member.id} value={member.user_id}>
                      {member.user_profiles?.full_name || 'Unknown Member'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex flex-1 justify-start">
              <Button
                variant="outline"
                onClick={() => setShowDeleteAlert(true)}
                type="button"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleToggleCompletion}
                type="button"
                disabled={isLoading}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {completed ? 'Mark as Incomplete' : 'Mark as Complete'}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the goal "{title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
