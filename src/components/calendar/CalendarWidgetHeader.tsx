
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarNavigation } from '@/components/calendar/CalendarNavigation';
import { PersonFilterDropdown } from '@/components/calendar/PersonFilterDropdown';
import { KeyboardShortcutsDialog } from '@/components/calendar/KeyboardShortcutsDialog';
import { RefreshCw, Plus, Keyboard } from 'lucide-react';
import { HouseholdMember } from '@/types/household';
import { ChildProfile } from '@/types/child-profiles';

interface CalendarWidgetHeaderProps {
  selectedDate: Date;
  view: 'day' | 'week' | 'month';
  onQuickEventCreate: (date: Date) => void;
  onDateChange: (date: Date) => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  householdMembers: HouseholdMember[];
  childProfiles: ChildProfile[] | null;
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
  view,
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
  return (
    <>
      <div className="flex flex-col space-y-3 pb-3 border-b">
        <div className="flex items-center justify-between">
          <CalendarNavigation
            selectedDate={selectedDate}
            view={view}
            onDateChange={onDateChange}
          />
          
          <div className="flex items-center gap-2">
            <PersonFilterDropdown
              householdMembers={householdMembers}
              childProfiles={childProfiles}
              selectedPersonIds={selectedPersonIds}
              onPersonToggle={onPersonToggle}
              onClearFilters={onClearFilters}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={onManualRefresh}
              disabled={isRefreshing}
              className="hidden sm:flex"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleKeyboardShortcuts}
              className="hidden md:flex"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              onClick={() => onQuickEventCreate(selectedDate)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Event</span>
            </Button>
          </div>
        </div>
        
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
      </div>

      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onOpenChange={onToggleKeyboardShortcuts}
        onShortcut={onKeyboardShortcut}
        isEnabled={keyboardShortcutsEnabled}
      />
    </>
  );
}
