import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Household, HouseholdMember, HouseholdRole } from '@/types/household';
import { generateInviteCode } from '@/lib/utils';

export function useHousehold(
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

  const createHousehold = async (name: string): Promise<Household> => {
    if (!user) throw new Error('User must be logged in to create a household');
    
    try {
      setIsLoading(true);
      console.log("Creating household:", name);
      
      const inviteCode = generateInviteCode();
      
      // Insert the household first
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert({ name, invite_code: inviteCode })
        .select()
        .single();
        
      if (householdError) {
        console.error("Household creation error:", householdError);
        toast({
          title: "Failed to create household",
          description: householdError.message,
          variant: "destructive",
        });
        throw householdError;
      }
      
      console.log("Household created:", householdData);
      
      // Then add the user as an admin
      try {
        const { error: memberError } = await supabase
          .from('household_members')
          .insert({
            household_id: householdData.id,
            user_id: user.id,
            role: 'admin'
          });
          
        if (memberError) {
          console.error("Error adding user to household:", memberError);
          
          // If member creation fails, clean up the household
          await supabase
            .from('households')
            .delete()
            .eq('id', householdData.id);
            
          toast({
            title: "Failed to set household membership",
            description: memberError.message,
            variant: "destructive",
          });
          throw memberError;
        }
      } catch (err) {
        console.error("Error in member creation:", err);
        throw err;
      }
      
      // Set local state only after successful DB operations
      setHousehold(householdData);
      setUserRole('admin');
      
      // Get household members - don't await this to avoid blocking UI
      getHouseholdMembers(householdData.id).catch(console.error);
      
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
      
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();
        
      if (householdError) {
        toast({
          title: "Invalid invite code",
          description: "The household could not be found with this invite code.",
          variant: "destructive",
        });
        throw householdError;
      }
      
      const { data: existingMember, error: checkError } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', householdData.id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingMember) {
        toast({
          title: "Already a member",
          description: "You are already a member of this household.",
          variant: "destructive",
        });
        return;
      }
      
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: householdData.id,
          user_id: user.id,
          role: 'guest'
        });
        
      if (memberError) throw memberError;
      
      setHousehold(householdData);
      setUserRole('guest');
      
      getHouseholdMembers(householdData.id);
      
      toast({
        title: "Joined household",
        description: `You've successfully joined the household: ${householdData.name}`,
      });
    } catch (error: any) {
      console.error('Join household error:', error);
      toast({
        title: "Failed to join household",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
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

  return {
    household,
    householdMembers,
    userRole,
    fetchUserHousehold,
    createHousehold,
    joinHousehold,
    getHouseholdMembers,
    updateMemberRole,
    leaveHousehold,
  };
}
