
import React from 'react';
import { Button } from '@/components/ui/button';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarFilters } from '@/components/calendar/CalendarFilters';
import { KeyboardShortcuts } from '@/components/calendar/KeyboardShortcuts';
import { RefreshCw, Keyboard } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarWidgetHeaderProps {
  selectedDate: Date;
  view: 'day' | 'week' | 'month';
  onQuickEventCreate: (date: Date) => void;
  onDateChange: (date: Date) => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  householdMembers: any[];
  childProfiles: any[];
  selectedPersonIds: string[];
  onPersonToggle: (personId: string) => void;
  onClearFilters: () => void;
  showKeyboardShortcuts: boolean;
  onToggleKeyboardShortcuts: () => void;
  onKeyboardShortcut: (action: string) => void;
  keyboardShortcutsEnabled: boolean;
}

export function CalendarWidgetHeader({
  selectedDate,
  onQuickEventCreate,
  onDateChange,
  onManualRefresh,
  isRefreshing,
  householdMembers,
  childProfiles,
  selectedPersonIds,
  onPersonToggle,
  onClearFilters,
  showKeyboardShortcuts,
  onToggleKeyboardShortcuts,
  onKeyboardShortcut,
  keyboardShortcutsEnabled
}: CalendarWidgetHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col space-y-2 px-4 py-2 border-b bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <CalendarHeader
          currentDate={selectedDate}
          onAddEvent={() => onQuickEventCreate(selectedDate)}
          onDateChange={onDateChange}
        />
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isMobile ? '' : 'Refresh'}
          </Button>
          {!isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleKeyboardShortcuts}
              className="flex items-center gap-2"
            >
              <Keyboard className="h-4 w-4" />
              Shortcuts
            </Button>
          )}
          <button
            className="p-2 rounded-md text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onQuickEventCreate(selectedDate)}
          >
            + Event
          </button>
          <TabsList>
            <TabsTrigger value="month" className={isMobile ? "px-3" : ""}>
              {isMobile ? "M" : "Month"}
            </TabsTrigger>
            <TabsTrigger value="week" className={isMobile ? "px-3" : ""}>
              {isMobile ? "W" : "Week"}
            </TabsTrigger>
            <TabsTrigger value="day" className={isMobile ? "px-3" : ""}>
              {isMobile ? "D" : "Day"}
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      
      <CalendarFilters
        householdMembers={householdMembers || []}
        childProfiles={childProfiles || []}
        selectedPersonIds={selectedPersonIds}
        onPersonToggle={onPersonToggle}
        onClearFilters={onClearFilters}
      />

      {showKeyboardShortcuts && !isMobile && (
        <div className="flex justify-center">
          <KeyboardShortcuts
            onQuickAction={onKeyboardShortcut}
            isEnabled={keyboardShortcutsEnabled}
          />
        </div>
      )}
    </div>
  );
}
