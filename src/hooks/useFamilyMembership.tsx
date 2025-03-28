
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';

export function useFamilyMembership() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<any>(null);
  const [household, setHousehold] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  const fetchMembershipData = async () => {
    // Don't fetch if user is not authenticated yet
    if (authLoading || !user) {
      setLoading(false);
      return;
    }
    
    try {
      console.log("Fetching membership data for user:", user.id);
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (membershipError) {
        console.error('Error fetching membership:', membershipError);
        setError('Failed to fetch membership data. Please try again later.');
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
      }
      
      setFetchAttempted(true);
      setLoading(false);
    } catch (fetchError) {
      console.error('Error fetching data:', fetchError);
      setError('An error occurred while fetching your data. Please try again later.');
      setFetchAttempted(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembershipData();
  }, [user, authLoading]);

  const clearError = () => setError(null);

  return {
    user,
    authLoading,
    loading,
    membership,
    household,
    error,
    fetchAttempted,
    clearError,
    refetch: fetchMembershipData
  };
}
