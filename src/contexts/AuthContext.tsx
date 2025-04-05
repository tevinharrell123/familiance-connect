
import React, { createContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { HouseholdRole, Household, HouseholdMember } from '@/types/household';
import { generateInviteCode } from '@/lib/utils';

type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  birthday?: string | null;
};

type Membership = {
  id: string;
  user_id: string;
  household_id: string;
  role: HouseholdRole;
  created_at: string;
  household?: Household;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { full_name: string, birthday?: string, household_name?: string, household_code?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  membership: Membership | null;
  household: Household | null;
  householdMembers: HouseholdMember[] | null;
  userRole: HouseholdRole | null;
  createHousehold: (name: string) => Promise<Household>;
  joinHousehold: (inviteCode: string) => Promise<void>;
  leaveHousehold: () => Promise<void>;
  updateMemberRole: (userId: string, role: HouseholdRole) => Promise<void>;
  refreshHousehold: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
      }

      if (!data) return null;
      
      console.log('Profile data:', data);
      setProfile(data as Profile);
      return data as Profile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const fetchMembership = async (userId: string): Promise<void> => {
    try {
      console.log('Fetching membership for user:', userId);
      const { data: membershipData, error: membershipError } = await supabase
        .from('household_members')
        .select(`
          *,
          households:household_id (*)
        `)
        .eq('user_id', userId)
        .maybeSingle();

      if (membershipError) {
        console.error('Error fetching membership:', membershipError.message);
        return;
      }

      console.log('Membership data:', membershipData);
      
      if (membershipData) {
        const membershipObj: Membership = {
          id: membershipData.id,
          user_id: membershipData.user_id,
          household_id: membershipData.household_id,
          role: membershipData.role as HouseholdRole,
          created_at: membershipData.created_at
        };
        
        setMembership(membershipObj);
        setHousehold(membershipData.households as Household);
        
        fetchHouseholdMembers(membershipData.household_id);
      } else {
        setMembership(null);
        setHousehold(null);
        setHouseholdMembers(null);
      }
    } catch (error) {
      console.error('Error in fetchMembership:', error);
    }
  };

  const fetchHouseholdMembers = async (householdId: string): Promise<void> => {
    try {
      console.log('Fetching members for household:', householdId);
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          *,
          user_profiles:profiles (*)
        `)
        .eq('household_id', householdId);

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
      console.error('Error in fetchHouseholdMembers:', error);
    }
  };

  const createHousehold = async (name: string): Promise<Household> => {
    if (!user) throw new Error('User must be logged in to create a household');
    
    try {
      setIsLoading(true);
      console.log('Creating household:', name);
      
      const inviteCode = generateInviteCode();
      
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .insert([{ name, invite_code: inviteCode }])
        .select()
        .single();
        
      if (householdError) {
        console.error('Household creation error:', householdError);
        throw new Error(`Failed to create household: ${householdError.message}`);
      }
      
      console.log('Household created:', householdData);
      
      const { error: membershipError } = await supabase
        .from('household_members')
        .insert([{
          household_id: householdData.id,
          user_id: user.id,
          role: 'admin'
        }]);
          
      if (membershipError) {
        console.error('Error adding user to household:', membershipError);
        
        await supabase
          .from('households')
          .delete()
          .eq('id', householdData.id);
          
        throw new Error(`Failed to set household membership: ${membershipError.message}`);
      }
      
      console.log('Membership created successfully');
      
      await fetchMembership(user.id);
      
      toast({
        title: "Household created",
        description: `You've successfully created your household: ${name}`,
      });
      
      return householdData as Household;
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
      console.log('Joining household with invite code:', inviteCode);
      
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('invite_code', inviteCode)
        .maybeSingle();
        
      if (householdError) {
        console.error('Error finding household:', householdError);
        throw new Error(`Error finding household: ${householdError.message}`);
      }
      
      if (!householdData) {
        throw new Error("Invalid invite code. The household could not be found.");
      }
      
      console.log('Found household:', householdData);
      
      const { data: existingMembership } = await supabase
        .from('household_members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingMembership) {
        await leaveHousehold();
      }
      
      const { error: membershipError } = await supabase
        .from('household_members')
        .insert([{
          household_id: householdData.id,
          user_id: user.id,
          role: 'guest' as HouseholdRole
        }]);
        
      if (membershipError) {
        console.error('Error joining household:', membershipError);
        throw new Error(`Failed to join household: ${membershipError.message}`);
      }
      
      console.log('Successfully joined household');
      
      await fetchMembership(user.id);
      
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
    if (!user || !membership) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (householdMembers && householdMembers.length === 1 && household) {
        await supabase
          .from('households')
          .delete()
          .eq('id', household.id);
      }
      
      setMembership(null);
      setHousehold(null);
      setHouseholdMembers(null);
      
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

  const updateMemberRole = async (userId: string, role: HouseholdRole): Promise<void> => {
    if (!user || !membership || !household) {
      throw new Error('You must be in a household to update member roles');
    }
    
    if (membership.role !== 'admin') {
      throw new Error('Only admins can update member roles');
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('household_members')
        .update({ role })
        .eq('user_id', userId)
        .eq('household_id', household.id);
        
      if (error) throw error;
      
      await fetchHouseholdMembers(household.id);
      
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

  const refreshHousehold = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      await fetchMembership(user.id);
      
      toast({
        title: "Refreshed",
        description: "Household data has been refreshed.",
      });
    } catch (error: any) {
      console.error('Refresh household error:', error);
      toast({
        title: "Failed to refresh data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Updated to store household information properly
  const signUp = async (email: string, password: string, userData: { full_name: string, birthday?: string, household_name?: string, household_code?: string }) => {
    try {
      setIsLoading(true);
      console.log('Starting sign up process');
      
      const { data, error } = await supabase.auth.signUp({
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

      toast({
        title: "Account created!",
        description: "Your account has been created. Please check your email to confirm your account.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setProfile(null);
      setMembership(null);
      setHousehold(null);
      setHouseholdMembers(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<Profile | null> => {
    if (user) {
      return await fetchProfile(user.id);
    }
    return null;
  };

  // Process household creation/joining after authentication
  const processHouseholdActions = async (newSession: Session) => {
    if (!newSession?.user) return;
    
    try {
      const householdName = newSession.user.user_metadata.household_name;
      const householdCode = newSession.user.user_metadata.household_code;
      
      // Check if user is already in a household
      const { data: existingMember } = await supabase
        .from('household_members')
        .select('*')
        .eq('user_id', newSession.user.id)
        .maybeSingle();
      
      if (existingMember) {
        console.log('User already belongs to a household, skipping household creation/joining');
        return;
      }
      
      if (householdName) {
        console.log('Creating household from signup data:', householdName);
        try {
          await createHousehold(householdName);
          // Clear the metadata to prevent duplicate creation attempts
          await supabase.auth.updateUser({
            data: { household_name: null }
          });
        } catch (err) {
          console.error('Error creating household after authentication:', err);
        }
      } else if (householdCode) {
        console.log('Joining household from signup data with code:', householdCode);
        try {
          await joinHousehold(householdCode);
          // Clear the metadata to prevent duplicate join attempts
          await supabase.auth.updateUser({
            data: { household_code: null }
          });
        } catch (err) {
          console.error('Error joining household after authentication:', err);
        }
      }
    } catch (error) {
      console.error('Error processing household actions:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth event:', event);
        
        // Update session and user state
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            // Load profile data
            setTimeout(async () => {
              await fetchProfile(newSession.user.id);
              
              // After profile is fetched, check if user needs to create/join a household
              if (authInitialized) {
                await processHouseholdActions(newSession);
              }
              
              // Then fetch membership data
              await fetchMembership(newSession.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setMembership(null);
          setHousehold(null);
          setHouseholdMembers(null);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        await fetchProfile(initialSession.user.id);
        await fetchMembership(initialSession.user.id);
        
        // Set a flag that auth is initialized to prevent household creation
        // on the first auth state change event
        setAuthInitialized(true);
        
        // Process household actions for the initial session
        await processHouseholdActions(initialSession);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [authInitialized]);

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      membership,
      household,
      householdMembers,
      userRole: membership?.role || null,
      createHousehold,
      joinHousehold,
      leaveHousehold,
      updateMemberRole,
      refreshHousehold
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

