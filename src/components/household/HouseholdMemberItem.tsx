
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

  const getDisplayName = () => {
    if (member.user_profiles?.full_name) {
      return member.user_profiles.full_name;
    }
    return `Unknown Member`;
  };

  const fullName = getDisplayName();
  const initials = getInitials(member.user_profiles?.full_name);
  const isUnknownMember = !member.user_profiles?.full_name;
  
  return (
    <div className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-accent/10 transition-colors">
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12 border-2 border-primary/10">
          <AvatarImage 
            src={member.user_profiles?.avatar_url || ''} 
            alt={fullName} 
            className="object-cover"
          />
          <AvatarFallback className="text-primary-foreground bg-primary/80">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-base">
            {fullName} 
            {isCurrentUser && <span className="text-sm text-primary ml-1">(You)</span>}
            {isUnknownMember && <span className="text-xs text-muted-foreground ml-1">({member.user_id.substring(0, 6)}...)</span>}
          </p>
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
