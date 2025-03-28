
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

  const getHouseholdMembers = async (id: string): Promise<void> => {
    try {
      console.log('Fetching members for household:', id);
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          *,
          user_profiles:profiles(full_name, avatar_url)
        `)
        .eq('household_id', id);

      if (error) {
        console.error('Error fetching household members:', error.message);
        return;
      }

      console.log('Household members data:', data);
      
      const members: HouseholdMember[] = data.map((item: any) => ({
        id: item.id,
        household_id: item.household_id,
        user_id: item.user_id,
        role: item.role as HouseholdRole,
        created_at: item.created_at,
        user_profiles: item.user_profiles ? {
          full_name: item.user_profiles.full_name,
          avatar_url: item.user_profiles.avatar_url
        } : null
      }));

      setHouseholdMembers(members);
    } catch (error) {
      console.error('Error in getHouseholdMembers:', error);
    }
  };

  const updateMemberRole = async (userId: string, role: HouseholdRole): Promise<void> => {
    if (!householdId || userRole !== 'admin') {
      throw new Error('Only admins can update member roles');
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('household_members')
        .update({ role })
        .eq('user_id', userId)
        .eq('household_id', householdId);
        
      if (error) throw error;
      
      await getHouseholdMembers(householdId);
      
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
