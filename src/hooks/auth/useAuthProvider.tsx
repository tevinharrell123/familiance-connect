import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Household, HouseholdMember, HouseholdRole } from '@/types/household';
import { generateInviteCode } from '@/lib/utils';

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
    // Set up auth state listener FIRST
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

    // THEN check for existing session
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
      
      // Fetch the user's household membership
      fetchUserHousehold(userId);
      
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const fetchUserHousehold = async (userId: string) => {
    try {
      // Check if user is a member of any household
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
        
        // Fetch all members of the household
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
      
      // Create a unique invite code
      const inviteCode = generateInviteCode();
      
      // Insert the new household
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert({ name, invite_code: inviteCode })
        .select()
        .single();
        
      if (householdError) throw householdError;
      
      // Add the current user as admin
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: householdData.id,
          user_id: user.id,
          role: 'admin'
        });
        
      if (memberError) throw memberError;
      
      // Update local state
      setHousehold(householdData);
      setUserRole('admin');
      
      // Fetch members (just the admin at this point)
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
      
      // Find the household by invite code
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
      
      // Check if user is already a member
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
      
      // Add user as a guest initially
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: householdData.id,
          user_id: user.id,
          role: 'guest'
        });
        
      if (memberError) throw memberError;
      
      // Update local state
      setHousehold(householdData);
      setUserRole('guest');
      
      // Fetch all members
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
      
      // Format the members data
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
      
      // Refresh members list
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
      
      // Admin can't leave unless they're the only member
      if (userRole === 'admin' && householdMembers && householdMembers.length > 1) {
        toast({
          title: "Cannot leave household",
          description: "As the admin, you must transfer ownership before leaving.",
          variant: "destructive",
        });
        return;
      }
      
      // Delete the membership
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('household_id', household.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // If this was the last member, delete the household
      if (householdMembers && householdMembers.length === 1) {
        await supabase
          .from('households')
          .delete()
          .eq('id', household.id);
      }
      
      // Update local state
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

function useSignIn(
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  navigate: ReturnType<typeof useNavigate>
) {
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      navigate('/');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn };
}

function useSignUp(
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  navigate: ReturnType<typeof useNavigate>
) {
  const uploadProfileImage = async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatar/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading profile image:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return null;
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name?: string, dob?: string }, profileImage?: File) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // If we have a profile image and a user was created
      if (profileImage && data.user) {
        const avatarUrl = await uploadProfileImage(data.user.id, profileImage);
        
        // Update the profile with the avatar URL
        if (avatarUrl) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ avatar_url: avatarUrl })
            .eq('id', data.user.id);
            
          if (profileError) {
            console.error('Error updating profile with avatar:', profileError);
          }
        }
      }

      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account.",
      });
      navigate('/auth');
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { signUp };
}

function useSignOut(
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  navigate: ReturnType<typeof useNavigate>
) {
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      navigate('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { signOut };
}
