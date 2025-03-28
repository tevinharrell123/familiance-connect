
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, UserPlus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InviteMembersDialogProps {
  inviteCode: string;
}

export const InviteMembersDialog = ({ inviteCode }: InviteMembersDialogProps) => {
  const handleCopyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      toast({
        title: "Invite code copied",
        description: "The invite code has been copied to your clipboard",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" /> Invite Members
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Family Members</DialogTitle>
          <DialogDescription>
            Share this invite code with family members to join your household.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4 p-4 bg-muted rounded-md">
          <code className="text-lg font-mono">{inviteCode}</code>
          <Button variant="ghost" size="icon" onClick={handleCopyInviteCode}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleCopyInviteCode}>
            Copy Invite Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
