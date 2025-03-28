
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { FamilyMembersWidget } from '@/components/dashboard/FamilyMembers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Users, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface FamilyDashboardProps {
  household: any;
  membership: any;
  allMemberships?: any[];
  onSelectMembership?: (membership: any) => void;
}

export function FamilyDashboard({ 
  household, 
  membership, 
  allMemberships = [], 
  onSelectMembership 
}: FamilyDashboardProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [householdId, setHouseholdId] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

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

  const handleJoinHousehold = async () => {
    if (!householdId.trim() || !user) return;
    
    setJoinLoading(true);
    
    try {
      // Check if household exists
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('id, name')
        .eq('id', householdId)
        .single();
      
      if (householdError || !householdData) {
        throw new Error('Household not found');
      }
      
      // Use the join_household function
      const { data, error } = await supabase.rpc('join_household', {
        household_id: householdId,
        user_id: user.id,
        member_role: 'adult'
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success!",
        description: `You have joined the household '${householdData.name}'`,
      });
      
      // Reload the page to reflect changes
      window.location.reload();
      
    } catch (error: any) {
      console.error('Error joining household:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join household",
        variant: "destructive",
      });
    } finally {
      setJoinLoading(false);
      setJoinDialogOpen(false);
    }
  };

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
      {allMemberships && allMemberships.length > 1 && (
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Home className="mr-2 h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Switch Household:</span>
              </div>
              <div className="flex-1 mx-4">
                <Select 
                  value={membership?.household_id || ''}
                  onValueChange={(value) => {
                    const selected = allMemberships.find(m => m.household_id === value);
                    if (selected && onSelectMembership) {
                      onSelectMembership(selected);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a household" />
                  </SelectTrigger>
                  <SelectContent>
                    {allMemberships.map((m) => (
                      <SelectItem key={m.household_id} value={m.household_id}>
                        {m.households.name} ({m.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Join Another
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Join a Household</DialogTitle>
                    <DialogDescription>
                      Enter the household ID shared with you to join another household.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <label className="block text-sm font-medium mb-1">
                      Household ID
                    </label>
                    <Input
                      type="text"
                      value={householdId}
                      onChange={(e) => setHouseholdId(e.target.value)}
                      placeholder="Enter household ID"
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleJoinHousehold} 
                      disabled={joinLoading || !householdId.trim()}
                    >
                      {joinLoading ? "Joining..." : "Join Household"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Card>
        </div>
      )}
      
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
          <FamilyMembersWidget householdId={household.id} />
        </div>
      </div>
    </div>
  );
}
