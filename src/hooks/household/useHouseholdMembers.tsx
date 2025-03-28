
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { HouseholdMember, HouseholdRole } from '@/types/household';

export function useHouseholdMembers(
  householdId: string | null,
  userRole: HouseholdRole | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[] | null>(null);

  const getHouseholdMembers = async (householdId: string): Promise<HouseholdMember[] | null> => {
    try {
      console.log("Fetching members for household:", householdId);
      
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          household_id,
          user_id,
          role,
          created_at,
          user_profiles:profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('household_id', householdId);

      if (error) {
        console.error("Error fetching household members:", error);
        toast({
          title: "Error",
          description: "Could not fetch household members: " + error.message,
          variant: "destructive",
        });
        return null;
      }

      console.log("Fetched household members:", data);
      
      const members = data.map((member: any) => ({
        id: member.id,
        household_id: member.household_id,
        user_id: member.user_id,
        role: member.role as HouseholdRole,
        created_at: member.created_at,
        user_profiles: member.user_profiles ? {
          full_name: member.user_profiles.full_name || null,
          avatar_url: member.user_profiles.avatar_url || null
        } : null
      })) as HouseholdMember[];
      
      setHouseholdMembers(members);
      return members;
    } catch (error: any) {
      console.error("Error in getHouseholdMembers:", error);
      return null;
    }
  };

  const updateMemberRole = async (memberId: string, role: HouseholdRole): Promise<void> => {
    if (!householdId || userRole !== 'admin') {
      throw new Error("Only household admins can update roles");
    }
    
    try {
      setIsLoading(true);
      console.log(`Updating member ${memberId} to role ${role}`);
      
      const { error } = await supabase
        .from('household_members')
        .update({ role })
        .eq('id', memberId)
        .eq('household_id', householdId);
        
      if (error) {
        console.error("Error updating member role:", error);
        throw new Error(`Failed to update role: ${error.message}`);
      }
      
      const updatedMembers = await getHouseholdMembers(householdId);
      
      if (updatedMembers) {
        toast({
          title: "Role updated",
          description: "The member's role has been updated successfully.",
        });
      }
    } catch (error: any) {
      console.error("Update member role error:", error);
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    householdMembers,
    getHouseholdMembers,
    updateMemberRole
  };
}
