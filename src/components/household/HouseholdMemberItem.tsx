
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HouseholdMember, HouseholdRole } from '@/types/household';
import { HouseholdMemberRoleSelect } from './HouseholdMemberRoleSelect';
import { useIsMobile } from '@/hooks/use-mobile';

interface HouseholdMemberItemProps {
  member: HouseholdMember;
  isAdmin: boolean;
  currentUserId: string;
  onRoleChange: (memberId: string, role: HouseholdRole) => Promise<void>;
}

export const HouseholdMemberItem = ({ 
  member, 
  isAdmin, 
  currentUserId,
  onRoleChange
}: HouseholdMemberItemProps) => {
  const isCurrentUser = member.user_id === currentUserId;
  const isMobile = useIsMobile();
  
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getDisplayName = () => {
    if (member.user_profiles?.full_name) {
      return member.user_profiles.full_name;
    }
    // Use user ID as fallback with clear indication it's a user ID
    return `User ${member.user_id.substring(0, 8)}`;
  };

  const fullName = getDisplayName();
  const initials = getInitials(member.user_profiles?.full_name);
  
  return (
    <div className="flex items-center justify-between p-2 bg-card border rounded-lg">
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={member.user_profiles?.avatar_url || ''} alt={fullName} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">
            {fullName} 
            {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
          </p>
          <p className="text-xs text-muted-foreground capitalize truncate">{member.role}</p>
        </div>
      </div>
      
      {isAdmin && !isCurrentUser && (
        <div className="ml-2 flex-shrink-0">
          <HouseholdMemberRoleSelect 
            userId={member.user_id}
            currentRole={member.role}
            onRoleChange={onRoleChange}
          />
        </div>
      )}
    </div>
  );
};
