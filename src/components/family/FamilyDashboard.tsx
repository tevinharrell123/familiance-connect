
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { FamilyMembersWidget } from '@/components/dashboard/FamilyMembers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';

interface FamilyDashboardProps {
  household: any;
  membership: any;
}

export function FamilyDashboard({ household, membership }: FamilyDashboardProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!household?.id) return;
      
      try {
        // Fetch all members of the household
        const { data, error } = await supabase
          .from('memberships')
          .select(`
            id, role, user_id,
            user_profiles:user_id(id, full_name, avatar_url)
          `)
          .eq('household_id', household.id);

        if (error) {
          throw error;
        }

        setMembers(data || []);
      } catch (error: any) {
        console.error('Error fetching members:', error);
        toast({
          title: "Error",
          description: "Failed to fetch family members",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [household?.id]);

  if (!user || !household) {
    return (
      <div className="container mx-auto py-6">
        <Card className="p-8 text-center">
          <div className="animate-pulse">Loading dashboard data...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">{household.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Family Dashboard</CardTitle>
              <CardDescription>
                Manage your family activities and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Welcome to your family dashboard!</p>
              {membership.role === 'admin' && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    As an admin, you can manage household settings and members.
                  </p>
                  <p className="mt-2">
                    Your household ID: <code className="bg-muted p-1 rounded">{household.id}</code>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Share this ID with family members who want to join your household.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <FamilyMembersWidget />
        </div>
      </div>
    </div>
  );
}
