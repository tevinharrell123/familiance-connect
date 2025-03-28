
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { OnboardingFlow } from '@/components/family/OnboardingFlow';
import { Button } from '@/components/ui/button';

export default function Family() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<any>(null);
  const [household, setHousehold] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is authenticated and has a household
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // User is not logged in, show the onboarding flow
          setLoading(false);
          return;
        }
        
        console.log("User is authenticated:", session.user);
        setUser(session.user);
        
        // Check if user already has a membership
        try {
          const { data: membershipData, error: membershipError } = await supabase
            .from('memberships')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (membershipError) {
            console.error('Error fetching membership:', membershipError);
            setError('Failed to fetch membership data. Please try again later.');
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
              setLoading(false);
              return;
            }
            
            console.log("Household data:", householdData);
            setHousehold(householdData);
          }
        } catch (fetchError) {
          console.error('Error fetching data:', fetchError);
          setError('An error occurred while fetching your data. Please try again later.');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        setError('Failed to check your session. Please try again later.');
        setLoading(false);
      }
    };
    
    // Call the function immediately
    checkUserSession();
    
    // Set up auth state listener for changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "user authenticated" : "no user");
      
      // When auth state changes, reload the membership data
      if (session?.user) {
        setUser(session.user);
        
        try {
          const { data: membershipData } = await supabase
            .from('memberships')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          console.log("Membership data after auth state change:", membershipData);
          
          if (membershipData) {
            setMembership(membershipData);
            
            const { data: householdData } = await supabase
              .from('households')
              .select('*')
              .eq('id', membershipData.household_id)
              .maybeSingle();
              
            console.log("Household data after auth state change:", householdData);
            
            if (householdData) {
              setHousehold(householdData);
            }
          }
        } catch (error) {
          console.error("Error fetching data after auth state change:", error);
        }
      } else {
        setUser(null);
        setMembership(null);
        setHousehold(null);
      }
    });
    
    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [navigate]);

  // If there's an error, show it to the user
  if (error) {
    return (
      <div className="container mx-auto max-w-md py-10">
        <Card className="p-8">
          <h2 className="text-xl font-bold mb-4 text-center">Error</h2>
          <p className="text-center mb-4 text-red-500">{error}</p>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // If the user already has a household, show the family dashboard
  if (!loading && household) {
    return <FamilyDashboard household={household} membership={membership} user={user} />;
  }

  // If the user is authenticated but doesn't have a household, show the onboarding
  return (
    <div>
      {loading ? (
        <div className="container mx-auto max-w-md py-10">
          <Card className="p-8 text-center">
            <div className="animate-pulse">Loading...</div>
          </Card>
        </div>
      ) : (
        <OnboardingFlow user={user} />
      )}
    </div>
  );
}
