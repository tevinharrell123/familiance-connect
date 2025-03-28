
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { HouseholdRole } from '@/types/household';
import { HouseholdMemberItem } from './HouseholdMemberItem';

interface HouseholdMembersListProps {
  members: any[] | null;
  isAdmin: boolean;
  currentUserId: string;
  onRoleChange: (memberId: string, role: HouseholdRole) => Promise<void>;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
}

export const HouseholdMembersList = ({ 
  members, 
  isAdmin, 
  currentUserId,
  onRoleChange,
  onRefresh,
  isRefreshing
}: HouseholdMembersListProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Household Members</h3>
      {members && members.length > 0 ? (
        <div className="space-y-4">
          {members.map((member) => (
            <HouseholdMemberItem
              key={member.id}
              member={member}
              isAdmin={isAdmin}
              currentUserId={currentUserId}
              onRoleChange={onRoleChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>No members found. Try refreshing the data.</p>
          <Button variant="outline" className="mt-4" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      )}
    </div>
  );
};
