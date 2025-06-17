
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Household, HouseholdMember, HouseholdRole } from '@/types/household';
import { HouseholdMembersList } from './HouseholdMembersList';
import { InviteMembersDialog } from './InviteMembersDialog';
import { LeaveHouseholdDialog } from './LeaveHouseholdDialog';
import { ChildProfileDialog } from './ChildProfileDialog';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { useIsMobile } from '@/hooks/use-mobile';
import { CreateChildProfileData } from '@/types/child-profiles';

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
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [childDialogOpen, setChildDialogOpen] = useState(false);
  
  const { 
    childProfiles, 
    createChildProfile, 
    updateChildProfile, 
    deleteChildProfile,
    refreshChildProfiles 
  } = useChildProfiles();

  const canManageChildren = userRole === 'admin' || userRole === 'adult';

  const handleCreateChild = async (data: CreateChildProfileData) => {
    await createChildProfile(data);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="p-4 pb-0">
        <div className="flex flex-col gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl">{household.name}</CardTitle>
            <CardDescription className="text-sm">
              {userRole === 'admin' ? 'You are the admin of this household' : 'You are a member of this household'}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefreshHousehold}
              disabled={isRefreshing}
              className="h-9 sm:h-10 px-3 text-xs sm:text-sm"
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} /> 
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInviteDialogOpen(true)}
              className="h-9 sm:h-10 px-3 text-xs sm:text-sm"
            >
              <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {isMobile ? 'Invite' : 'Invite Members'}
            </Button>
            {canManageChildren && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setChildDialogOpen(true)}
                className="h-9 sm:h-10 px-3 text-xs sm:text-sm"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {isMobile ? 'Add Child' : 'Add Child'}
              </Button>
            )}
            <InviteMembersDialog 
              open={inviteDialogOpen} 
              onOpenChange={setInviteDialogOpen}
              household={household}
            />
            <ChildProfileDialog
              open={childDialogOpen}
              onOpenChange={setChildDialogOpen}
              onSubmit={handleCreateChild}
              isEditing={false}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <HouseholdMembersList 
          members={householdMembers}
          childProfiles={childProfiles}
          isAdmin={userRole === 'admin'}
          currentUserId={userId}
          onRoleChange={onRoleChange}
          onRefresh={onRefreshHousehold}
          onRefreshChildren={refreshChildProfiles}
          onUpdateChild={updateChildProfile}
          onDeleteChild={deleteChildProfile}
          canManageChildren={canManageChildren}
          isRefreshing={isRefreshing}
        />
      </CardContent>
      <CardFooter className="flex justify-center sm:justify-between border-t p-4">
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
