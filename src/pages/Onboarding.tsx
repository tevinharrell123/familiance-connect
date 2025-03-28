
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';

const householdSchema = z.object({
  householdName: z.string().min(2, { message: "Household name must be at least 2 characters" }),
});

const Onboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof householdSchema>>({
    resolver: zodResolver(householdSchema),
    defaultValues: {
      householdName: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof householdSchema>) => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create a household",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log("Creating household for user:", user.id);
      
      // Step 1: First create the household using a direct insert
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: data.householdName,
          owner_id: user.id,
        })
        .select()
        .single();

      if (householdError) {
        console.error("Error creating household:", householdError);
        throw new Error(householdError.message);
      }

      console.log("Household created:", household);

      // Step 2: Create membership using a direct insert
      // This is now a separate operation to avoid RLS policy recursion
      const { error: membershipError } = await supabase.rpc(
        'create_admin_membership', 
        { 
          user_uuid: user.id, 
          household_uuid: household.id 
        }
      );

      if (membershipError) {
        console.error("Error creating membership:", membershipError);
        
        // If there's an error with the membership, try to roll back the household creation
        await supabase.from('households').delete().eq('id', household.id);
        
        throw new Error(membershipError.message);
      }

      console.log("Membership created for user as admin");

      toast({
        title: "Household created!",
        description: `Welcome to ${data.householdName}`,
      });
      
      // Force a small delay before navigating to ensure data consistency
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error: any) {
      console.error("Error in onboarding:", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F6F3] p-4">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Welcome to FamPilot</CardTitle>
          <CardDescription>Let's create your household</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="householdName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Household Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Harrell Family" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how your household will be identified in FamPilot
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Creating household...
                  </div>
                ) : "Create household"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          As the creator of this household, you'll be the administrator
        </CardFooter>
      </Card>
    </div>
  );
};

export default Onboarding;
