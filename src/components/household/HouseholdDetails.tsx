import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Household, HouseholdMember, HouseholdRole } from '@/types/household';
import { HouseholdMembersList } from './HouseholdMembersList';
import { InviteMembersDialog } from './InviteMembersDialog';
import { LeaveHouseholdDialog } from './LeaveHouseholdDialog';

interface HouseholdDetailsProps {
  household: Household;
  householdMembers: HouseholdMember[] | null;
  userRole: HouseholdRole | null;
  userId: string;
  onRefreshHousehold: () => Promise<void>;
  onLeaveHousehold: () => Promise<void>;
  onRoleChange: (memberId: string, role: HouseholdRole) => Promise<void>;
  isRefreshing: boolean;
  isLeaving: boolean;
}

export const HouseholdDetails = ({
  household,
  householdMembers,
  userRole,
  userId,
  onRefreshHousehold,
  onLeaveHousehold,
  onRoleChange,
  isRefreshing,
  isLeaving
}: HouseholdDetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{household.name}</CardTitle>
            <CardDescription>
              {userRole === 'admin' ? 'You are the admin of this household' : 'You are a member of this household'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefreshHousehold}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              Refresh
            </Button>
            <InviteMembersDialog inviteCode={household.invite_code} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <HouseholdMembersList 
          members={householdMembers}
          isAdmin={userRole === 'admin'}
          currentUserId={userId}
          onRoleChange={onRoleChange}
          onRefresh={onRefreshHousehold}
          isRefreshing={isRefreshing}
        />
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <LeaveHouseholdDialog 
          userRole={userRole}
          membersCount={householdMembers?.length || 0}
          onLeaveHousehold={onLeaveHousehold}
          isLeaving={isLeaving}
        />
      </CardFooter>
    </Card>
  );
};
