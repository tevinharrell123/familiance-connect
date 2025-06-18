
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';

interface EventTemplate {
  id: string;
  label: string;
  icon: string;
  duration: number;
  description?: string;
  color?: string;
  defaultTime?: string;
}

interface QuickEventTemplatesProps {
  onTemplateSelect: (template: EventTemplate) => void;
  selectedDate?: Date;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  { 
    id: 'school-pickup', 
    label: 'School Pickup', 
    icon: '🚗', 
    duration: 0.5,
    description: 'Pick up kids from school',
    color: '#4A90E2',
    defaultTime: '15:00'
  },
  { 
    id: 'doctor-appointment', 
    label: 'Doctor Appointment', 
    icon: '🏥', 
    duration: 2,
    description: 'Medical appointment',
    color: '#E74C3C',
    defaultTime: '10:00'
  },
  { 
    id: 'meeting', 
    label: 'Work Meeting', 
    icon: '💼', 
    duration: 1,
    description: 'Business meeting',
    color: '#8E44AD',
    defaultTime: '14:00'
  },
  { 
    id: 'dentist', 
    label: 'Dentist', 
    icon: '🦷', 
    duration: 1.5,
    description: 'Dental appointment',
    color: '#27AE60',
    defaultTime: '11:00'
  },
  { 
    id: 'grocery-shopping', 
    label: 'Grocery Shopping', 
    icon: '🛒', 
    duration: 1,
    description: 'Weekly grocery run',
    color: '#F39C12',
    defaultTime: '10:00'
  },
  { 
    id: 'workout', 
    label: 'Workout', 
    icon: '💪', 
    duration: 1,
    description: 'Exercise session',
    color: '#E91E63',
    defaultTime: '07:00'
  },
  { 
    id: 'birthday-party', 
    label: 'Birthday Party', 
    icon: '🎂', 
    duration: 3,
    description: 'Birthday celebration',
    color: '#FF6B6B',
    defaultTime: '15:00'
  },
  { 
    id: 'study-session', 
    label: 'Study Session', 
    icon: '📚', 
    duration: 2,
    description: 'Study time',
    color: '#16A085',
    defaultTime: '19:00'
  }
];

export function QuickEventTemplates({ onTemplateSelect, selectedDate }: QuickEventTemplatesProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5" />
          Quick Event Templates
        </CardTitle>
        {selectedDate && (
          <p className="text-sm text-muted-foreground">
            Creating event for {selectedDate.toLocaleDateString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {EVENT_TEMPLATES.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            className="w-full justify-start h-auto p-3"
            onClick={() => onTemplateSelect(template)}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-lg">{template.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{template.label}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {template.duration}h
                  {template.defaultTime && (
                    <>
                      <span className="mx-1">•</span>
                      {template.defaultTime}
                    </>
                  )}
                  {template.description && (
                    <>
                      <span className="mx-1">•</span>
                      {template.description}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
