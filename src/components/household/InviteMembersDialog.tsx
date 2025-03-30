
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
import { useIsMobile } from '@/hooks/use-mobile';

interface InviteMembersDialogProps {
  inviteCode: string;
}

export const InviteMembersDialog = ({ inviteCode }: InviteMembersDialogProps) => {
  const isMobile = useIsMobile();
  
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
        <Button variant="outline" size="sm" className="h-9 sm:h-10 text-xs sm:text-sm">
          <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Invite Members
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite Family Members</DialogTitle>
          <DialogDescription>
            Share this invite code with family members to join your household.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4 p-3 sm:p-4 bg-muted rounded-md">
          <code className={`${isMobile ? 'text-sm' : 'text-lg'} font-mono flex-1 overflow-x-auto`}>{inviteCode}</code>
          <Button variant="ghost" size="icon" onClick={handleCopyInviteCode} className="flex-shrink-0">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="mt-4">
          <Button onClick={handleCopyInviteCode} size={isMobile ? "sm" : "default"}>
            Copy Invite Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
