
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "You are now logged in",
      });

      // Try to check if user has a household, but don't block on errors
      try {
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('household_id')
          .eq('user_id', data.user.id)
          .maybeSingle();
          
        if (membershipError) {
          console.warn('Non-blocking error fetching membership:', membershipError);
        }
        
        // Navigate to the main dashboard regardless of whether the user has a household
        setTimeout(() => {
          if (membershipData?.household_id) {
            navigate('/');
          } else {
            // If no household is found, redirect to family page to create one
            navigate('/family');
          }
        }, 500);
      } catch (membershipError) {
        console.error('Error checking household:', membershipError);
        // Still navigate to family page if there's an error
        setTimeout(() => {
          navigate('/family');
        }, 500);
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to log in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="your.email@example.com" 
                  type="email" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your password" 
                  type="password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </Form>
  );
}
