
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { OnboardingFlow } from '@/components/family/OnboardingFlow';

export default function Family() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<any>(null);
  const [household, setHousehold] = useState<any>(null);
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
        
        setUser(session.user);
        
        // Check if user already has a membership
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (membershipError) {
          if (membershipError.code !== 'PGRST116') { // Not found error
            console.error('Error fetching membership:', membershipError);
            toast({
              title: "Error",
              description: "Failed to fetch household information",
              variant: "destructive",
            });
          }
          setLoading(false);
          return;
        }
        
        if (membershipData) {
          setMembership(membershipData);
          
          // Fetch household data
          const { data: householdData, error: householdError } = await supabase
            .from('households')
            .select('*')
            .eq('id', membershipData.household_id)
            .single();
          
          if (householdError) {
            console.error('Error fetching household:', householdError);
            setLoading(false);
            return;
          }
          
          setHousehold(householdData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        setLoading(false);
      }
    };
    
    // Call the function immediately
    checkUserSession();
    
    // Set up auth state listener for changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // When auth state changes, reload the membership data
      if (session?.user) {
        setUser(session.user);
        
        const { data: membershipData } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          
        if (membershipData) {
          setMembership(membershipData);
          
          const { data: householdData } = await supabase
            .from('households')
            .select('*')
            .eq('id', membershipData.household_id)
            .single();
            
          if (householdData) {
            setHousehold(householdData);
          }
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
