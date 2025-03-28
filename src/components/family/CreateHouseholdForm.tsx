
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    // For anonymous users, we need to create an account first
    if (!user) {
      if (!email.trim() || !password.trim()) {
        toast({
          title: "Error",
          description: "Please enter email and password",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      try {
        // Create user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) {
          throw authError;
        }

        if (!authData.user) {
          throw new Error("Failed to create user account");
        }

        // Create household with the new user
        const { data, error } = await supabase.rpc('create_household_with_admin', {
          household_name: householdName,
          owner_id: authData.user.id
        });

        if (error) {
          throw error;
        }

        toast({
          title: "Success",
          description: "Account and household created successfully!",
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
    } else {
      // User is already authenticated, just create the household
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

      {!user && (
        <>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating..." : user ? "Create Household" : "Sign Up & Create Household"}
      </Button>
    </form>
  );
}
