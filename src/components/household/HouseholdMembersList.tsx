
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw } from 'lucide-react';
import { HouseholdMember, HouseholdRole } from '@/types/household';
import { HouseholdMemberItem } from './HouseholdMemberItem';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-card rounded-lg p-3 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Household Members</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onRefresh} 
          disabled={isRefreshing}
          className="h-8 px-2 text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} /> 
          Refresh
        </Button>
      </div>

      {members && members.length > 0 ? (
        <ScrollArea className="h-[250px] sm:h-[350px] pr-2">
          <div className="space-y-2">
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
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p>No members found. Try refreshing the data.</p>
          <Button variant="outline" className="mt-3 text-xs" onClick={onRefresh}>
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh
          </Button>
        </div>
      )}
    </div>
  );
};
