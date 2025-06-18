
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { KeyboardShortcuts } from '@/components/calendar/KeyboardShortcuts';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShortcut: (action: string) => void;
  isEnabled: boolean;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  onShortcut,
  isEnabled
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <KeyboardShortcuts
          onQuickAction={onShortcut}
          isEnabled={isEnabled}
        />
      </DialogContent>
    </Dialog>
  );
}
