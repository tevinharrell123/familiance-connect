
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { ChildProfile } from '@/types/child-profiles';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChildProfileItemProps {
  childProfile: ChildProfile;
  onEdit: (childProfile: ChildProfile) => void;
  onDelete: (id: string) => void;
  canManage: boolean;
}

export function ChildProfileItem({ 
  childProfile, 
  onEdit, 
  onDelete,
  canManage 
}: ChildProfileItemProps) {
  const isMobile = useIsMobile();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const initials = getInitials(childProfile.name);
  
  return (
    <div className="flex items-center justify-between p-2 bg-card border rounded-lg">
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={childProfile.avatar_url || ''} alt={childProfile.name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">
            {childProfile.name}
            <span className="text-xs text-muted-foreground ml-1">(Child)</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {childProfile.age ? `Age ${childProfile.age}` : 'Age not specified'}
          </p>
        </div>
      </div>
      
      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(childProfile)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(childProfile.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
