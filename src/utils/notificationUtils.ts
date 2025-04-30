
import { LocalNotifications, PendingLocalNotificationsSchema } from '@capacitor/local-notifications';
import { CalendarEvent } from '@/types/calendar';
import { format, parseISO, subHours } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

// Check and request notification permissions
export const checkNotificationPermission = async (): Promise<boolean> => {
  try {
    const { display } = await LocalNotifications.checkPermissions();
    
    if (display === 'prompt' || display === 'denied') {
      const { display: newPermission } = await LocalNotifications.requestPermissions();
      return newPermission === 'granted';
    }
    
    return display === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
};

// Schedule a notification for a calendar event
export const scheduleEventNotification = async (event: CalendarEvent): Promise<boolean> => {
  try {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return false;
    }
    
    const eventDate = parseISO(event.start_date);
    const notificationDate = subHours(eventDate, 1); // Notify 1 hour before
    
    // Create a unique ID based on event ID to avoid duplicates
    const notificationId = parseInt(event.id.replace(/\D/g, '').substring(0, 9), 10);
    
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId,
          title: `Upcoming: ${event.title}`,
          body: event.description || 'Starting in 1 hour',
          schedule: { at: notificationDate },
          extra: { eventId: event.id }
        }
      ]
    });
    
    console.log(`Notification scheduled for event ${event.title} at ${format(notificationDate, 'PPpp')}`);
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    toast({
      title: "Notification Error",
      description: "Could not schedule notification for this event.",
      variant: "destructive"
    });
    return false;
  }
};

// Cancel notification for an event
export const cancelEventNotification = async (eventId: string): Promise<boolean> => {
  try {
    // Convert event ID to a numeric ID
    const notificationId = parseInt(eventId.replace(/\D/g, '').substring(0, 9), 10);
    
    // Get pending notifications
    const pending: PendingLocalNotificationsSchema = await LocalNotifications.getPending();
    
    // Check if notification with this ID exists
    const exists = pending.notifications.some(n => n.id === notificationId);
    
    if (exists) {
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }]
      });
      console.log(`Notification for event ${eventId} cancelled`);
    }
    
    return true;
  } catch (error) {
    console.error('Error cancelling notification:', error);
    return false;
  }
};

// Initialize notification listeners
export const initNotificationListeners = () => {
  LocalNotifications.addListener('localNotificationReceived', (notification) => {
    console.log('Notification received:', notification);
  });
  
  LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    console.log('Notification action performed:', action);
    // Handle notification tap - could navigate to the event details
    const eventId = action.notification.extra?.eventId;
    if (eventId) {
      console.log('User tapped notification for event:', eventId);
      // Navigation logic could be added here
    }
  });
};
