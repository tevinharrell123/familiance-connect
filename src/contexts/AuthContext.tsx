
import React, { createContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Define types for our context
type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  birthday?: string | null;
};

type Household = {
  id: string;
  name: string;
  created_at: string;
  invite_code: string;
};

type Membership = {
  id: string;
  user_id: string;
  household_id: string;
  role: 'admin' | 'adult' | 'child';
  created_at: string;
  household?: Household;
};

type HouseholdMember = {
  membership: Membership;
  profile: Profile;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { full_name: string, birthday?: string, household_name?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  membership: Membership | null;
  household: Household | null;
  householdMembers: HouseholdMember[] | null;
  createHousehold: (name: string) => Promise<Household>;
  joinHousehold: (inviteCode: string) => Promise<void>;
  leaveHousehold: () => Promise<void>;
  updateMemberRole: (userId: string, role: 'admin' | 'adult' | 'child') => Promise<void>;
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

  // Fetch user profile
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

  // Fetch user membership and household
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
          role: membershipData.role,
          created_at: membershipData.created_at
        };
        
        setMembership(membershipObj);
        setHousehold(membershipData.households as Household);
        
        // Fetch household members
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

  // Fetch household members
  const fetchHouseholdMembers = async (householdId: string): Promise<void> => {
    try {
      console.log('Fetching members for household:', householdId);
      const { data, error } = await supabase
        .from('household_members')
        .select(`
          *,
          profiles:user_id (*)
        `)
        .eq('household_id', householdId);

      if (error) {
        console.error('Error fetching household members:', error.message);
        return;
      }

      console.log('Household members data:', data);
      
      const members = data.map((item: any) => ({
        membership: {
          id: item.id,
          user_id: item.user_id,
          household_id: item.household_id,
          role: item.role,
          created_at: item.created_at
        },
        profile: item.profiles
      }));

      setHouseholdMembers(members);
    } catch (error) {
      console.error('Error in fetchHouseholdMembers:', error);
    }
  };

  // Create a new household
  const createHousehold = async (name: string): Promise<Household> => {
    if (!user) throw new Error('User must be logged in to create a household');
    
    try {
      setIsLoading(true);
      console.log('Creating household:', name);
      
      // Generate a random invite code
      const inviteCode = Math.random().toString(36).substring(2, 10);
      
      // Insert the household record
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
      
      // Add user as admin member
      const { error: membershipError } = await supabase
        .from('household_members')
        .insert([{
          household_id: householdData.id,
          user_id: user.id,
          role: 'admin'
        }]);
          
      if (membershipError) {
        console.error('Error adding user to household:', membershipError);
        
        // Clean up the created household
        await supabase
          .from('households')
          .delete()
          .eq('id', householdData.id);
          
        throw new Error(`Failed to set household membership: ${membershipError.message}`);
      }
      
      console.log('Membership created successfully');
      
      // Refresh membership data
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

  // Join an existing household
  const joinHousehold = async (inviteCode: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in to join a household');
    
    try {
      setIsLoading(true);
      console.log('Joining household with invite code:', inviteCode);
      
      // Find the household with the provided invite code
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
      
      // Check if user already has a membership
      const { data: existingMembership } = await supabase
        .from('household_members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingMembership) {
        // User already has a membership, leave the current household first
        await leaveHousehold();
      }
      
      // Add user to the household as an adult
      const { error: membershipError } = await supabase
        .from('household_members')
        .insert([{
          household_id: householdData.id,
          user_id: user.id,
          role: 'guest'
        }]);
        
      if (membershipError) {
        console.error('Error joining household:', membershipError);
        throw new Error(`Failed to join household: ${membershipError.message}`);
      }
      
      console.log('Successfully joined household');
      
      // Refresh membership data
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

  // Leave current household
  const leaveHousehold = async (): Promise<void> => {
    if (!user || !membership) return;
    
    try {
      setIsLoading(true);
      
      // Now remove user's membership
      const { error } = await supabase
        .from('household_members')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // If user was the last member, delete the household
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

  // Update a member's role
  const updateMemberRole = async (userId: string, role: 'admin' | 'adult' | 'child'): Promise<void> => {
    if (!user || !membership || !household) {
      throw new Error('You must be in a household to update member roles');
    }
    
    // Check if current user is an admin
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
      
      // Refresh household members
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

  // Refresh household data
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

  // Sign in user
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

  // Sign up new user - Fixed the line break issue here
  const signUp = async (email: string, password: string, userData: { full_name: string, birthday?: string, household_name?: string }) => {
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

      // If household_name provided, create household after email confirmation
      if (userData.household_name && data.user) {
        console.log('User created, will create household in onAuthStateChange after email confirmation');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out user
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

  // Refresh profile data
  const refreshProfile = async (): Promise<Profile | null> => {
    if (user) {
      return await fetchProfile(user.id);
    }
    return null;
  };

  // Auth state change listener and initial session check
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth event:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Delayed fetch of user data
          setTimeout(() => {
            fetchProfile(newSession.user.id);
            fetchMembership(newSession.user.id);
            
            // Check if we need to create a household for a new user
            const householdName = newSession.user.user_metadata.household_name;
            if (event === 'SIGNED_IN' && householdName) {
              createHousehold(householdName)
                .then(() => {
                  // Clear the household_name from metadata
                  supabase.auth.updateUser({
                    data: { household_name: null }
                  });
                })
                .catch(err => console.error('Error creating household after signup:', err));
            }
          }, 0);
        } else {
          setProfile(null);
          setMembership(null);
          setHousehold(null);
          setHouseholdMembers(null);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        fetchProfile(initialSession.user.id);
        fetchMembership(initialSession.user.id);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

// Hook to use auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
