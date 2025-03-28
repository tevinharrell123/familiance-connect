
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HouseholdRole } from '@/types/household';

interface LeaveHouseholdDialogProps {
  userRole: HouseholdRole | null;
  membersCount: number;
  onLeaveHousehold: () => Promise<void>;
  isLeaving: boolean;
}

export const LeaveHouseholdDialog = ({ 
  userRole, 
  membersCount, 
  onLeaveHousehold,
  isLeaving
}: LeaveHouseholdDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Leave Household
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Household?</DialogTitle>
          <DialogDescription>
            {userRole === 'admin' && membersCount > 1 
              ? "As the admin, if you leave, another member will be promoted to admin."
              : "Are you sure you want to leave this household? This action cannot be undone."
            }
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" type="button">Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={onLeaveHousehold}
            disabled={isLeaving}
          >
            {isLeaving ? "Leaving..." : "Leave Household"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
