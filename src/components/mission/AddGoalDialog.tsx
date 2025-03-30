
import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useCreateGoal } from '@/hooks/mission/useCreateGoal';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  initialCategory: string | null;
}

const GOAL_CATEGORIES = [
  'Financial', 'Relationship', 'Children', 'Fitness',
  'Career', 'Personal', 'Other', 'Travel', 'Spiritual'
];

export const AddGoalDialog: React.FC<AddGoalDialogProps> = ({
  open,
  onOpenChange,
  onClose,
  initialCategory
}) => {
  const { household } = useAuth();
  const { members } = useFamilyMembers();
  const { createGoal, isLoading } = useCreateGoal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(initialCategory || 'Financial');
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(initialCategory || 'Financial');
    setTargetDate(undefined);
    setAssignedTo(undefined);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your goal",
        variant: "destructive",
      });
      return;
    }

    if (!household) {
      toast({
        title: "Household required",
        description: "You need to be in a household to create goals",
        variant: "destructive",
      });
      return;
    }

    try {
      await createGoal({
        title,
        description,
        category,
        targetDate: targetDate ? format(targetDate, 'yyyy-MM-dd') : undefined,
        assignedTo,
        imageFile,
        householdId: household.id,
      });
      
      toast({
        title: "Goal created",
        description: "Your goal has been added to the vision board",
      });
      
      resetForm();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error creating goal",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpenState) => {
      if (!newOpenState) resetForm();
      onOpenChange(newOpenState);
    }}>
      <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Goal</DialogTitle>
          <DialogDescription>
            Create a new goal for your family's vision board
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
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
                <SelectItem value="">Unassigned</SelectItem>
                {members?.map((member) => (
                  <SelectItem key={member.id} value={member.user_id}>
                    {member.user_profiles?.full_name || 'Unknown Member'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image
            </Label>
            <div className="col-span-3">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-grow-0"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
                <span className="text-sm text-muted-foreground">
                  {imageFile ? imageFile.name : 'No file chosen'}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                id="image"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              {imagePreview && (
                <div className="mt-3 relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-32 max-w-full rounded-md object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Goal'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
