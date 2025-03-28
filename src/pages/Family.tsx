import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FamilyDashboard } from '@/components/family/FamilyDashboard';
import { OnboardingFlow } from '@/components/family/OnboardingFlow';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from "@/components/ui/progress";

export default function Family() {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [selectedMembership, setSelectedMembership] = useState<any>(null);
  const [household, setHousehold] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingAttempt, setPollingAttempt] = useState(0);
  const [isPolling, setIsPolling] = useState(false);
  const maxAttempts = 5;
  const navigate = useNavigate();

  const fetchMemberships = async () => {
    if (!user) return;
    
    setIsPolling(true);
    setPollingAttempt(prev => prev + 1);
    
    try {
      console.log(`Attempt ${pollingAttempt + 1}/${maxAttempts}: Fetching memberships for user:`, user.id);
      
      const { data: membershipsData, error: membershipsError } = await supabase
        .from('memberships')
        .select('*, households:household_id(*)')
        .eq('user_id', user.id);
      
      if (membershipsError) {
        console.error('Error fetching memberships:', membershipsError);
        
        if (pollingAttempt >= maxAttempts) {
          setError('Failed to fetch membership data. Please try again later.');
          setIsPolling(false);
          setLoading(false);
        } else {
          setTimeout(fetchMemberships, 1000);
        }
        return;
      }
      
      console.log("Memberships found:", membershipsData);
      
      if (membershipsData && membershipsData.length > 0) {
        setMemberships(membershipsData);
        setSelectedMembership(membershipsData[0]);
        setHousehold(membershipsData[0].households);
        setIsPolling(false);
        setLoading(false);
      } else if (pollingAttempt >= maxAttempts) {
        setIsPolling(false);
        setLoading(false);
      } else {
        setTimeout(fetchMemberships, 1000);
      }
    } catch (fetchError) {
      console.error('Error in fetch operation:', fetchError);
      
      if (pollingAttempt >= maxAttempts) {
        setError('An error occurred while fetching your data. Please try again later.');
        setIsPolling(false);
        setLoading(false);
      } else {
        setTimeout(fetchMemberships, 1000);
      }
    }
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (user) {
      fetchMemberships();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const selectMembership = (membership: any) => {
    setSelectedMembership(membership);
    setHousehold(membership.households);
  };

  if (error) {
    return (
      <div className="container mx-auto max-w-md py-10">
        <Card className="p-8">
          <CardHeader>
            <div className="flex items-center justify-center mb-2 text-amber-500">
              <AlertTriangle size={40} />
            </div>
            <CardTitle className="text-xl font-bold text-center">Error</CardTitle>
            <CardDescription className="text-center text-red-500">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-6 text-sm text-muted-foreground">
              {user ? 
                "We're having trouble accessing your household data. You can proceed to create or join a household." :
                "There was an error loading your data. Please try again."}
            </p>
            <div className="flex flex-col gap-4 justify-center">
              {user ? (
                <Button onClick={() => setError(null)} className="w-full">
                  Continue to Setup
                </Button>
              ) : (
                <Button onClick={() => window.location.reload()} className="w-full">
                  Try Again
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => navigate('/')} 
                className="w-full"
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-md py-10">
        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">Loading</CardTitle>
            <CardDescription className="text-center">
              {isPolling ? 
                `Checking membership status... (Attempt ${pollingAttempt}/${maxAttempts})` : 
                "Loading your data..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isPolling && (
              <div className="mt-4">
                <Progress value={(pollingAttempt / maxAttempts) * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (memberships && memberships.length > 0 && household) {
    return (
      <FamilyDashboard 
        household={household} 
        membership={selectedMembership} 
        allMemberships={memberships}
        onSelectMembership={selectMembership}
      />
    );
  }

  return <OnboardingFlow />;
}
