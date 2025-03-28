
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  dob: z.date({ required_error: "Please select your date of birth" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  householdName: z.string().min(2, { message: "Household name must be at least 2 characters long" }).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createHousehold, setCreateHousehold] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      householdName: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      const userData: { full_name: string; birthday?: string; household_name?: string } = {
        full_name: values.fullName,
        birthday: values.dob ? format(values.dob, 'yyyy-MM-dd') : undefined,
      };
      
      // Only add household_name to userData if the user wants to create a household
      if (createHousehold && values.householdName) {
        userData.household_name = values.householdName;
      }
      
      await signUp(values.email, values.password, userData);
      
      toast({
        title: "Account created!",
        description: createHousehold 
          ? "Your account and household have been created. Please check your email to confirm your account."
          : "Your account has been created. Please check your email to confirm your account.",
      });
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
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
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="create-household"
              className="rounded border-gray-300 text-primary focus:ring-primary"
              checked={createHousehold}
              onChange={(e) => setCreateHousehold(e.target.checked)}
            />
            <label htmlFor="create-household" className="text-sm font-medium">
              Create a household for your family
            </label>
          </div>
          
          {createHousehold && (
            <FormField
              control={form.control}
              name="householdName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Household Name</FormLabel>
                  <FormControl>
                    <Input placeholder="The Smith Family" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
};
