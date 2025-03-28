
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HouseholdMember, HouseholdRole } from '@/types/household';
import { HouseholdMemberRoleSelect } from './HouseholdMemberRoleSelect';

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
  
  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getFullName = () => {
    if (member.user_profiles?.full_name) {
      return member.user_profiles.full_name;
    }
    return `User (${member.user_id.substring(0, 6)}...)`;
  };

  const fullName = getFullName();
  const initials = getInitials(member.user_profiles?.full_name);
  
  return (
    <div className="flex items-center justify-between p-3 bg-card border rounded-lg">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={member.user_profiles?.avatar_url || ''} alt={fullName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{fullName} {isCurrentUser && <span className="text-sm text-muted-foreground">(You)</span>}</p>
          <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
        </div>
      </div>
      
      {isAdmin && !isCurrentUser && (
        <HouseholdMemberRoleSelect 
          userId={member.user_id}
          currentRole={member.role}
          onRoleChange={onRoleChange}
        />
      )}
    </div>
  );
};
