
import { useState, useEffect, useCallback, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useProfile } from './useProfile';
import { useHousehold } from './useHousehold';
import { useSignIn } from './useSignIn';
import { useSignUp } from './useSignUp';
import { useSignOut } from './useSignOut';

export function useAuthProvider() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Add refs to track refresh status and prevent loops
  const lastRefreshTimeRef = useRef<number>(0);
  const isRefreshingRef = useRef<boolean>(false);

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
        console.log(`Auth event: ${event}`);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to prevent potential auth deadlocks
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

  const refreshProfile = useCallback(async () => {
    if (user) {
      return await refreshProfileData(user.id);
    }
    return null;
  }, [user, refreshProfileData]);

  const refreshAll = useCallback(async () => {
    // Don't refresh if we're already refreshing
    if (isRefreshingRef.current) {
      console.log('Skipping auth refresh - already in progress');
      return;
    }
    
    // Throttle refreshes to prevent loops
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 10000) { // 10 seconds minimum between refreshes
      console.log('Skipping auth refresh - too soon after last refresh');
      return;
    }
    
    console.log('Refreshing all auth-related data');
    lastRefreshTimeRef.current = now;
    isRefreshingRef.current = true;
    
    if (user) {
      try {
        await refreshProfileData(user.id);
      } catch (err) {
        console.error('Error refreshing profile:', err);
      }
      
      try {
        await refreshHousehold();
      } catch (err) {
        console.error('Error refreshing household:', err);
      }
    }
    
    isRefreshingRef.current = false;
  }, [user, refreshProfileData, refreshHousehold]);

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
    refreshAll,
    createHousehold,
    joinHousehold,
    getHouseholdMembers,
    updateMemberRole,
    leaveHousehold,
    deleteHousehold,
    refreshHousehold,
  };
}
