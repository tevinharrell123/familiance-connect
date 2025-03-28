
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateHouseholdFormProps {
  user: any;
}

export function CreateHouseholdForm({ user }: CreateHouseholdFormProps) {
  const [householdName, setHouseholdName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!householdName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a household name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('create_household_with_admin', {
        household_name: householdName,
        owner_id: user.id
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Household created successfully!",
      });

      // Refresh the page to show the family dashboard
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating household:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create household",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="household-name">Household Name</Label>
        <Input
          id="household-name"
          placeholder="Enter your household name"
          value={householdName}
          onChange={(e) => setHouseholdName(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Household"}
      </Button>
    </form>
  );
}
