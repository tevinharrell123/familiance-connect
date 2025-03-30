
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { HouseholdRole } from '@/types/household';
import { HOUSEHOLD_ROLES, formatRoleName } from '@/utils/household-roles';
import { useIsMobile } from '@/hooks/use-mobile';

interface HouseholdMemberRoleSelectProps {
  userId: string;
  currentRole: HouseholdRole;
  onRoleChange: (memberId: string, role: HouseholdRole) => Promise<void>;
}

export const HouseholdMemberRoleSelect: React.FC<HouseholdMemberRoleSelectProps> = ({ 
  userId, 
  currentRole, 
  onRoleChange 
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [selectedRole, setSelectedRole] = useState<HouseholdRole>(currentRole);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Update local state only when props change and component is not in the middle of an update
  useEffect(() => {
    if (!isChanging) {
      setSelectedRole(currentRole);
    }
  }, [currentRole, isChanging]);

  const handleRoleChange = useCallback(async (newRole: HouseholdRole) => {
    // Prevent unnecessary API calls if role hasn't changed
    if (newRole === selectedRole || isChanging) return;
    
    setIsChanging(true);
    
    try {
      // Call the parent's role change handler
      await onRoleChange(userId, newRole);
      
      // Only update local state after successful update
      setSelectedRole(newRole);
      
      toast({
        title: "Role updated",
        description: `Member role was successfully changed to ${formatRoleName(newRole)}`,
      });
    } catch (error) {
      console.error("Failed to update role:", error);
      
      // Don't update selectedRole on error
      toast({
        title: "Failed to update role",
        description: "There was an error changing the member's role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  }, [userId, selectedRole, isChanging, onRoleChange, toast]);

  // Memoize the render to prevent unnecessary re-renders
  return (
    <div className="relative">
      <Select 
        value={selectedRole} 
        onValueChange={handleRoleChange}
        disabled={isChanging}
      >
        <SelectTrigger className={`w-[120px] ${isMobile ? 'text-xs' : 'text-sm'} h-8 ${isChanging ? 'opacity-70' : ''}`}>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent className={isMobile ? 'text-xs' : 'text-sm'}>
          {HOUSEHOLD_ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {formatRoleName(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isChanging && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};
