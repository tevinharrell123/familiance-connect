
// Check if this file exists, if not create it, else update it with invitation link feature
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from '@/components/ui/use-toast';
import { Copy, Mail } from "lucide-react";
import { Household } from '@/types/household';

interface InviteMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  household?: Household | null;
}

export const InviteMembersDialog = ({
  open,
  onOpenChange,
  household
}: InviteMembersDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  if (!household) return null;
  
  const inviteCode = household.invite_code;
  // Generate a full URL with the invite code as a query parameter
  const inviteUrl = `${window.location.origin}/auth?invite=${inviteCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInviteByEmail = () => {
    // This is just a placeholder - in a real app, you would send this to your backend
    // to send an email with the invite link
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // For now, we'll just copy the link to clipboard
    copyToClipboard(inviteUrl);
    toast({
      title: "Email functionality not implemented",
      description: "In a real app, an email would be sent to " + email + " with the invite link. For now, the link has been copied to your clipboard.",
    });
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite household members</DialogTitle>
          <DialogDescription>
            Share this invitation link with the people you want to join your household.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="link">Invitation Link</Label>
            <div className="flex items-center gap-2">
              <Input
                id="link"
                readOnly
                value={inviteUrl}
                className="flex-1"
              />
              <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                onClick={() => copyToClipboard(inviteUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This link will automatically fill the invite code when they register.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="inviteCode">Or share this code</Label>
            <div className="flex items-center gap-2">
              <Input
                id="inviteCode"
                readOnly
                value={inviteCode}
                className="flex-1"
              />
              <Button 
                type="button" 
                size="icon" 
                variant="outline" 
                onClick={() => copyToClipboard(inviteCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 pt-4 border-t">
            <Label htmlFor="email">Send invitation by email</Label>
            <div className="flex items-center gap-2">
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={sendInviteByEmail}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
