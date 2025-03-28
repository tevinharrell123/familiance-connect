
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';

// Maximum number of polling attempts
const MAX_POLL_ATTEMPTS = 10;
// Delay between polling attempts in milliseconds
const POLL_INTERVAL = 500;

export function useFamilyMembership() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<any>(null);
  const [household, setHousehold] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [polling, setPolling] = useState(false);

  const clearError = () => setError(null);

  // Function to check if membership exists
  const checkMembership = useCallback(async (userId: string) => {
    try {
      console.log(`Polling for membership (attempt ${pollCount + 1}/${MAX_POLL_ATTEMPTS})...`);
      
      const { data, error } = await supabase
        .from('memberships')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        // Only log the error during polling, don't set state yet
        console.error('Error during membership polling:', error);
        return false;
      }
      
      return !!data; // Return true if membership exists
    } catch (err) {
      console.error('Unexpected error during polling:', err);
      return false;
    }
  }, [pollCount]);

  // Main function to fetch membership data with polling
  const fetchMembershipData = useCallback(async () => {
    // Don't fetch if user is not authenticated yet
    if (authLoading || !user) {
      setLoading(false);
      return;
    }
    
    try {
      console.log("Fetching membership data for user:", user.id);
      setPolling(true);
      
      // First poll to check if membership exists
      let membershipExists = false;
      let attempts = 0;
      
      while (!membershipExists && attempts < MAX_POLL_ATTEMPTS) {
        membershipExists = await checkMembership(user.id);
        if (membershipExists) {
          console.log("Membership found after polling!");
          break;
        }
        
        // Increment attempt counter
        attempts++;
        setPollCount(attempts);
        
        // Wait before next attempt
        if (!membershipExists && attempts < MAX_POLL_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        }
      }
      
      setPolling(false);
      
      // If still no membership after polling, just set loading to false
      if (!membershipExists) {
        console.log("No membership found after maximum polling attempts");
        setFetchAttempted(true);
        setLoading(false);
        return;
      }
      
      // Now actually fetch the membership data
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (membershipError) {
        console.error('Error fetching membership:', membershipError);
        
        // Handle RLS recursion error specifically
        if (membershipError.message && membershipError.message.includes('recursion')) {
          setError('Database policy error. Please contact support with error code: RLS-RECURSION.');
          
          // Show toast for database configuration issue
          toast({
            title: "Database Configuration Issue",
            description: "We're experiencing a policy error in our database. You can still proceed to setup your household.",
            variant: "destructive",
          });
        } else {
          setError('Failed to fetch membership data. Please try again later.');
        }
        
        setFetchAttempted(true);
        setLoading(false);
        return;
      }
      
      console.log("Membership data:", membershipData);
      
      if (membershipData) {
        setMembership(membershipData);
        
        // Fetch household data
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('id', membershipData.household_id)
          .maybeSingle();
        
        if (householdError) {
          console.error('Error fetching household:', householdError);
          setError('Failed to fetch household data. Please try again later.');
          setFetchAttempted(true);
          setLoading(false);
          return;
        }
        
        console.log("Household data:", householdData);
        setHousehold(householdData);
      } else {
        console.log("No membership found for user", user.id);
      }
      
      setFetchAttempted(true);
      setLoading(false);
    } catch (fetchError: any) {
      console.error('Error fetching data:', fetchError);
      setError('An error occurred while fetching your data. Please try again later.');
      setFetchAttempted(true);
      setLoading(false);
    }
  }, [user, authLoading, checkMembership]);

  // When user changes or auth state updates, restart the fetch process
  useEffect(() => {
    if (user) {
      console.log("User available, fetching membership data");
      // Reset polling state when starting a new fetch
      setPollCount(0);
      setPolling(false);
      fetchMembershipData();
    } else if (!authLoading) {
      // If auth is done loading and there's no user, we can set loading to false
      setLoading(false);
    }
  }, [user, authLoading, fetchMembershipData]);

  return {
    user,
    authLoading,
    loading: loading || polling,
    membership,
    household,
    error,
    fetchAttempted,
    clearError,
    refetch: fetchMembershipData,
    isPolling: polling,
    pollCount
  };
}
