
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChildProfile, CreateChildProfileData } from '@/types/child-profiles';

interface ChildProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateChildProfileData) => Promise<void>;
  childProfile?: ChildProfile;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export function ChildProfileDialog({
  open,
  onOpenChange,
  onSubmit,
  childProfile,
  isEditing = false,
  isSubmitting = false
}: ChildProfileDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateChildProfileData>({
    defaultValues: {
      name: childProfile?.name || '',
      age: childProfile?.age || undefined,
      avatar_url: childProfile?.avatar_url || ''
    }
  });

  const handleFormSubmit = async (data: CreateChildProfileData) => {
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Child Profile' : 'Add Child Profile'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the child\'s information.' 
              : 'Add a child to your household. Children don\'t need login accounts.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Child's name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="0"
              max="18"
              {...register('age', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Age must be positive' },
                max: { value: 18, message: 'Age must be 18 or under' }
              })}
              placeholder="Child's age"
            />
            {errors.age && (
              <p className="text-sm text-destructive">{errors.age.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL (optional)</Label>
            <Input
              id="avatar_url"
              type="url"
              {...register('avatar_url')}
              placeholder="https://example.com/avatar.jpg"
            />
            {errors.avatar_url && (
              <p className="text-sm text-destructive">{errors.avatar_url.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Add Child')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
