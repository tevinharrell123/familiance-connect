
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { CreateHouseholdModal } from './CreateHouseholdModal';
import { JoinHouseholdModal } from './JoinHouseholdModal';

export function HouseholdSetupModal() {
  const [open, setOpen] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const { household } = useAuth();

  // Close the modal if the user already has a household
  if (household) {
    return null;
  }

  // If user has selected to create or join, show the appropriate modal instead
  if (showCreate) {
    return <CreateHouseholdModal />;
  }

  if (showJoin) {
    return <JoinHouseholdModal />;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to FamPilot!</DialogTitle>
          <DialogDescription>
            To get started, you need to set up or join a household.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Would you like to create a new household or join an existing one?
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            className="flex-1" 
            onClick={() => setShowCreate(true)}
            variant="default"
          >
            Create a Household
          </Button>
          <Button 
            className="flex-1" 
            onClick={() => setShowJoin(true)}
            variant="outline"
          >
            Join a Household
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
