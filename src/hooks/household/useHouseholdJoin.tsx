
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Household } from '@/types/household';

export function useHouseholdJoin(
  user: any | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setHousehold: React.Dispatch<React.SetStateAction<Household | null>>,
  setUserRole: React.Dispatch<React.SetStateAction<any>>,
  getHouseholdMembers: (householdId?: string) => Promise<any[]>
) {
  const joinHousehold = async (inviteCode: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in to join a household');
    
    try {
      setIsLoading(true);
      console.log("Joining household with invite code:", inviteCode);
      
      // Step 1: Find the household with the provided invite code
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('invite_code', inviteCode)
        .maybeSingle();
        
      if (householdError) {
        console.error("Error finding household:", householdError);
        throw new Error(`Error finding household: ${householdError.message}`);
      }
      
      if (!householdData) {
        throw new Error("Invalid invite code. The household could not be found.");
      }
      
      console.log("Found household:", householdData);
      
      // Step 2: Check if user is already a member of any household (with our new constraint, they can only be in one)
      const { data: existingMember, error: checkError } = await supabase
        .from('household_members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking existing membership:", checkError);
      }
        
      if (existingMember) {
        console.log("User is already a member of a household");
        toast({
          title: "Already a member",
          description: "You are already a member of a household. You can only be a member of one household at a time.",
          variant: "destructive",
        });
        return;
      }
      
      // Step 3: Add user to the household as a guest
      console.log("Adding user to household as guest");
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: householdData.id,
          user_id: user.id,
          role: 'guest'
        }]);
        
      if (memberError) {
        console.error("Error joining household:", memberError);
        throw new Error(`Failed to join household: ${memberError.message}`);
      }
      
      console.log("Successfully joined household");
      
      // Update local state
      setHousehold(householdData);
      setUserRole('guest');
      
      // Get household members
      await getHouseholdMembers(householdData.id);
      
      toast({
        title: "Joined household",
        description: `You've successfully joined the household: ${householdData.name}`,
      });
    } catch (error: any) {
      console.error('Join household error:', error);
      toast({
        title: "Failed to join household",
        description: error.message || "There was an error joining the household",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { joinHousehold };
}
