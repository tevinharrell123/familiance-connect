
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { HouseholdRole } from '@/types/household';

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
  const handleRoleChange = async (newRole: HouseholdRole) => {
    await onRoleChange(userId, newRole);
  };

  const roles: HouseholdRole[] = ['admin', 'adult', 'child', 'guest'];

  return (
    <Select 
      value={currentRole} 
      onValueChange={(value) => handleRoleChange(value as HouseholdRole)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role} value={role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
