
import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { QuickEventTemplates } from './QuickEventTemplates';
import { CalendarFormValues } from '@/types/calendar';
import { format, addHours, setHours } from 'date-fns';
import { Clock, Calendar } from 'lucide-react';

interface QuickEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CalendarFormValues) => void;
  selectedDate?: Date;
  selectedTemplate?: string;
}

interface EventTemplate {
  id: string;
  label: string;
  icon: string;
  duration: number;
  description?: string;
  color?: string;
}

export function QuickEventDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  selectedDate,
  selectedTemplate 
}: QuickEventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState(1);
  const [showTemplates, setShowTemplates] = useState(!selectedTemplate);
  const [color, setColor] = useState('#7B68EE');

  React.useEffect(() => {
    if (selectedTemplate) {
      // Set default values based on template
      const templates: Record<string, Partial<EventTemplate>> = {
        'school-pickup': { label: 'School Pickup', duration: 1, description: 'Pick up kids from school', color: '#4A90E2' },
        'doctor-appointment': { label: 'Doctor Appointment', duration: 2, description: 'Medical appointment', color: '#E74C3C' },
        'meeting': { label: 'Work Meeting', duration: 1, description: 'Business meeting', color: '#8E44AD' },
        'dentist': { label: 'Dentist Appointment', duration: 1.5, description: 'Dental checkup', color: '#27AE60' },
        'grocery-shopping': { label: 'Grocery Shopping', duration: 1, description: 'Weekly grocery run', color: '#F39C12' },
      };
      
      const template = templates[selectedTemplate];
      if (template) {
        setTitle(template.label || '');
        setDescription(template.description || '');
        setDuration(template.duration || 1);
        setColor(template.color || '#7B68EE');
        setShowTemplates(false);
      }
    }
  }, [selectedTemplate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !selectedDate) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const startDate = setHours(selectedDate, hours);
    startDate.setMinutes(minutes);
    
    const endDate = addHours(startDate, duration);

    const eventData: CalendarFormValues = {
      title: title.trim(),
      description: description.trim(),
      start_date: startDate,
      end_date: endDate,
      color,
      is_household_event: false,
      category: 'Other'
    };

    onSubmit(eventData);
    
    // Reset form
    setTitle('');
    setDescription('');
    setSelectedTime('09:00');
    setDuration(1);
    setColor('#7B68EE');
    setShowTemplates(true);
  };

  const handleTemplateSelect = (template: EventTemplate) => {
    setTitle(template.label);
    setDescription(template.description || '');
    setDuration(template.duration);
    setColor(template.color || '#7B68EE');
    setShowTemplates(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Quick Event Creation
          </DialogTitle>
          <DialogDescription>
            {selectedDate ? (
              <>Create a new event for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</>
            ) : (
              'Create a new event'
            )}
          </DialogDescription>
        </DialogHeader>

        {showTemplates ? (
          <div className="space-y-4">
            <QuickEventTemplates 
              onTemplateSelect={handleTemplateSelect}
              selectedDate={selectedDate}
            />
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowTemplates(false)}
                className="w-full"
              >
                Create Custom Event
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add event description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0.5"
                  max="24"
                  step="0.5"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Event Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1 rounded"
                />
                <div className="flex-1 text-sm text-muted-foreground">
                  Choose a color for your event
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowTemplates(true)}
              >
                Back to Templates
              </Button>
              <div className="space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!title.trim()}>
                  Create Event
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
