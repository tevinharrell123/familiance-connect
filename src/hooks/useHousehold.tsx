
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
      // Get the user's primary household (first one found)
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('household_id, role')
        .eq('user_id', user.id)
        .single();

      if (membershipError) {
        if (membershipError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error fetching membership:', membershipError);
        }
        setIsLoading(false);
        return;
      }

      // Set admin status
      setIsAdmin(membershipData.role === 'admin');

      // Get household details
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', membershipData.household_id)
        .single();

      if (householdError) {
        console.error('Error fetching household:', householdError);
        setIsLoading(false);
        return;
      }

      setHousehold(householdData);

      // Get all members of this household
      const { data: allMembers, error: membersError } = await supabase
        .from('memberships')
        .select('id, user_id, household_id, role')
        .eq('household_id', membershipData.household_id);

      if (membersError) {
        console.error('Error fetching members:', membersError);
      } else {
        // Fetch profile data for each member separately
        const formattedMembers: Member[] = [];
        
        for (const member of allMembers) {
          // Get user profile data
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('first_name, last_name, avatar_url')
            .eq('id', member.user_id)
            .single();
          
          formattedMembers.push({
            id: member.id,
            user_id: member.user_id,
            household_id: member.household_id,
            role: member.role,
            first_name: profileData?.first_name,
            last_name: profileData?.last_name,
            avatar_url: profileData?.avatar_url,
          });
        }
        
        setMembers(formattedMembers);
      }
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
