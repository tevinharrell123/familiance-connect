
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Maximum number of polling attempts
const MAX_POLL_ATTEMPTS = 12;
// Delay between polling attempts in milliseconds (1.5 seconds)
const POLL_INTERVAL = 1500;

export function useFamilyMembership() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<any>(null);
  const [household, setHousehold] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [polling, setPolling] = useState(false);
  const navigate = useNavigate();

  const clearError = () => setError(null);

  // Start the onboarding flow
  const startOnboarding = useCallback(() => {
    setPolling(false);
    setLoading(false);
    clearError();
  }, []);

  // Simple function to check if membership exists
  const checkMembership = useCallback(async (userId: string) => {
    try {
      console.log(`Polling for membership (attempt ${pollCount + 1}/${MAX_POLL_ATTEMPTS})...`);
      
      // Use a simple query with proper RLS
      const { data, error } = await supabase
        .from('memberships')
        .select('id, household_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error during membership polling:', error);
        return null;
      }
      
      return data; // Return the membership data if it exists
    } catch (err) {
      console.error('Unexpected error during polling:', err);
      return null;
    }
  }, [pollCount]);

  // Main function to fetch membership data with polling
  const fetchMembershipData = useCallback(async (force = false) => {
    // Reset state if forcing a refresh
    if (force) {
      setPollCount(0);
      setFetchAttempted(false);
      setError(null);
      setMembership(null);
      setHousehold(null);
    }

    // Don't fetch if user is not authenticated yet
    if (authLoading || !user) {
      console.log("Auth is still loading or user is not available");
      setLoading(authLoading);
      return;
    }
    
    // Don't start a new polling cycle if one is already in progress
    if (polling && !force) {
      console.log("Polling already in progress");
      return;
    }
    
    try {
      console.log("Fetching membership data for user:", user.id);
      setLoading(true);
      setPolling(true);
      
      // First poll to check if membership exists
      let membershipData = null;
      let attempts = 0;
      
      while (!membershipData && attempts < MAX_POLL_ATTEMPTS) {
        membershipData = await checkMembership(user.id);
        if (membershipData) {
          console.log("Membership found after polling:", membershipData);
          
          // If we have a household_id, we can redirect to the household dashboard
          if (membershipData.household_id) {
            const { data: householdData, error: householdError } = await supabase
              .from('households')
              .select('*')
              .eq('id', membershipData.household_id)
              .maybeSingle();
            
            if (householdError) {
              console.error('Error fetching household:', householdError);
              setError('Failed to fetch household data. Please try again later.');
            } else if (householdData) {
              console.log("Household data found:", householdData);
              setMembership(membershipData);
              setHousehold(householdData);
              setPolling(false);
              setLoading(false);
              setFetchAttempted(true);
              
              // Show success toast
              toast({
                title: "Success",
                description: "Your family data has been loaded successfully.",
              });
              
              return; // Exit the function once we have the data
            }
          }
        }
        
        // Increment attempt counter
        attempts++;
        setPollCount(attempts);
        console.log(`Membership polling attempt ${attempts}/${MAX_POLL_ATTEMPTS}`);
        
        // Wait before next attempt
        if (!membershipData && attempts < MAX_POLL_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        }
      }
      
      setPolling(false);
      
      if (!membershipData) {
        console.log("No membership found after maximum polling attempts");
        // We'll leave polling complete and set fetchAttempted to true
        // This will trigger the UI to show the "Create or Join" prompt
      }
      
      setFetchAttempted(true);
      setLoading(false);
    } catch (fetchError: any) {
      console.error('Error fetching data:', fetchError);
      setError('An error occurred while fetching your data. Please try again later.');
      setPolling(false);
      setFetchAttempted(true);
      setLoading(false);
    }
  }, [user, authLoading, checkMembership, polling]);

  // When user changes or auth state updates, restart the fetch process
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User available, starting/continuing membership polling");
      if (!polling && !fetchAttempted) {
        fetchMembershipData();
      }
    } else if (!authLoading) {
      // If auth is done loading and there's no user, we can set loading to false
      setLoading(false);
    }
  }, [user, authLoading, fetchMembershipData, polling, fetchAttempted]);

  return {
    user,
    authLoading,
    loading: loading || polling,
    membership,
    household,
    error,
    fetchAttempted,
    clearError,
    refetch: () => fetchMembershipData(true),
    isPolling: polling,
    pollCount,
    startOnboarding,
    pollingComplete: pollCount >= MAX_POLL_ATTEMPTS
  };
}
