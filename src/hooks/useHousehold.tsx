
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Household {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  household_id: string;
  role: 'admin' | 'adult' | 'child';
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

interface HouseholdContextType {
  household: Household | null;
  members: Member[];
  isLoading: boolean;
  isAdmin: boolean;
  inviteMember: (email: string, role: 'admin' | 'adult' | 'child') => Promise<void>;
  refreshHousehold: () => Promise<void>;
}

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
      
      // Get the user's primary household through their membership
      // Using maybeSingle to handle the case where no membership exists
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('household_id, role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (membershipError) {
        console.error('Error fetching membership:', membershipError);
        setIsLoading(false);
        return;
      }

      if (!membershipData) {
        console.log("No household membership found for user");
        setIsLoading(false);
        return;
      }

      // Set admin status
      setIsAdmin(membershipData.role === 'admin');
      console.log("User role:", membershipData.role);

      // Get household details
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', membershipData.household_id)
        .maybeSingle();

      if (householdError) {
        console.error('Error fetching household:', householdError);
        setIsLoading(false);
        return;
      }

      if (!householdData) {
        console.log("No household found with ID:", membershipData.household_id);
        setIsLoading(false);
        return;
      }

      console.log("Household found:", householdData.name);
      setHousehold(householdData);

      // First fetch all membership IDs
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('memberships')
        .select('id, user_id, household_id, role')
        .eq('household_id', membershipData.household_id);

      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
        setMembers([]);
        setIsLoading(false);
        return;
      }

      if (!membershipsData || membershipsData.length === 0) {
        console.log("No members found for household");
        setMembers([]);
        setIsLoading(false);
        return;
      }

      console.log(`Found ${membershipsData.length} members for household`);

      // Then fetch user profiles separately
      const userIds = membershipsData.map(m => m.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Create a map of user profiles for quick lookup
      const profilesMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);
      
      // Combine membership data with profile data
      const formattedMembers: Member[] = membershipsData.map(membership => {
        const profile = profilesMap[membership.user_id] || {};
        return {
          id: membership.id,
          user_id: membership.user_id,
          household_id: membership.household_id,
          role: membership.role,
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url
        };
      });
      
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
