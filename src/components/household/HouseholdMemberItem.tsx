
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { HouseholdMember, HouseholdRole } from '@/types/household';

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
  return (
    <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={member.user_profiles?.avatar_url || undefined} />
          <AvatarFallback>
            {member.user_profiles?.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{member.user_profiles?.full_name || 'Unknown User'}</p>
          <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
        </div>
      </div>
      
      {isAdmin && member.user_id !== currentUserId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRoleChange(member.id, 'admin')}>
              Make Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange(member.id, 'adult')}>
              Set as Adult
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange(member.id, 'child')}>
              Set as Child
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
