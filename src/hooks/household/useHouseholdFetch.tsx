
import { supabase } from '@/integrations/supabase/client';
import { HouseholdRole } from '@/types/household';

export async function fetchUserHousehold(
  userId: string,
  setHousehold: (household: any) => void,
  setUserRole: (role: HouseholdRole | null) => void,
  getHouseholdMembers: (householdId: string) => Promise<any>
) {
  try {
    console.log("Fetching household for user:", userId);
    
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .select('*, role')
        .eq('user_id', userId)
        .maybeSingle();

      if (memberError) {
        console.error('Error fetching household membership:', memberError);
        return;
      }

      if (memberData) {
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
        setUserRole(null);
      }
    } catch (err) {
      console.error("Error in member fetch:", err);
    }
  } catch (error) {
    console.error('Error in fetchUserHousehold:', error);
  }
}
