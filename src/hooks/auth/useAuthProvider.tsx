import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Household, HouseholdMember, HouseholdRole } from '@/types/household';
import { generateInviteCode } from '@/lib/utils';
import { useSignIn } from './useSignIn';
import { useSignUp } from './useSignUp';
import { useSignOut } from './useSignOut';

export function useAuthProvider() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[] | null>(null);
  const [userRole, setUserRole] = useState<HouseholdRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setHousehold(null);
          setHouseholdMembers(null);
          setUserRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      setProfile(data);
      
      fetchUserHousehold(userId);
      
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const fetchUserHousehold = async (userId: string) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('household_members')
        .select(`
          *,
          households:household_id (*)
        `)
        .eq('user_id', userId)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        console.error('Error fetching household membership:', memberError);
        return;
      }

      if (memberData) {
        setHousehold(memberData.households as Household);
        setUserRole(memberData.role as HouseholdRole);
        
        getHouseholdMembers();
      } else {
        setHousehold(null);
        setHouseholdMembers(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error fetching household:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      return await fetchProfile(user.id);
    }
    return null;
  };

  const createHousehold = async (name: string): Promise<Household> => {
    if (!user) throw new Error('User must be logged in to create a household');
    
    try {
      setIsLoading(true);
      
      const inviteCode = generateInviteCode();
      
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert({ name, invite_code: inviteCode })
        .select()
        .single();
        
      if (householdError) throw householdError;
      
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: householdData.id,
          user_id: user.id,
          role: 'admin'
        });
        
      if (memberError) throw memberError;
      
      setHousehold(householdData);
      setUserRole('admin');
      
      getHouseholdMembers();
      
      toast({
        title: "Household created",
        description: `You've successfully created your household: ${name}`,
      });
      
      return householdData;
    } catch (error: any) {
      console.error('Create household error:', error);
      toast({
        title: "Failed to create household",
        description: error.message,
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
      
      getHouseholdMembers();
      
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

  const getHouseholdMembers = async (): Promise<HouseholdMember[]> => {
    if (!household) return [];
    
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
        .eq('household_id', household.id);
        
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

  const { signIn } = useSignIn(setIsLoading, navigate);
  const { signUp } = useSignUp(setIsLoading, navigate);
  const { signOut } = useSignOut(setIsLoading, navigate);

  return {
    session,
    user,
    profile,
    household,
    householdMembers,
    userRole,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    createHousehold,
    joinHousehold,
    getHouseholdMembers,
    updateMemberRole,
    leaveHousehold,
  };
}
