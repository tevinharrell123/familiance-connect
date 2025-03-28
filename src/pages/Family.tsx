
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { CreateHouseholdForm } from '@/components/family/CreateHouseholdForm';
import { JoinHouseholdForm } from '@/components/family/JoinHouseholdForm';

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
          // User is not logged in, redirect to home
          navigate('/');
          return;
        }
        
        setUser(session.user);
        
        // Check if user already has a membership
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (membershipError && membershipError.code !== 'PGRST116') {
          console.error('Error fetching membership:', membershipError);
          toast({
            title: "Error",
            description: "Failed to fetch household information",
            variant: "destructive",
          });
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
          } else {
            setHousehold(householdData);
          }
        }
        
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserSession();
  }, [navigate]);

  // If the user already has a household, show the family dashboard
  if (!loading && household) {
    return <FamilyDashboard household={household} membership={membership} user={user} />;
  }

  // If the user is authenticated but doesn't have a household, show the onboarding
  return (
    <div className="container mx-auto max-w-md py-10">
      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Family Management</CardTitle>
            <CardDescription>Create a new household or join an existing one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Household</TabsTrigger>
                <TabsTrigger value="join">Join Household</TabsTrigger>
              </TabsList>
              <TabsContent value="create">
                <CreateHouseholdForm user={user} />
              </TabsContent>
              <TabsContent value="join">
                <JoinHouseholdForm user={user} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
