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
      setIsLoading(true);
      
      try {
        await supabase.auth.signOut();
      } catch (error: any) {
        console.error('Supabase sign out error:', error);
      }
      
      setProfile(null);
      setUser(null);
      setSession(null);
      
      localStorage.removeItem('supabase.auth.token');
      
      window.location.href = '/auth';
    } catch (error: any) {
      console.error('Sign out error:', error);
      window.location.href = '/auth';
    } finally {
      setIsLoading(false);
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
