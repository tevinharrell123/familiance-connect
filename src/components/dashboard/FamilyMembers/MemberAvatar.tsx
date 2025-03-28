
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Member } from '@/types/household';

interface MemberAvatarProps {
  member: Member;
}

export function MemberAvatar({ member }: MemberAvatarProps) {
  return (
    <div className="flex flex-col items-center mx-2">
      <Avatar className="h-12 w-12 mb-1">
        {member.avatar_url ? (
          <AvatarImage src={member.avatar_url} alt={member.first_name || 'Member'} />
        ) : null}
        <AvatarFallback>
          {member.first_name ? member.first_name.charAt(0).toUpperCase() : 'U'}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm">{member.first_name || 'User'}</span>
    </div>
  );
}
