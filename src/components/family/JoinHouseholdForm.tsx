
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JoinHouseholdFormProps {
  user: any;
}

export function JoinHouseholdForm({ user }: JoinHouseholdFormProps) {
  const [householdId, setHouseholdId] = useState('');
  const [role, setRole] = useState<'adult' | 'child'>('adult');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!householdId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a household ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if household exists
      const { data: household, error: householdError } = await supabase
        .from('households')
        .select('id, name')
        .eq('id', householdId)
        .single();

      if (householdError) {
        throw new Error('Household not found');
      }

      // Join the household using the RPC function
      const { data, error } = await supabase.rpc('join_household', {
        household_id: householdId,
        user_id: user.id,
        member_role: role
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `You've joined ${household.name}!`,
      });

      // Refresh the page to show the family dashboard
      window.location.reload();
    } catch (error: any) {
      console.error('Error joining household:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join household",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="household-id">Household ID</Label>
        <Input
          id="household-id"
          placeholder="Enter the household ID"
          value={householdId}
          onChange={(e) => setHouseholdId(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Your Role</Label>
        <Select value={role} onValueChange={(value: 'adult' | 'child') => setRole(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="adult">Adult</SelectItem>
            <SelectItem value="child">Child</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Joining..." : "Join Household"}
      </Button>
    </form>
  );
}
