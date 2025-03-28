
import { HouseholdRole } from "@/types/household";

export const HOUSEHOLD_ROLES: HouseholdRole[] = ['admin', 'adult', 'child', 'guest'];

export const formatRoleName = (role: HouseholdRole): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const getRoleDescription = (role: HouseholdRole): string => {
  switch (role) {
    case 'admin':
      return 'Full control over household';
    case 'adult':
      return 'Can manage most aspects';
    case 'child':
      return 'Limited permissions';
    case 'guest':
      return 'View-only access';
    default:
      return '';
  }
};
