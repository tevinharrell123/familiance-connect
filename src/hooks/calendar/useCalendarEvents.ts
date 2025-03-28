
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export type CalendarEvent = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  description?: string;
  color?: string;
  is_household_event: boolean;
  created_by?: string;
  is_public?: boolean;
};

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { household, user } = useAuth();

  const fetchEvents = async () => {
    if (!user || !household) return;
    
    setIsLoading(true);
    try {
      // Fetch household events
      const { data: householdEventsData, error: householdError } = await supabase
        .from('household_events' as any)
        .select('*')
        .eq('household_id', household.id);

      if (householdError) {
        console.error('Error fetching household events:', householdError);
        toast({
          title: "Error fetching household events",
          description: "Could not retrieve shared events. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Fetch user's personal events
      const { data: personalEventsData, error: personalError } = await supabase
        .from('user_events' as any)
        .select('*')
        .eq('user_id', user.id);

      if (personalError) {
        console.error('Error fetching personal events:', personalError);
        toast({
          title: "Error fetching personal events",
          description: "Could not retrieve your personal events. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Fetch public events from household members
      const { data: publicEventsData, error: publicError } = await supabase
        .from('user_events' as any)
        .select('*')
        .neq('user_id', user.id)
        .eq('is_public', true);

      if (publicError) {
        console.error('Error fetching public events:', publicError);
      }

      // Process household events
      const householdEvents: CalendarEvent[] = householdEventsData 
        ? householdEventsData.map((event: any) => ({
            ...event,
            is_household_event: true
          }))
        : [];

      // Process personal events
      const personalEvents: CalendarEvent[] = personalEventsData
        ? personalEventsData.map((event: any) => ({
            ...event,
            is_household_event: false
          }))
        : [];

      // Process public events
      const publicEvents: CalendarEvent[] = publicEventsData
        ? publicEventsData.map((event: any) => ({
            ...event,
            is_household_event: false
          }))
        : [];

      setEvents([...householdEvents, ...personalEvents, ...publicEvents]);
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while fetching events.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'is_household_event'> & { is_household_event: boolean, is_public?: boolean }) => {
    if (!user || !household) return null;
    
    try {
      if (eventData.is_household_event) {
        // Add household event
        const { data, error } = await supabase
          .from('household_events' as any)
          .insert({
            household_id: household.id,
            created_by: user.id,
            title: eventData.title,
            description: eventData.description || '',
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            color: eventData.color
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding household event:', error);
          toast({
            title: "Error Adding Event",
            description: "Could not add the shared event. Please try again.",
            variant: "destructive"
          });
          return null;
        }

        const newEvent: CalendarEvent = { 
          ...data, 
          is_household_event: true 
        };
        
        setEvents(prev => [...prev, newEvent]);
        return newEvent;
      } else {
        // Add personal event
        const { data, error } = await supabase
          .from('user_events' as any)
          .insert({
            user_id: user.id,
            title: eventData.title,
            description: eventData.description || '',
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            is_public: eventData.is_public || false,
            color: eventData.color
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding personal event:', error);
          toast({
            title: "Error Adding Event",
            description: "Could not add your personal event. Please try again.",
            variant: "destructive"
          });
          return null;
        }

        const newEvent: CalendarEvent = { 
          ...data, 
          is_household_event: false 
        };
        
        setEvents(prev => [...prev, newEvent]);
        return newEvent;
      }
    } catch (error) {
      console.error('Error in addEvent:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while adding the event.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<CalendarEvent>, isHouseholdEvent: boolean) => {
    if (!user || !household) return false;
    
    try {
      if (isHouseholdEvent) {
        // Update household event
        const { error } = await supabase
          .from('household_events' as any)
          .update({
            title: eventData.title,
            description: eventData.description,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            color: eventData.color
          })
          .eq('id', id);

        if (error) {
          console.error('Error updating household event:', error);
          toast({
            title: "Error Updating Event",
            description: "Could not update the shared event. Please try again.",
            variant: "destructive"
          });
          return false;
        }
      } else {
        // Update personal event
        const { error } = await supabase
          .from('user_events' as any)
          .update({
            title: eventData.title,
            description: eventData.description,
            start_date: eventData.start_date,
            end_date: eventData.end_date,
            is_public: eventData.is_public,
            color: eventData.color
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating personal event:', error);
          toast({
            title: "Error Updating Event",
            description: "Could not update your personal event. Please try again.",
            variant: "destructive"
          });
          return false;
        }
      }

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === id && event.is_household_event === isHouseholdEvent 
          ? { ...event, ...eventData } 
          : event
      ));
      
      return true;
    } catch (error) {
      console.error('Error in updateEvent:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while updating the event.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteEvent = async (id: string, isHouseholdEvent: boolean) => {
    if (!user || !household) return false;
    
    try {
      if (isHouseholdEvent) {
        // Delete household event
        const { error } = await supabase
          .from('household_events' as any)
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting household event:', error);
          toast({
            title: "Error Deleting Event",
            description: "Could not delete the shared event. Please try again.",
            variant: "destructive"
          });
          return false;
        }
      } else {
        // Delete personal event
        const { error } = await supabase
          .from('user_events' as any)
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting personal event:', error);
          toast({
            title: "Error Deleting Event",
            description: "Could not delete your personal event. Please try again.",
            variant: "destructive"
          });
          return false;
        }
      }

      // Update local state
      setEvents(prev => prev.filter(event => 
        !(event.id === id && event.is_household_event === isHouseholdEvent)
      ));
      
      return true;
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while deleting the event.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (user && household) {
      fetchEvents();
    }
  }, [user, household]);

  return {
    events,
    isLoading,
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent
  };
};
