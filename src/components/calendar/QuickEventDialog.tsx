
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarFormValues } from '@/types/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { addHours, setHours, setMinutes } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, User, Users, Zap } from 'lucide-react';

interface QuickEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CalendarFormValues) => void;
  selectedDate?: Date;
  selectedTemplate?: string;
}

const EVENT_TEMPLATES = [
  { id: 'meeting', title: 'Meeting', duration: 1, color: '#4A90E2' },
  { id: 'appointment', title: 'Appointment', duration: 1, color: '#E74C3C' },
  { id: 'pickup', title: 'School Pickup', duration: 0.5, color: '#F39C12' },
  { id: 'practice', title: 'Sports Practice', duration: 2, color: '#27AE60' },
  { id: 'playdate', title: 'Playdate', duration: 2, color: '#E91E63' },
  { id: 'chore', title: 'Household Chore', duration: 1, color: '#9B59B6' },
];

export function QuickEventDialog({
  open,
  onOpenChange,
  onSubmit,
  selectedDate,
  selectedTemplate
}: QuickEventDialogProps) {
  const { user, household } = useAuth();
  const { childProfiles } = useChildProfiles();
  const { members: householdMembers } = useFamilyMembers();
  
  const form = useForm<CalendarFormValues>({
    defaultValues: {
      title: '',
      description: '',
      start_date: new Date(),
      end_date: new Date(),
      color: '#7B68EE',
      is_household_event: !!household,
      assigned_to_member: user?.id,
    }
  });

  // Combine household members and children for assignment dropdown
  const allAssignablePersons = React.useMemo(() => {
    const persons = [];
    
    // Add current user first
    if (user && household) {
      const currentMember = householdMembers?.find(m => m.user_id === user.id);
      if (currentMember) {
        persons.push({
          id: user.id,
          name: currentMember.user_profiles?.full_name || 'You',
          avatar_url: currentMember.user_profiles?.avatar_url,
          type: 'member' as const,
          isCurrent: true
        });
      }
    }
    
    // Add other household members
    if (householdMembers) {
      householdMembers.forEach((member) => {
        if (member.user_id !== user?.id) {
          persons.push({
            id: member.user_id,
            name: member.user_profiles?.full_name || 'Unknown Member',
            avatar_url: member.user_profiles?.avatar_url,
            type: 'member' as const,
            isCurrent: false
          });
        }
      });
    }
    
    // Add children
    if (childProfiles) {
      childProfiles.forEach((child) => {
        persons.push({
          id: child.id,
          name: child.name,
          avatar_url: child.avatar_url,
          type: 'child' as const,
          isCurrent: false
        });
      });
    }
    
    return persons;
  }, [householdMembers, childProfiles, user]);

  // Set smart defaults when dialog opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      const startTime = selectedDate ? 
        setMinutes(setHours(selectedDate, now.getHours()), 0) : 
        setMinutes(setHours(now, now.getHours() + 1), 0);
      
      const template = selectedTemplate ? EVENT_TEMPLATES.find(t => t.id === selectedTemplate) : null;
      const endTime = template ? 
        addHours(startTime, template.duration) : 
        addHours(startTime, 1);

      form.reset({
        title: template?.title || '',
        description: '',
        start_date: startTime,
        end_date: endTime,
        color: template?.color || '#7B68EE',
        is_household_event: !!household,
        assigned_to_member: user?.id,
        assigned_to_child: undefined,
      });
    }
  }, [open, selectedDate, selectedTemplate, form, user, household]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit((values) => {
      console.log('Quick event submitted:', values);
      onSubmit(values);
      onOpenChange(false);
    })(e);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = EVENT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      const currentStart = form.getValues('start_date');
      form.setValue('title', template.title);
      form.setValue('color', template.color);
      form.setValue('end_date', addHours(currentStart, template.duration));
    }
  };

  const handlePersonSelect = (personId: string) => {
    const person = allAssignablePersons.find(p => p.id === personId);
    if (person?.type === 'child') {
      form.setValue('assigned_to_child', personId);
      form.setValue('assigned_to_member', undefined);
    } else {
      form.setValue('assigned_to_member', personId);
      form.setValue('assigned_to_child', undefined);
    }
  };

  const selectedPersonId = form.watch('assigned_to_member') || form.watch('assigned_to_child');
  const selectedPerson = allAssignablePersons.find(p => p.id === selectedPersonId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Event
          </DialogTitle>
          <DialogDescription>
            Create an event quickly with smart defaults
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateSelect(template.id)}
                  className="text-xs"
                >
                  {template.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              placeholder="What's happening?"
              {...form.register('title', { required: true })}
            />
          </div>

          {/* Assign to Person */}
          <div className="space-y-2">
            <Label>Assign to</Label>
            <Select 
              value={selectedPersonId || ''} 
              onValueChange={handlePersonSelect}
            >
              <SelectTrigger>
                <SelectValue>
                  {selectedPerson ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={selectedPerson.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {selectedPerson.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedPerson.name}</span>
                    </div>
                  ) : (
                    'Select person'
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {allAssignablePersons.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={person.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {person.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{person.name}</span>
                      {person.isCurrent && <span className="text-xs text-muted-foreground">(You)</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {form.watch('start_date')?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {form.watch('end_date')?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                // Switch to full form for more options
                onOpenChange(false);
                // Could trigger opening the full event dialog here
              }}
            >
              More options
            </Button>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
