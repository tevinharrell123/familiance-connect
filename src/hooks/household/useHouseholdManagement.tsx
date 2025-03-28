
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Household, HouseholdRole } from '@/types/household';
import { generateInviteCode } from '@/lib/utils';
import { useHouseholdMembers } from './useHouseholdMembers';

export function useHouseholdManagement(
  user: any | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [household, setHousehold] = useState<Household | null>(null);
  const [userRole, setUserRole] = useState<HouseholdRole | null>(null);
  
  const { 
    householdMembers, 
    getHouseholdMembers, 
    updateMemberRole 
  } = useHouseholdMembers(household?.id || null, userRole, setIsLoading);

  const createHousehold = async (name: string): Promise<Household> => {
    if (!user) throw new Error('User must be logged in to create a household');
    
    try {
      setIsLoading(true);
      console.log("Creating household:", name);
      
      const inviteCode = generateInviteCode();
      console.log("Generated invite code:", inviteCode);
      
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
      
      const { error: memberError } = await supabase
        .from('household_members')
        .insert([{
          household_id: householdData.id,
          user_id: user.id,
          role: 'admin'
        }]);
          
      if (memberError) {
        console.error("Error adding user to household:", memberError);
        
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
      
      setHousehold(householdData);
      setUserRole('admin');
      
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

  const joinHousehold = async (inviteCode: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in to join a household');
    
    try {
      setIsLoading(true);
      console.log("Joining household with invite code:", inviteCode);
      
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
      
      const { data: existingMember, error: checkError } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', householdData.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking existing membership:", checkError);
      }
        
      if (existingMember) {
        console.log("User is already a member of this household");
        toast({
          title: "Already a member",
          description: "You are already a member of this household.",
          variant: "destructive",
        });
        return;
      }
      
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
      
      setHousehold(householdData);
      setUserRole('guest');
      
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

  const leaveHousehold = async (): Promise<void> => {
    if (!household || !user) return;
    
    try {
      setIsLoading(true);
      
      if (userRole === 'admin' && householdMembers && householdMembers.length > 1) {
        toast({
          title: "Cannot leave household",
          description: "As the admin, you must transfer ownership before leaving.",
          variant: "destructive",
        });
        return;
      }
      
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', household.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (householdMembers && householdMembers.length === 1) {
        await supabase
          .from('households')
          .delete()
          .eq('id', household.id);
      }
      
      setHousehold(null);
      setUserRole(null);
      
      toast({
        title: "Left household",
        description: "You've successfully left the household.",
      });
    } catch (error: any) {
      console.error('Leave household error:', error);
      toast({
        title: "Failed to leave household",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHousehold = async (): Promise<void> => {
    if (!household || userRole !== 'admin' || !user) {
      throw new Error('Only household admins can delete a household');
    }
    
    try {
      setIsLoading(true);
      console.log("Deleting household:", household.id);
      
      const { error: membersError } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', household.id);
        
      if (membersError) {
        console.error("Error deleting household members:", membersError);
        throw new Error(`Failed to delete household members: ${membersError.message}`);
      }
      
      const { error: householdError } = await supabase
        .from('households')
        .delete()
        .eq('id', household.id);
        
      if (householdError) {
        console.error("Error deleting household:", householdError);
        throw new Error(`Failed to delete household: ${householdError.message}`);
      }
      
      setHousehold(null);
      setUserRole(null);
      
      toast({
        title: "Household deleted",
        description: "The household has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Delete household error:', error);
      toast({
        title: "Failed to delete household",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
