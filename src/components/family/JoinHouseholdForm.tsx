
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JoinHouseholdFormProps {
  user: any;
}

export function JoinHouseholdForm({ user }: JoinHouseholdFormProps) {
  const [householdId, setHouseholdId] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

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
      // Check if the household exists
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('id')
        .eq('id', householdId)
        .single();

      if (householdError || !householdData) {
        throw new Error("Household not found");
      }

      // For anonymous users, create an account first
      if (!user) {
        if (!email.trim() || !password.trim()) {
          toast({
            title: "Error",
            description: "Please enter email and password",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

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

        // Join the household
        const { error: joinError } = await supabase.rpc('join_household', {
          household_id: householdId,
          user_id: authData.user.id
        });

        if (joinError) {
          throw joinError;
        }

        toast({
          title: "Success",
          description: "Account created and joined household successfully!",
        });

        // Navigate to the main page
        navigate('/');
      } else {
        // Join the household as authenticated user
        const { error: joinError } = await supabase.rpc('join_household', {
          household_id: householdId,
          user_id: user.id
        });

        if (joinError) {
          throw joinError;
        }

        toast({
          title: "Success",
          description: "Joined household successfully!",
        });

        // Navigate to the main page
        navigate('/');
      }
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
        {loading ? "Joining..." : user ? "Join Household" : "Sign Up & Join Household"}
      </Button>
    </form>
  );
}
