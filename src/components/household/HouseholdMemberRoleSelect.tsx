
import React, { useState } from 'react';
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

  const handleRoleChange = async (newRole: HouseholdRole) => {
    if (newRole === currentRole) return;
    
    setSelectedRole(newRole);
    setIsChanging(true);
    
    try {
      await onRoleChange(userId, newRole);
      toast({
        title: "Role updated",
        description: `Member role was successfully changed to ${formatRoleName(newRole)}`,
      });
    } catch (error) {
      console.error("Failed to update role:", error);
      setSelectedRole(currentRole); // Revert to previous role on error
      toast({
        title: "Failed to update role",
        description: "There was an error changing the member's role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="relative">
      <Select 
        value={selectedRole} 
        onValueChange={(value) => handleRoleChange(value as HouseholdRole)}
        disabled={isChanging}
      >
        <SelectTrigger className={`w-[180px] ${isChanging ? 'opacity-70' : ''}`}>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {HOUSEHOLD_ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {formatRoleName(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isChanging && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-md">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};
