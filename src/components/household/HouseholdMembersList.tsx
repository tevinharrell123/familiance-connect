
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw } from 'lucide-react';
import { HouseholdMember, HouseholdRole } from '@/types/household';
import { HouseholdMemberItem } from './HouseholdMemberItem';

interface HouseholdMembersListProps {
  members: HouseholdMember[] | null;
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
    <div className="bg-card rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Household Members</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
          Refresh
        </Button>
      </div>

      {members && members.length > 0 ? (
        <ScrollArea className="h-[400px] pr-4">
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
        </ScrollArea>
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
