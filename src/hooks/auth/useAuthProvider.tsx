
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useProfile } from './useProfile';
import { useHousehold } from './useHousehold';

export function useAuthProvider() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const { profile, setProfile, fetchProfile, refreshProfile: refreshProfileData } = useProfile();
  const { 
    household, 
    householdMembers, 
    userRole, 
    fetchUserHousehold,
    createHousehold, 
    joinHousehold, 
    getHouseholdMembers, 
    updateMemberRole, 
    leaveHousehold,
    deleteHousehold,
    refreshHousehold 
  } = useHousehold(user, setIsLoading);

  useEffect(() => {
    // Only set up auth listener if we're not in the middle of signing out
    if (localStorage.getItem('signing_out') === 'true') {
      return;
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        
        // Ignore auth events during signout
        if (localStorage.getItem('signing_out') === 'true' && event === 'SIGNED_OUT') {
          console.log('Ignoring auth event during signout');
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
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

  useEffect(() => {
    if (user && profile) {
      fetchUserHousehold(user.id);
    }
  }, [user, profile]);

  const refreshProfile = async () => {
    if (user) {
      return await refreshProfileData(user.id);
    }
    return null;
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

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
        throw error;
      }

      if ((userData.household_name || userData.household_code) && data.user) {
        console.log('User created, will process household in onAuthStateChange after email confirmation');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Set a flag to prevent auth listener from reacting during signout
      localStorage.setItem('signing_out', 'true');
      setIsLoading(true);
      
      // Clear all auth state first
      setProfile(null);
      setUser(null);
      setSession(null);
      
      // Remove all Supabase-related items from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('supabase.')) {
          localStorage.removeItem(key);
        }
      }
      
      // Then attempt to sign out from Supabase
      try {
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        if (error) {
          console.error('Supabase sign out error:', error);
        }
      } catch (error: any) {
        console.error('Supabase sign out error:', error);
      }
      
      // Force a hard redirect to auth page which will reset all state
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Sign out error:', error);
      localStorage.removeItem('signing_out');
      window.location.href = '/auth';
    }
  };

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
    deleteHousehold,
    refreshHousehold,
  };
}
