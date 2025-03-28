
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

interface JoinHouseholdFormProps {
  onJoinHousehold: (inviteCode: string) => Promise<void>;
  isJoining: boolean;
}

export const JoinHouseholdForm = ({ onJoinHousehold, isJoining }: JoinHouseholdFormProps) => {
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    try {
      await onJoinHousehold(inviteCode);
      setInviteCode('');
    } catch (error) {
      console.error('Error in JoinHouseholdForm:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserPlus className="mr-2 h-5 w-5" /> Join Existing Household
        </CardTitle>
        <CardDescription>
          Join an existing household with an invite code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="invite-code" className="text-sm font-medium">
              Invite Code
            </label>
            <Input
              id="invite-code"
              placeholder="Enter invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isJoining || !inviteCode.trim()}>
            {isJoining ? "Joining..." : "Join Household"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
