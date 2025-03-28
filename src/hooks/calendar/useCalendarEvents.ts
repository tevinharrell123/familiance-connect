
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CalendarEvent, CalendarFormValues } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';

export function useCalendarEvents() {
  const { user, household } = useAuth();
  const queryClient = useQueryClient();

  // Fetch household and personal events
  const fetchEvents = async (): Promise<CalendarEvent[]> => {
    if (!user) return [];

    const events: CalendarEvent[] = [];

    // Fetch household events if user belongs to a household
    if (household) {
      const { data: householdEvents, error: householdError } = await supabase
        .from('household_events' as any)
        .select(`
          *,
          creator:created_by(id, full_name:profiles(full_name), avatar_url:profiles(avatar_url))
        `)
        .eq('household_id', household.id);

      if (householdError) {
        console.error('Error fetching household events:', householdError);
        throw householdError;
      }

      if (householdEvents) {
        events.push(
          ...householdEvents.map((event: any) => ({
            ...event,
            is_household_event: true,
            user_profile: event.creator ? {
              full_name: event.creator.full_name?.[0]?.full_name || null,
              avatar_url: event.creator.avatar_url?.[0]?.avatar_url || null
            } : null
          }))
        );
      }
    }

    // Fetch personal events
    const { data: userEvents, error: userError } = await supabase
      .from('user_events' as any)
      .select(`
        *,
        user:profiles(full_name, avatar_url)
      `)
      .eq('user_id', user.id);

    if (userError) {
      console.error('Error fetching user events:', userError);
      throw userError;
    }

    if (userEvents) {
      events.push(
        ...userEvents.map((event: any) => ({
          ...event,
          is_household_event: false,
          user_profile: event.user || null
        }))
      );
    }

    // Fetch shared personal events from household members if user belongs to a household
    if (household) {
      const { data: sharedEvents, error: sharedError } = await supabase
        .from('user_events' as any)
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq('is_public', true)
        .neq('user_id', user.id);

      if (sharedError) {
        console.error('Error fetching shared events:', sharedError);
        throw sharedError;
      }

      if (sharedEvents) {
        const { data: householdMembers, error: membersError } = await supabase
          .from('household_members')
          .select('user_id')
          .eq('household_id', household.id);
          
        if (membersError) {
          console.error('Error fetching household members:', membersError);
          throw membersError;
        }
        
        const memberIds = new Set(householdMembers?.map(m => m.user_id) || []);
        
        events.push(
          ...sharedEvents
            .filter((event: any) => memberIds.has(event.user_id))
            .map((event: any) => ({
              ...event,
              is_household_event: false,
              user_profile: event.user || null
            }))
        );
      }
    }

    return events;
  };

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ['calendar-events', user?.id, household?.id],
    queryFn: fetchEvents,
    enabled: !!user
  });

  // Create event mutation
  const createEvent = async (values: CalendarFormValues): Promise<CalendarEvent> => {
    if (!user) throw new Error('User not authenticated');
    
    const { title, description, start_date, end_date, color, is_household_event } = values;
    
    if (is_household_event) {
      if (!household) throw new Error('No household available');
      
      const { data, error } = await supabase
        .from('household_events' as any)
        .insert({
          title,
          description,
          start_date: start_date.toISOString(),
          end_date: end_date.toISOString(),
          color,
          household_id: household.id,
          created_by: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return { ...data, is_household_event: true } as CalendarEvent;
    } else {
      const { data, error } = await supabase
        .from('user_events' as any)
        .insert({
          title,
          description,
          start_date: start_date.toISOString(),
          end_date: end_date.toISOString(),
          color,
          user_id: user.id,
          is_public: false // Default to private
        })
        .select()
        .single();
        
      if (error) throw error;
      return { ...data, is_household_event: false } as CalendarEvent;
    }
  };
  
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "Event created",
        description: "Your event has been successfully created.",
      });
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      toast({
        title: "Failed to create event",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Update event mutation
  const updateEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
    if (!user) throw new Error('User not authenticated');
    
    const { id, title, description, start_date, end_date, color, is_household_event } = event;
    
    if (is_household_event) {
      const { data, error } = await supabase
        .from('household_events' as any)
        .update({
          title,
          description,
          start_date,
          end_date,
          color,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return { ...data, is_household_event: true } as CalendarEvent;
    } else {
      const { data, error } = await supabase
        .from('user_events' as any)
        .update({
          title,
          description,
          start_date,
          end_date,
          color,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return { ...data, is_household_event: false } as CalendarEvent;
    }
  };
  
  const updateEventMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "Event updated",
        description: "Your event has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast({
        title: "Failed to update event",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete event mutation
  const deleteEvent = async (event: CalendarEvent): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    const { id, is_household_event } = event;
    
    if (is_household_event) {
      const { error } = await supabase
        .from('household_events' as any)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_events' as any)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    }
  };
  
  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast({
        title: "Failed to delete event",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  return {
    events,
    isLoading,
    error,
    refetch,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending
  };
}
