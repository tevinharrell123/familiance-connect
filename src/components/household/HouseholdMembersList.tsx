
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Edit, Trash2 } from 'lucide-react';
import { HouseholdMember, HouseholdRole } from '@/types/household';
import { ChildProfile, UpdateChildProfileData } from '@/types/child-profiles';
import { HouseholdMemberItem } from './HouseholdMemberItem';
import { ChildProfileDialog } from './ChildProfileDialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface HouseholdMembersListProps {
  members: HouseholdMember[] | null;
  childProfiles: ChildProfile[];
  isAdmin: boolean;
  currentUserId: string;
  onRoleChange: (memberId: string, role: HouseholdRole) => Promise<void>;
  onRefresh: () => Promise<void>;
  onRefreshChildren: () => Promise<void>;
  onUpdateChild: (id: string, data: UpdateChildProfileData) => Promise<void>;
  onDeleteChild: (id: string) => Promise<void>;
  canManageChildren: boolean;
  isRefreshing: boolean;
}

export const HouseholdMembersList = ({ 
  members, 
  childProfiles,
  isAdmin, 
  currentUserId,
  onRoleChange,
  onRefresh,
  onRefreshChildren,
  onUpdateChild,
  onDeleteChild,
  canManageChildren,
  isRefreshing
}: HouseholdMembersListProps) => {
  const isMobile = useIsMobile();
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [childDialogOpen, setChildDialogOpen] = useState(false);

  const handleEditChild = (child: ChildProfile) => {
    setEditingChild(child);
    setChildDialogOpen(true);
  };

  const handleUpdateChild = async (data: UpdateChildProfileData) => {
    if (editingChild) {
      await onUpdateChild(editingChild.id, data);
      setEditingChild(null);
      setChildDialogOpen(false);
    }
  };

  const handleDeleteChild = async (id: string) => {
    await onDeleteChild(id);
  };

  const getChildInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getChildAvatarColor = (name: string) => {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-blue-100 text-blue-600', 
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-orange-100 text-orange-600'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };
  
  return (
    <div className="bg-card rounded-lg p-3 shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Household Members</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            onRefresh();
            onRefreshChildren();
          }} 
          disabled={isRefreshing}
          className="h-8 px-2 text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} /> 
          Refresh
        </Button>
      </div>

      <ScrollArea className="h-[250px] sm:h-[350px] pr-2">
        <div className="space-y-2">
          {/* Adult Members */}
          {members && members.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Adults</h4>
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
          )}

          {/* Child Profiles */}
          {childProfiles.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-medium text-muted-foreground">Children</h4>
              {childProfiles.map((child) => (
                <div key={child.id} className="flex items-center justify-between p-2 bg-card border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={child.avatar_url || ''} alt={child.name} />
                      <AvatarFallback className={`text-xs ${getChildAvatarColor(child.name)}`}>
                        {getChildInitials(child.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {child.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Child
                        </Badge>
                        {child.age && (
                          <span className="text-xs text-muted-foreground">
                            Age {child.age}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {canManageChildren && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditChild(child)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Child Profile</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {child.name}'s profile? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteChild(child.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {(!members || members.length === 0) && childProfiles.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <p>No members found. Try refreshing the data.</p>
              <Button variant="outline" className="mt-3 text-xs" onClick={onRefresh}>
                <RefreshCw className="h-3 w-3 mr-1" /> Refresh
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      <ChildProfileDialog
        open={childDialogOpen}
        onOpenChange={(open) => {
          setChildDialogOpen(open);
          if (!open) {
            setEditingChild(null);
          }
        }}
        onSubmit={handleUpdateChild}
        childProfile={editingChild}
        isEditing={!!editingChild}
      />
    </div>
  );
};
