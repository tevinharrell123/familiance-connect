
import { useHouseholdData } from './useHouseholdData';
import { useHouseholdCreate } from './useHouseholdCreate';
import { useHouseholdJoin } from './useHouseholdJoin';
import { useHouseholdManage } from './useHouseholdManage';
import { Household, HouseholdMember, HouseholdRole } from '@/types/household';

export function useHousehold(
  user: any | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const {
    household,
    setHousehold,
    householdMembers,
    setHouseholdMembers,
    userRole,
    setUserRole,
    fetchUserHousehold,
    getHouseholdMembers,
    refreshHousehold
  } = useHouseholdData(user, setIsLoading);

  const { createHousehold } = useHouseholdCreate(
    user,
    setIsLoading,
    setHousehold,
    setUserRole,
    getHouseholdMembers
  );

  const { joinHousehold } = useHouseholdJoin(
    user,
    setIsLoading,
    setHousehold,
    setUserRole,
    getHouseholdMembers
  );

  const {
    updateMemberRole,
    leaveHousehold,
    deleteHousehold
  } = useHouseholdManage(
    user,
    household,
    userRole,
    householdMembers,
    setIsLoading,
    setHousehold,
    setHouseholdMembers,
    setUserRole,
    getHouseholdMembers
  );

  return {
    household,
    householdMembers,
    userRole,
    fetchUserHousehold,
    createHousehold,
    joinHousehold,
    getHouseholdMembers,
    updateMemberRole,
    leaveHousehold,
    deleteHousehold,
    refreshHousehold,
  };
}
