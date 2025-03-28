
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Household, HouseholdMember, HouseholdRole } from '@/types/household';

export function useHouseholdData(
  user: any | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[] | null>(null);
  const [userRole, setUserRole] = useState<HouseholdRole | null>(null);

  const fetchUserHousehold = async (userId: string) => {
    try {
      console.log("Fetching household for user:", userId);
      
      // Try-catch for the household member query to prevent app crashing
      try {
        const { data: memberData, error: memberError } = await supabase
          .from('household_members')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (memberError) {
          console.error('Error fetching household membership:', memberError);
          return;
        }

        // If we found a household membership
        if (memberData) {
          // Fetch the actual household details
          try {
            const { data: householdData, error: householdError } = await supabase
              .from('households')
              .select('*')
              .eq('id', memberData.household_id)
              .single();

            if (householdError) {
              console.error('Error fetching household details:', householdError);
              return;
            }

            setHousehold(householdData);
            setUserRole(memberData.role as HouseholdRole);
            
            await getHouseholdMembers(householdData.id);
          } catch (err) {
            console.error("Error in household fetch:", err);
          }
        } else {
          setHousehold(null);
          setHouseholdMembers(null);
          setUserRole(null);
        }
      } catch (err) {
        console.error("Error in member fetch:", err);
      }
    } catch (error) {
      console.error('Error in fetchUserHousehold:', error);
    }
  };

  const getHouseholdMembers = async (householdId?: string): Promise<HouseholdMember[]> => {
    const targetHouseholdId = householdId || household?.id;
    if (!targetHouseholdId) return [];
    
    try {
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('household_id', targetHouseholdId);
        
      if (error) throw error;
      
      const members: HouseholdMember[] = data.map((member: any) => ({
        ...member,
        full_name: member.profiles.full_name,
        avatar_url: member.profiles.avatar_url
      }));
      
      setHouseholdMembers(members);
      return members;
    } catch (error: any) {
      console.error('Get household members error:', error);
      return [];
    }
  };

  const refreshHousehold = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await fetchUserHousehold(user.id);
      
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
    setHousehold,
    householdMembers,
    setHouseholdMembers,
    userRole,
    setUserRole,
    fetchUserHousehold,
    getHouseholdMembers,
    refreshHousehold,
  };
}
