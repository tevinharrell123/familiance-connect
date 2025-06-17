
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { ChildProfileDialog } from '@/components/household/ChildProfileDialog';
import { ChildProfileItem } from '@/components/household/ChildProfileItem';
import { CreateChildProfileData } from '@/types/child-profiles';

type FamilyMember = {
  id: number;
  name: string;
  avatar?: string;
  initials: string;
};

const familyMembers: FamilyMember[] = [
  {
    id: 1,
    name: "Olivia",
    initials: "O",
  },
  {
    id: 2,
    name: "Sarah",
    avatar: "/lovable-uploads/2dd00b84-e39d-4dea-a414-c955a711e06b.png",
    initials: "S",
  },
  {
    id: 3,
    name: "Jason",
    initials: "J",
  },
  {
    id: 4,
    name: "Ethan",
    initials: "E",
  }
];

export function FamilyMembersWidget() {
  const isMobile = useIsMobile();
  const { household, userRole } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  
  const { 
    childProfiles, 
    createChildProfile, 
    updateChildProfile, 
    deleteChildProfile,
    isLoading: isChildProfilesLoading 
  } = useChildProfiles();

  const canManageChildren = userRole === 'admin' || userRole === 'adult';

  const handleCreateChild = async (data: CreateChildProfileData) => {
    await createChildProfile(data);
  };

  const handleEditChild = (childProfile) => {
    setEditingChild(childProfile);
    setIsDialogOpen(true);
  };

  const handleUpdateChild = async (data: CreateChildProfileData) => {
    if (editingChild) {
      await updateChildProfile(editingChild.id, data);
      setEditingChild(null);
    }
  };

  const handleDeleteChild = async (id: string) => {
    if (confirm('Are you sure you want to remove this child profile?')) {
      await deleteChildProfile(id);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">Family Members</CardTitle>
          {canManageChildren && household && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingChild(null);
                setIsDialogOpen(true);
              }}
              className="h-8 px-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              {isMobile ? 'Add' : 'Add Child'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="flex justify-center mb-3 sm:mb-4">
          {familyMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center mx-1 sm:mx-2">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mb-1">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name} />
                ) : null}
                <AvatarFallback className="text-xs sm:text-sm">{member.initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm">{member.name}</span>
            </div>
          ))}
        </div>

        {/* Child Profiles Section */}
        {household && (
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-medium">Children</h3>
            {isChildProfilesLoading ? (
              <p className="text-xs text-muted-foreground">Loading children...</p>
            ) : childProfiles.length > 0 ? (
              <div className="space-y-2">
                {childProfiles.map((child) => (
                  <ChildProfileItem
                    key={child.id}
                    childProfile={child}
                    onEdit={handleEditChild}
                    onDelete={handleDeleteChild}
                    canManage={canManageChildren}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {canManageChildren 
                  ? 'No children added yet. Click "Add Child" to get started.' 
                  : 'No children in this household yet.'}
              </p>
            )}
          </div>
        )}
        
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Add Request</h3>
          <Button variant="outline" className="w-full justify-start text-left text-xs sm:text-sm py-1 sm:py-2">
            Event Request
          </Button>
          <Button variant="outline" className="w-full justify-start text-left text-xs sm:text-sm py-1 sm:py-2">
            Buying Proposal
          </Button>
          <Button variant="outline" className="w-full justify-start text-left text-xs sm:text-sm py-1 sm:py-2">
            Trip Proposal
          </Button>
        </div>

        <ChildProfileDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={editingChild ? handleUpdateChild : handleCreateChild}
          childProfile={editingChild}
          isEditing={!!editingChild}
        />
      </CardContent>
    </Card>
  );
}
