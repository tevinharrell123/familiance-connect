
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
      
      // Use the database function to create the household and add the user as admin
      const { data: householdId, error } = await supabase
        .rpc('create_household_with_admin', {
          household_name: data.householdName,
          owner_id: user.id
        });

      if (error) {
        console.error("Error creating household:", error);
        throw new Error(error.message);
      }

      console.log("Household created with ID:", householdId);
      
      toast({
        title: "Household created!",
        description: `Welcome to ${data.householdName}`,
      });
      
      // Navigate directly to the dashboard without attempting to fetch household data
      navigate('/', { replace: true });

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
