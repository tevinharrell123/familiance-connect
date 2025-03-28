
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

  // Track the last fetch timestamp to prevent frequent refreshes
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number>(0);

  const fetchUserHouseholdData = async (userId: string) => {
    await fetchUserHousehold(userId, setHousehold, setUserRole, getHouseholdMembers);
    setLastFetchTimestamp(Date.now());
  };

  const refreshHousehold = async (): Promise<void> => {
    if (!user) return;
    
    // Prevent refreshing too frequently (throttle to once per second)
    const now = Date.now();
    if (now - lastFetchTimestamp < 1000) {
      console.log('Skipping refresh - too soon after last refresh');
      return;
    }
    
    try {
      setIsLoading(true);
      await fetchUserHouseholdData(user.id);
      setLastFetchTimestamp(now);
      
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
