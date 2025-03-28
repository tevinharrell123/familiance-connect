
import { generateInviteCode } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Household } from '@/types/household';

export function useHouseholdCreate(
  user: any | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setHousehold: React.Dispatch<React.SetStateAction<Household | null>>,
  setUserRole: React.Dispatch<React.SetStateAction<any>>,
  getHouseholdMembers: (householdId?: string) => Promise<any[]>
) {
  const createHousehold = async (name: string): Promise<Household> => {
    if (!user) throw new Error('User must be logged in to create a household');
    
    try {
      setIsLoading(true);
      console.log("Creating household:", name);
      
      const inviteCode = generateInviteCode();
      console.log("Generated invite code:", inviteCode);
      
      // Step 1: Insert the household record
      console.log("Step 1: Creating the household record");
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert([{ name, invite_code: inviteCode }])
        .select()
        .single();
        
      if (householdError) {
        console.error("Household creation error:", householdError);
        throw new Error(`Failed to create household: ${householdError.message}`);
      }
      
      if (!householdData) {
        throw new Error("Household creation failed: No data returned");
      }
      
      console.log("Household created successfully:", householdData);
      
      // Step 2: Add the user as an admin
      console.log("Step 2: Adding user as admin to household:", householdData.id);
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: householdData.id,
          user_id: user.id,
          role: 'admin'
        }]);
          
      if (memberError) {
        console.error("Error adding user to household:", memberError);
        
        // Step 3: If member creation fails, clean up the household
        console.log("Cleaning up the created household due to membership creation failure");
        const { error: cleanupError } = await supabase
          .from('households')
          .delete()
          .eq('id', householdData.id);
          
        if (cleanupError) {
          console.error("Error cleaning up household:", cleanupError);
        }
          
        throw new Error(`Failed to set household membership: ${memberError.message}`);
      }
      
      console.log("Household member record created successfully");
      
      // Set local state only after successful DB operations
      setHousehold(householdData);
      setUserRole('admin');
      
      // Get household members
      console.log("Fetching household members");
      await getHouseholdMembers(householdData.id);
      
      toast({
        title: "Household created",
        description: `You've successfully created your household: ${name}`,
      });
      
      return householdData;
    } catch (error: any) {
      console.error('Create household error:', error);
      toast({
        title: "Failed to create household",
        description: error.message || "There was an error creating your household",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { createHousehold };
}
