
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Trash2 } from 'lucide-react';

interface EventDialogFooterProps {
  isEditing: boolean;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  onDelete?: () => void;
}

export function EventDialogFooter({ 
  isEditing, 
  isSubmitting, 
  isDeleting, 
  onDelete 
}: EventDialogFooterProps) {
  return (
    <DialogFooter className="gap-2 sm:gap-0">
      {isEditing && onDelete && (
        <Button 
          type="button" 
          variant="destructive"
          disabled={isDeleting}
          onClick={onDelete}
          className="mr-auto"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isEditing ? 'Update' : 'Create'} Event
      </Button>
    </DialogFooter>
  );
}
