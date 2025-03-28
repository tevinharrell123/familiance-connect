
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Household, HouseholdRole } from '@/types/household';

export function useHouseholdManage(
  user: any | null,
  household: Household | null,
  userRole: HouseholdRole | null,
  householdMembers: any[] | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setHousehold: React.Dispatch<React.SetStateAction<Household | null>>,
  setHouseholdMembers: React.Dispatch<React.SetStateAction<any[] | null>>,
  setUserRole: React.Dispatch<React.SetStateAction<HouseholdRole | null>>,
  getHouseholdMembers: (householdId?: string) => Promise<any[]>
) {
  const updateMemberRole = async (memberId: string, role: HouseholdRole): Promise<void> => {
    if (!household || userRole !== 'admin') {
      throw new Error('Only household admins can update member roles');
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('household_members')
        .update({ role })
        .eq('id', memberId)
        .eq('household_id', household.id);
        
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

  const leaveHousehold = async (): Promise<void> => {
    if (!household || !user) return;
    
    try {
      setIsLoading(true);
      
      if (userRole === 'admin' && householdMembers && householdMembers.length > 1) {
        // Check if there's another admin
        const otherAdminExists = householdMembers.some(
          member => member.role === 'admin' && member.user_id !== user.id
        );
        
        if (!otherAdminExists) {
          toast({
            title: "Cannot leave household",
            description: "As the admin, you must transfer ownership or make another member admin before leaving.",
            variant: "destructive",
          });
          return;
        }
      }
      
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', household.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // If this was the last member and they were admin, delete the household
      if (userRole === 'admin' && householdMembers && householdMembers.length === 1) {
        await supabase
          .from('households')
          .delete()
          .eq('id', household.id);
      }
      
      setHousehold(null);
      setHouseholdMembers(null);
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
      
      // Simply delete the household - the cascade will handle member deletion
      const { error: householdError } = await supabase
        .from('households')
        .delete()
        .eq('id', household.id);
        
      if (householdError) {
        console.error("Error deleting household:", householdError);
        throw new Error(`Failed to delete household: ${householdError.message}`);
      }
      
      setHousehold(null);
      setHouseholdMembers(null);
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
    updateMemberRole,
    leaveHousehold,
    deleteHousehold
  };
}
