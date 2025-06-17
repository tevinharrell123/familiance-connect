
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  onQuickAction: (action: string) => void;
  isEnabled: boolean;
}

const SHORTCUTS = [
  { key: 'N', action: 'new-event', description: 'Create new event' },
  { key: 'T', action: 'today', description: 'Go to today' },
  { key: 'D', action: 'day-view', description: 'Switch to day view' },
  { key: 'W', action: 'week-view', description: 'Switch to week view' },
  { key: 'M', action: 'month-view', description: 'Switch to month view' },
  { key: '←', action: 'prev', description: 'Previous period' },
  { key: '→', action: 'next', description: 'Next period' },
  { key: 'R', action: 'refresh', description: 'Refresh calendar' },
  { key: 'Escape', action: 'close', description: 'Close dialogs' },
];

export function KeyboardShortcuts({ onQuickAction, isEnabled }: KeyboardShortcutsProps) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      // Don't trigger if modifier keys are held (except for arrow keys)
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();
      
      switch (key) {
        case 'n':
          event.preventDefault();
          onQuickAction('new-event');
          break;
        case 't':
          event.preventDefault();
          onQuickAction('today');
          break;
        case 'd':
          event.preventDefault();
          onQuickAction('day-view');
          break;
        case 'w':
          event.preventDefault();
          onQuickAction('week-view');
          break;
        case 'm':
          event.preventDefault();
          onQuickAction('month-view');
          break;
        case 'arrowleft':
          event.preventDefault();
          onQuickAction('prev');
          break;
        case 'arrowright':
          event.preventDefault();
          onQuickAction('next');
          break;
        case 'r':
          event.preventDefault();
          onQuickAction('refresh');
          break;
        case 'escape':
          event.preventDefault();
          onQuickAction('close');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onQuickAction, isEnabled]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Keyboard className="w-5 h-5" />
          Keyboard Shortcuts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {SHORTCUTS.map((shortcut) => (
          <div key={shortcut.key} className="flex items-center justify-between">
            <span className="text-sm">{shortcut.description}</span>
            <Badge variant="outline" className="font-mono text-xs">
              {shortcut.key}
            </Badge>
          </div>
        ))}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Shortcuts are {isEnabled ? 'enabled' : 'disabled'}. They work when not typing in form fields.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
