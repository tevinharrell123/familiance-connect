import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { Household, Member, HouseholdContextType } from '@/types/household';
import { 
  fetchMembershipData,
  fetchHouseholdData,
  fetchHouseholdMembers,
  fetchUserProfiles,
  combineProfilesWithMembers
} from '@/services/householdService';

const HouseholdContext = createContext<HouseholdContextType>({
  household: null,
  members: [],
  isLoading: true,
  isAdmin: false,
  inviteMember: async () => {},
  refreshHousehold: async () => {},
});

export const HouseholdProvider = ({ children }: { children: React.ReactNode }) => {
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  const fetchHouseholdData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      console.log("Fetching household data for user:", user.id);
      
      // Step 1: Get the user's membership
      const membershipData = await fetchMembershipData(user.id);

      if (!membershipData) {
        console.log("No household membership found for user");
        setIsLoading(false);
        return;
      }

      // Step 2: Set admin status
      setIsAdmin(membershipData.role === 'admin');
      console.log("User role:", membershipData.role);

      // Step 3: Get household details
      const householdData = await fetchHouseholdData(membershipData.household_id);

      if (!householdData) {
        console.log("No household found with ID:", membershipData.household_id);
        setIsLoading(false);
        return;
      }

      console.log("Household found:", householdData.name);
      setHousehold(householdData);

      // Step 4: Fetch memberships
      const membershipsData = await fetchHouseholdMembers(membershipData.household_id);

      if (!membershipsData || membershipsData.length === 0) {
        console.log("No members found for household");
        setMembers([]);
        setIsLoading(false);
        return;
      }

      console.log(`Found ${membershipsData.length} members for household`);

      // Step 5: Fetch user profiles separately
      const userIds = membershipsData.map(m => m.user_id);
      const profilesData = await fetchUserProfiles(userIds);
      
      // Step 6: Combine membership data with profile data
      const formattedMembers = combineProfilesWithMembers(membershipsData, profilesData || []);
      
      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error in household data fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHouseholdData();
    } else {
      setHousehold(null);
      setMembers([]);
      setIsAdmin(false);
      setIsLoading(false);
    }
  }, [user]);

  const inviteMember = async (email: string, role: 'admin' | 'adult' | 'child') => {
    // This is a placeholder. In a real app, you would:
    // 1. Create a new user (or find an existing one)
    // 2. Add them to the household with the correct role
    // 3. Send them an email invitation
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${email}`,
    });
  };

  const refreshHousehold = async () => {
    await fetchHouseholdData();
  };

  return (
    <HouseholdContext.Provider 
      value={{ 
        household, 
        members, 
        isLoading, 
        isAdmin, 
        inviteMember,
        refreshHousehold
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
};

export const useHousehold = () => useContext(HouseholdContext);
