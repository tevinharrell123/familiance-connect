
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
    <div className="bg-card rounded-lg p-3 sm:p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold">Household Members</h3>
        <Button 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          onClick={onRefresh} 
          disabled={isRefreshing}
          className="h-8 sm:h-9 px-2 sm:px-4 text-xs sm:text-sm"
        >
          <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
          Refresh
        </Button>
      </div>

      {members && members.length > 0 ? (
        <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4">
          <div className="space-y-2 sm:space-y-4">
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
        <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
          <p>No members found. Try refreshing the data.</p>
          <Button variant="outline" className="mt-3 sm:mt-4 text-xs sm:text-sm" onClick={onRefresh}>
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Refresh
          </Button>
        </div>
      )}
    </div>
  );
};
