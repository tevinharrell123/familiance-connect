
import React from 'react';
import { useForm } from 'react-hook-form';
import { CalendarFormValues } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EventDialogFormFields } from './EventDialogFormFields';
import { EventDialogFooter } from './EventDialogFooter';

interface CalendarEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CalendarFormValues) => void;
  onDelete?: () => void;
  isEditing: boolean;
  defaultValues?: Partial<CalendarFormValues>;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

export function CalendarEventDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  isEditing,
  defaultValues,
  isSubmitting,
  isDeleting
}: CalendarEventDialogProps) {
  const { household } = useAuth();
  
  const form = useForm<CalendarFormValues>({
    defaultValues: {
      title: '',
      description: '',
      start_date: new Date(),
      end_date: new Date(),
      color: '#7B68EE',
      is_household_event: false,
      ...defaultValues
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Make changes to your event here.' 
              : 'Add a new event to your calendar.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <EventDialogFormFields 
            form={form} 
            showHouseholdOption={!!household}
          />
          
          <EventDialogFooter 
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            isDeleting={isDeleting}
            onDelete={onDelete}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
