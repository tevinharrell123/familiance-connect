import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast'; 
import { Household, HouseholdMember, HouseholdRole } from '@/types/household';
import { useNavigate } from 'react-router-dom';

export function useHouseholdManagement(
  user: any | null,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[] | null>(null);
  const [userRole, setUserRole] = useState<HouseholdRole | null>(null);
  const navigate = useNavigate();

  const createHousehold = async (name: string): Promise<void> => {
    if (!user) {
      console.error('User is not authenticated.');
      return;
    }

    try {
      setIsLoading(true);

      // Generate a unique invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert([{ name, invite_code: inviteCode }])
        .select()
        .single();

      if (householdError) {
        console.error('Error creating household:', householdError);
        toast({
          title: "Error creating household",
          description: householdError.message,
          variant: "destructive",
        });
        return;
      }

      if (!householdData) {
        console.error('No household data returned after creation.');
        return;
      }

      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .insert([{ 
          household_id: householdData.id, 
          user_id: user.id, 
          role: 'admin' 
        }])
        .select()
        .single();

      if (memberError) {
        console.error('Error creating household member:', memberError);
        toast({
          title: "Error creating household member",
          description: memberError.message,
          variant: "destructive",
        });
        return;
      }

      setHousehold(householdData);
      setUserRole('admin');
      
      toast({
        title: "Household created",
        description: "Your household has been created successfully.",
      });
      
      navigate('/household');
    } catch (error) {
      console.error('Error creating household:', error);
      toast({
        title: "Error creating household",
        description: "Failed to create household. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const joinHousehold = async (inviteCode: string): Promise<void> => {
    if (!user) {
      console.error('User is not authenticated.');
      return;
    }

    try {
      setIsLoading(true);

      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (householdError) {
        console.error('Error finding household:', householdError);
        toast({
          title: "Invalid invite code",
          description: "Please check the invite code and try again.",
          variant: "destructive",
        });
        return;
      }

      if (!householdData) {
        toast({
          title: "Invalid invite code",
          description: "No household found with this invite code.",
          variant: "destructive",
        });
        return;
      }

      const { data: existingMember, error: existingMemberError } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', householdData.id)
        .eq('user_id', user.id)
        .single();

      if (existingMemberError && existingMemberError.code !== 'PGRST116') {
        console.error('Error checking existing membership:', existingMemberError);
        toast({
          title: "Error checking membership",
          description: "Could not verify existing membership. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (existingMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this household.",
        });
        return;
      }

      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .insert([{ 
          household_id: householdData.id, 
          user_id: user.id, 
          role: 'guest' 
        }])
        .select()
        .single();

      if (memberError) {
        console.error('Error creating household member:', memberError);
        toast({
          title: "Error joining household",
          description: memberError.message,
          variant: "destructive",
        });
        return;
      }

      setHousehold(householdData);
      setUserRole('guest');
      
      toast({
        title: "Joined household",
        description: "You have successfully joined the household.",
      });
      
      navigate('/household');
    } catch (error) {
      console.error('Error joining household:', error);
      toast({
        title: "Error joining household",
        description: "Failed to join household. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getHouseholdMembers = async (householdId: string): Promise<void> => {
    try {
      console.log('Fetching members for household:', householdId);
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          *,
          user_profiles:profiles(full_name, avatar_url)
        `)
        .eq('household_id', householdId);

      if (error) {
        console.error('Error fetching household members:', error);
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

  const updateMemberRole = async (memberId: string, role: HouseholdRole): Promise<void> => {
    if (!household?.id) {
      console.error('Household ID is not available.');
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('household_members')
        .update({ role: role })
        .eq('user_id', memberId)
        .eq('household_id', household?.id);

      if (error) {
        console.error('Error updating member role:', error);
        toast({
          title: "Error updating role",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Optimistically update the role in the local state
      setHouseholdMembers(prevMembers => {
        if (!prevMembers) return prevMembers;
        return prevMembers.map(member => {
          if (member.user_id === memberId) {
            return { ...member, role: role };
          }
          return member;
        });
      });

      toast({
        title: "Member role updated",
        description: "The member's role has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error updating role",
        description: "Failed to update member role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const leaveHousehold = async (): Promise<void> => {
    if (!user || !household) {
      console.error('User or household is not available.');
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('user_id', user.id)
        .eq('household_id', household.id);

      if (error) {
        console.error('Error leaving household:', error);
        toast({
          title: "Error leaving household",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setHousehold(null);
      setUserRole(null);
      setHouseholdMembers(null);
      
      toast({
        title: "Left household",
        description: "You have successfully left the household.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error leaving household:', error);
      toast({
        title: "Error leaving household",
        description: "Failed to leave household. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHousehold = async (): Promise<void> => {
    if (!household) {
      console.error('Household is not available.');
      return;
    }

    try {
      setIsLoading(true);

      // First, delete all members of the household
      const { error: deleteMembersError } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', household.id);

      if (deleteMembersError) {
        console.error('Error deleting household members:', deleteMembersError);
        toast({
          title: "Error deleting household",
          description: "Failed to delete household members. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Then, delete the household itself
      const { error: deleteHouseholdError } = await supabase
        .from('households')
        .delete()
        .eq('id', household.id);

      if (deleteHouseholdError) {
        console.error('Error deleting household:', deleteHouseholdError);
        toast({
          title: "Error deleting household",
          description: "Failed to delete household. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setHousehold(null);
      setUserRole(null);
      setHouseholdMembers(null);
      
      toast({
        title: "Household deleted",
        description: "The household has been successfully deleted.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting household:', error);
      toast({
        title: "Error deleting household",
        description: "Failed to delete household. Please try again.",
        variant: "destructive",
      });
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
    getHouseholdMembers,
    updateMemberRole,
    leaveHousehold,
    deleteHousehold
  };
}
