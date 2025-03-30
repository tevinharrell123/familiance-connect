
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Household, HouseholdMember, HouseholdRole } from '@/types/household';
import { HouseholdMembersList } from './HouseholdMembersList';
import { InviteMembersDialog } from './InviteMembersDialog';
import { LeaveHouseholdDialog } from './LeaveHouseholdDialog';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl">{household.name}</CardTitle>
            <CardDescription className="text-sm">
              {userRole === 'admin' ? 'You are the admin of this household' : 'You are a member of this household'}
            </CardDescription>
          </div>
          <div className="flex gap-2 self-end sm:self-auto">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={onRefreshHousehold}
              disabled={isRefreshing}
              className="h-8 sm:h-9 px-2 sm:px-4 text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              Refresh
            </Button>
            <InviteMembersDialog inviteCode={household.invite_code} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <HouseholdMembersList 
          members={householdMembers}
          isAdmin={userRole === 'admin'}
          currentUserId={userId}
          onRoleChange={onRoleChange}
          onRefresh={onRefreshHousehold}
          isRefreshing={isRefreshing}
        />
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4 sm:p-6 pt-4 sm:pt-6">
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
