
import React, { useEffect } from 'react';
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
import { EnhancedEventDialogFormFields } from './EnhancedEventDialogFormFields';
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
      recurrence_type: 'none',
      category: 'Other',
    }
  });

  // Reset form when dialog opens/closes or defaultValues change
  useEffect(() => {
    if (open) {
      console.log('Resetting form with values:', defaultValues);
      
      // Create properly formatted values with fallbacks
      const formValues = {
        title: defaultValues?.title || '',
        description: defaultValues?.description || '',
        start_date: defaultValues?.start_date || new Date(),
        end_date: defaultValues?.end_date || new Date(),
        color: defaultValues?.color || '#7B68EE',
        is_household_event: defaultValues?.is_household_event || false,
        recurrence_type: defaultValues?.recurrence_type || 'none',
        category: defaultValues?.category || 'Other',
        assigned_to_member: defaultValues?.assigned_to_member || undefined,
        assigned_to_child: defaultValues?.assigned_to_child || undefined,
        recurrence_end: defaultValues?.recurrence_end || undefined,
      };
      
      try {
        form.reset(formValues);
      } catch (error) {
        console.error('Error resetting form:', error);
        // Fallback to basic form reset
        form.reset({
          title: '',
          description: '',
          start_date: new Date(),
          end_date: new Date(),
          color: '#7B68EE',
          is_household_event: false,
          recurrence_type: 'none',
          category: 'Other',
        });
      }
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (e: React.FormEvent) => {
    console.log('Form submit handler called');
    e.preventDefault();
    e.stopPropagation();
    
    try {
      form.handleSubmit((values) => {
        console.log('Form submitted with values:', values);
        onSubmit(values);
      })(e);
    } catch (error) {
      console.error('Error during form submission:', error);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    console.log('Delete button clicked');
    e.preventDefault();
    e.stopPropagation();
    try {
      onDelete?.();
    } catch (error) {
      console.error('Error during delete:', error);
    }
  };

  // Add error boundary wrapper
  const renderFormContent = () => {
    try {
      return (
        <>
          <EnhancedEventDialogFormFields 
            form={form} 
            showHouseholdOption={!!household}
          />
          
          <EventDialogFooter 
            isEditing={isEditing}
            isSubmitting={isSubmitting}
            isDeleting={isDeleting}
            onDelete={handleDelete}
          />
        </>
      );
    } catch (error) {
      console.error('Error rendering form content:', error);
      return (
        <div className="p-4 text-center text-destructive">
          <p>Something went wrong loading the form.</p>
          <p className="text-sm mt-2">Please try closing and reopening the dialog.</p>
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Make changes to your event here.' 
              : 'Add a new event to your calendar.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormContent()}
        </form>
      </DialogContent>
    </Dialog>
  );
}
