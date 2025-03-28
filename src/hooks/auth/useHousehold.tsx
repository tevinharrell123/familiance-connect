
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Household, HouseholdMember, HouseholdRole } from '@/types/household';
import { useHouseholdManagement } from '../household/useHouseholdManagement';
import { fetchUserHousehold } from '../household/useHouseholdFetch';

export function useHousehold(
  user: any | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const {
    household,
    householdMembers,
    userRole,
    setHousehold,
    setUserRole,
    createHousehold,
    joinHousehold,
    leaveHousehold,
    deleteHousehold,
    getHouseholdMembers,
    updateMemberRole
  } = useHouseholdManagement(user, setIsLoading);

  const fetchUserHouseholdData = async (userId: string) => {
    await fetchUserHousehold(userId, setHousehold, setUserRole, getHouseholdMembers);
  };

  const refreshHousehold = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await fetchUserHouseholdData(user.id);
      
      toast({
        title: "Refreshed",
        description: "Household data has been refreshed.",
      });
    } catch (error: any) {
      console.error('Refresh household error:', error);
      toast({
        title: "Failed to refresh data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    household,
    householdMembers,
    userRole,
    fetchUserHousehold: fetchUserHouseholdData,
    createHousehold,
    joinHousehold,
    getHouseholdMembers,
    updateMemberRole,
    leaveHousehold,
    deleteHousehold,
    refreshHousehold,
  };
}
