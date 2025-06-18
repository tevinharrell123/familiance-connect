import React from 'react';
import { CalendarEventDialog } from '@/components/calendar/CalendarEventDialog';
import { QuickEventDialog } from '@/components/calendar/QuickEventDialog';
import { EventDetailsDialog } from '@/components/calendar/EventDetailsDialog';
import { MobileEventSheet } from '@/components/calendar/MobileEventSheet';
import { KeyboardShortcuts } from '@/components/calendar/KeyboardShortcuts';
import { CalendarEvent, CalendarFormValues } from '@/types/calendar';
import { parseISO } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarDialogsProps {
  // Dialog states
  isEventDialogOpen: boolean;
  setIsEventDialogOpen: (open: boolean) => void;
  isQuickEventDialogOpen: boolean;
  setIsQuickEventDialogOpen: (open: boolean) => void;
  isDetailsDialogOpen: boolean;
  setIsDetailsDialogOpen: (open: boolean) => void;
  isMobileEventSheetOpen: boolean;
  setIsMobileEventSheetOpen: (open: boolean) => void;
  
  // Event data
  selectedEvent: CalendarEvent | null;
  isEditMode: boolean;
  eventDefaults: Partial<CalendarFormValues>;
  quickEventDate: Date | undefined;
  quickEventTemplate: string | undefined;
  
  // Handlers
  onSaveEvent: (eventData: CalendarFormValues) => void;
  onEditEvent: () => void;
  onDeleteEvent: () => void;
  onKeyboardShortcut: (action: string) => void;
  
  // Other props
  isMutating: boolean;
  keyboardShortcutsEnabled: boolean;
}

export function CalendarDialogs({
  isEventDialogOpen,
  setIsEventDialogOpen,
  isQuickEventDialogOpen,
  setIsQuickEventDialogOpen,
  isDetailsDialogOpen,
  setIsDetailsDialogOpen,
  isMobileEventSheetOpen,
  setIsMobileEventSheetOpen,
  selectedEvent,
  isEditMode,
  eventDefaults,
  quickEventDate,
  quickEventTemplate,
  onSaveEvent,
  onEditEvent,
  onDeleteEvent,
  onKeyboardShortcut,
  isMutating,
  keyboardShortcutsEnabled
}: CalendarDialogsProps) {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Keyboard shortcuts handler - disabled on mobile */}
      {!isMobile && (
        <KeyboardShortcuts
          onQuickAction={onKeyboardShortcut}
          isEnabled={keyboardShortcutsEnabled && !isEventDialogOpen && !isQuickEventDialogOpen && !isDetailsDialogOpen}
        />
      )}

      <CalendarEventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        onSubmit={onSaveEvent}
        isEditing={isEditMode}
        defaultValues={isEditMode && selectedEvent ? {
          title: selectedEvent.title,
          description: selectedEvent.description || '',
          start_date: parseISO(selectedEvent.start_date),
          end_date: parseISO(selectedEvent.end_date),
          color: selectedEvent.color || '',
          is_household_event: selectedEvent.is_household_event,
          is_public: selectedEvent.is_public
        } : eventDefaults}
        isSubmitting={isMutating}
      />

      <QuickEventDialog
        open={isQuickEventDialogOpen}
        onOpenChange={setIsQuickEventDialogOpen}
        onSubmit={onSaveEvent}
        selectedDate={quickEventDate}
        selectedTemplate={quickEventTemplate}
      />
      
      {/* Desktop event details dialog */}
      {selectedEvent && !isMobile && (
        <EventDetailsDialog
          open={isDetailsDialogOpen}
          onOpenChange={setIsDetailsDialogOpen}
          event={selectedEvent}
          onEditClick={onEditEvent}
          onDeleteClick={onDeleteEvent}
        />
      )}

      {/* Mobile event details sheet */}
      {selectedEvent && isMobile && (
        <MobileEventSheet
          open={isMobileEventSheetOpen}
          onOpenChange={setIsMobileEventSheetOpen}
          event={selectedEvent}
          onEditClick={onEditEvent}
          onDeleteClick={onDeleteEvent}
        />
      )}
    </>
  );
}
