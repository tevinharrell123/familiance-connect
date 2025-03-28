
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

  const getHouseholdMembers = async (targetHouseholdId?: string): Promise<HouseholdMember[]> => {
    const finalHouseholdId = targetHouseholdId || householdId;
    if (!finalHouseholdId) return [];
    
    try {
      console.log("Fetching members for household:", finalHouseholdId);
      
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          id,
          household_id,
          user_id,
          role,
          created_at,
          user_profiles:user_id (full_name, avatar_url)
        `)
        .eq('household_id', finalHouseholdId);
        
      if (error) {
        console.error("Error fetching household members:", error);
        throw error;
      }
      
      if (!data) {
        console.log("No members found for household");
        setHouseholdMembers([]);
        return [];
      }
      
      console.log("Household members retrieved:", data);
      
      // Properly type and handle the returned data
      const typedMembers: HouseholdMember[] = data.map(member => ({
        id: member.id,
        household_id: member.household_id,
        user_id: member.user_id,
        role: member.role as HouseholdRole,
        created_at: member.created_at,
        user_profiles: member.user_profiles
      }));
      
      setHouseholdMembers(typedMembers);
      return typedMembers;
    } catch (error: any) {
      console.error('Get household members error:', error);
      return [];
    }
  };

  const updateMemberRole = async (memberId: string, role: HouseholdRole): Promise<void> => {
    if (!householdId || userRole !== 'admin') {
      throw new Error('Only household admins can update member roles');
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('household_members')
        .update({ role })
        .eq('id', memberId)
        .eq('household_id', householdId);
        
      if (error) throw error;
      
      getHouseholdMembers();
      
      toast({
        title: "Role updated",
        description: "The member's role has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Update member role error:', error);
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
