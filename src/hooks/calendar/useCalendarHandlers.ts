
import { CalendarEvent, CalendarFormValues } from '@/types/calendar';
import { addDays, format, startOfDay, endOfDay, parseISO, setHours } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { scheduleEventNotification, cancelEventNotification } from '@/utils/notificationUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface UseCalendarHandlersProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  view: 'day' | 'week' | 'month';
  setView: (view: 'day' | 'week' | 'month') => void;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  setIsEditMode: (isEdit: boolean) => void;
  setEventDefaults: (defaults: Partial<CalendarFormValues>) => void;
  setIsEventDialogOpen: (open: boolean) => void;
  setIsQuickEventDialogOpen: (open: boolean) => void;
  setQuickEventDate: (date: Date | undefined) => void;
  setQuickEventTemplate: (template: string | undefined) => void;
  setIsDetailsDialogOpen: (open: boolean) => void;
  setIsMobileEventSheetOpen: (open: boolean) => void;
  setSelectedPersonIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  createEvent: (event: CalendarFormValues) => Promise<CalendarEvent>;
  updateEvent: (event: CalendarEvent) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<void>;
  manualRefresh: () => Promise<void>;
  today: Date;
}

export function useCalendarHandlers(props: UseCalendarHandlersProps) {
  const isMobile = useIsMobile();

  const handleDateChange = (date: Date) => {
    console.log('Date changed to:', date);
    props.setSelectedDate(date);
  };

  const handleAddEvent = (date?: Date, hour?: number) => {
    console.log('Adding event for date:', date, 'hour:', hour);
    props.setSelectedEvent(null);
    props.setIsEditMode(false);
    
    if (date) {
      props.setSelectedDate(date);
      if (hour !== undefined) {
        const startDate = setHours(date, hour);
        const endDate = setHours(date, hour + 1);
        props.setEventDefaults({
          start_date: startDate,
          end_date: endDate
        });
      } else {
        props.setEventDefaults({
          start_date: startOfDay(date),
          end_date: endOfDay(date)
        });
      }
    } else {
      props.setEventDefaults({});
    }
    
    props.setIsEventDialogOpen(true);
  };

  const handleQuickEventCreate = (date: Date, template?: string) => {
    console.log('Quick event create for:', date, 'template:', template);
    console.log('Setting quickEventDate to:', date);
    
    props.setQuickEventDate(date);
    props.setQuickEventTemplate(template);
    props.setIsQuickEventDialogOpen(true);
    
    console.log('After setting - quickEventDate:', date, 'isQuickEventDialogOpen should be true');
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    handleAddEvent(date, hour);
  };

  const handleDayClick = (date: Date) => {
    console.log('Day clicked in CalendarContainer:', date, 'Current view:', props.view);
    console.log('About to call handleQuickEventCreate...');
    
    props.setSelectedDate(date);
    handleQuickEventCreate(date);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    console.log('Event selected:', event.title);
    props.setSelectedEvent(event);
    
    if (isMobile) {
      props.setIsMobileEventSheetOpen(true);
    } else {
      props.setIsDetailsDialogOpen(true);
    }
  };

  const handleEditEvent = (event?: CalendarEvent) => {
    console.log('Edit event clicked for:', event?.title);
    const eventToEdit = event;
    if (eventToEdit) {
      props.setSelectedEvent(eventToEdit);
      props.setIsDetailsDialogOpen(false);
      props.setIsMobileEventSheetOpen(false);
      props.setIsEditMode(true);
      props.setIsEventDialogOpen(true);
    }
  };

  const handleDeleteEvent = async (event?: CalendarEvent) => {
    const eventToDelete = event;
    if (!eventToDelete) return;
    
    console.log('Deleting event:', eventToDelete.id);
    try {
      await cancelEventNotification(eventToDelete.id);
      await props.deleteEvent(eventToDelete.id);
      props.setIsDetailsDialogOpen(false);
      props.setIsMobileEventSheetOpen(false);
      toast({
        title: "Event deleted",
        description: "The event has been removed from your calendar."
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting the event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateEvent = async (event: CalendarEvent) => {
    console.log('Duplicating event:', event.title);
    try {
      const duplicatedEvent: CalendarFormValues = {
        title: `${event.title} (Copy)`,
        description: event.description || '',
        start_date: parseISO(event.start_date),
        end_date: parseISO(event.end_date),
        color: event.color || '#7B68EE',
        is_household_event: event.is_household_event,
        is_public: event.is_public,
        category: event.category || 'Other'
      };
      
      await props.createEvent(duplicatedEvent);
      toast({
        title: "Event duplicated",
        description: "A copy of the event has been created."
      });
    } catch (error) {
      console.error("Error duplicating event:", error);
      toast({
        title: "Error",
        description: "There was a problem duplicating the event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePersonToggle = (personId: string) => {
    props.setSelectedPersonIds(prev => 
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleClearFilters = () => {
    props.setSelectedPersonIds([]);
  };

  const handleManualRefresh = async () => {
    try {
      await props.manualRefresh();
      toast({
        title: "Calendar refreshed",
        description: "Events have been updated with the latest data."
      });
    } catch (error) {
      console.error("Manual refresh failed:", error);
    }
  };

  const handleKeyboardShortcut = (action: string) => {
    console.log('Keyboard shortcut:', action);
    switch (action) {
      case 'new-event':
        handleQuickEventCreate(props.selectedDate);
        break;
      case 'today':
        props.setSelectedDate(props.today);
        break;
      case 'day-view':
        props.setView('day');
        break;
      case 'week-view':
        props.setView('week');
        break;
      case 'month-view':
        props.setView('month');
        break;
      case 'prev':
        if (props.view === 'month') {
          props.setSelectedDate(addDays(props.selectedDate, -30));
        } else if (props.view === 'week') {
          props.setSelectedDate(addDays(props.selectedDate, -7));
        } else {
          props.setSelectedDate(addDays(props.selectedDate, -1));
        }
        break;
      case 'next':
        if (props.view === 'month') {
          props.setSelectedDate(addDays(props.selectedDate, 30));
        } else if (props.view === 'week') {
          props.setSelectedDate(addDays(props.selectedDate, 7));
        } else {
          props.setSelectedDate(addDays(props.selectedDate, 1));
        }
        break;
      case 'refresh':
        handleManualRefresh();
        break;
      case 'close':
        props.setIsEventDialogOpen(false);
        props.setIsQuickEventDialogOpen(false);
        props.setIsDetailsDialogOpen(false);
        props.setIsMobileEventSheetOpen(false);
        break;
    }
  };

  const handleSaveEvent = async (eventData: CalendarFormValues, selectedEvent: CalendarEvent | null, isEditMode: boolean) => {
    console.log('Saving event:', eventData);
    try {
      if (isEditMode && selectedEvent) {
        console.log('Updating existing event:', selectedEvent.id);
        const updatedEvent = {
          ...selectedEvent,
          title: eventData.title,
          description: eventData.description,
          color: eventData.color,
          start_date: format(eventData.start_date, "yyyy-MM-dd'T'HH:mm:ss"),
          end_date: format(eventData.end_date, "yyyy-MM-dd'T'HH:mm:ss"),
          is_household_event: eventData.is_household_event,
          is_public: eventData.is_public
        };
        
        await props.updateEvent(updatedEvent);
        
        await cancelEventNotification(selectedEvent.id);
        await scheduleEventNotification(updatedEvent);
        
        toast({
          title: "Event updated",
          description: "Your event has been updated successfully."
        });
      } else {
        console.log('Creating new event');
        const newEventData = {
          ...eventData,
          start_date: eventData.start_date || startOfDay(props.selectedDate),
          end_date: eventData.end_date || endOfDay(props.selectedDate)
        };
        
        const createdEvent = await props.createEvent(newEventData);
        
        if (createdEvent && typeof createdEvent === 'object' && 'id' in createdEvent) {
          await scheduleEventNotification(createdEvent);
        }
        
        toast({
          title: "Event created",
          description: "Your new event has been added to the calendar."
        });
      }

      props.setIsEventDialogOpen(false);
      props.setIsQuickEventDialogOpen(false);
      props.setEventDefaults({});
      props.setQuickEventDate(undefined);
      props.setQuickEventTemplate(undefined);
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your event. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    handleDateChange,
    handleAddEvent,
    handleQuickEventCreate,
    handleTimeSlotClick,
    handleDayClick,
    handleSelectEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleDuplicateEvent,
    handlePersonToggle,
    handleClearFilters,
    handleManualRefresh,
    handleKeyboardShortcut,
    handleSaveEvent
  };
}
