import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Home, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'react-router-dom';

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  dob: z.date({ required_error: "Please select your date of birth" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  householdName: z.string().min(2, { message: "Household name must be at least 2 characters long" }).optional(),
  householdCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type HouseholdOption = 'none' | 'create' | 'join';

interface RegisterFormProps {
  initialInviteCode?: string | null;
}

export const RegisterForm = ({ initialInviteCode = null }: RegisterFormProps) => {
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [householdOption, setHouseholdOption] = useState<HouseholdOption>('none');
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [searchParams] = useSearchParams();
  const inviteCode = initialInviteCode || searchParams.get('invite');
  
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      householdName: '',
      householdCode: inviteCode || '',
    },
  });

  useEffect(() => {
    if (inviteCode) {
      setHouseholdOption('join');
      form.setValue('householdCode', inviteCode);
      console.log("Invite code detected, setting join tab:", inviteCode);
    }
  }, [inviteCode, form]);

  useEffect(() => {
    if (householdOption === 'none') {
      form.setValue('householdName', '');
      form.setValue('householdCode', '');
    } else if (householdOption === 'create') {
      form.setValue('householdCode', '');
    } else if (householdOption === 'join') {
      form.setValue('householdName', '');
      if (!inviteCode) {
        form.setValue('householdCode', '');
      }
    }

    console.log("Household option changed to:", householdOption);
  }, [householdOption, form, inviteCode]);

  const onSubmit = async (values: RegisterFormValues) => {
    console.log("Form submitted with values:", values);
    try {
      setIsSubmitting(true);
      
      const userData: { full_name: string; birthday?: string; household_name?: string; household_code?: string } = {
        full_name: values.fullName,
        birthday: values.dob ? format(values.dob, 'yyyy-MM-dd') : undefined,
      };
      
      if (householdOption === 'create' && values.householdName) {
        userData.household_name = values.householdName;
      } else if (householdOption === 'join' && values.householdCode) {
        userData.household_code = values.householdCode;
      }
      
      console.log("Calling signUp with data:", values.email, "[password]", userData);
      await signUp(values.email, values.password, userData);
      
      let successMessage = "Your account has been created. Please check your email to confirm your account.";
      if (householdOption === 'create') {
        successMessage = "Your account and household have been created. Please check your email to confirm your account.";
      } else if (householdOption === 'join') {
        successMessage = "Your account has been created. You'll join the household after confirming your email.";
      }
      
      toast({
        title: "Account created!",
        description: successMessage,
      });
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("Register form rendering, isSubmitting:", isSubmitting);

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
                  <div className="p-2 flex items-center justify-between border-b">
                    <div className="flex-1 flex justify-center items-center">
                      <Select 
                        value={calendarYear.toString()} 
                        onValueChange={(value) => setCalendarYear(parseInt(value))}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder={calendarYear.toString()} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {yearOptions.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    defaultMonth={new Date(calendarYear, 0, 1)}
                    fromYear={currentYear - 100}
                    toYear={currentYear}
                    captionLayout="buttons"
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="pointer-events-auto"
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
        
        <div className="space-y-4 pt-2 border-t">
          <h3 className="font-medium">Household Options</h3>
          
          <Tabs 
            value={householdOption} 
            onValueChange={(value) => setHouseholdOption(value as HouseholdOption)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="none">No Household</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="join">Join Existing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="none">
              <p className="text-sm text-muted-foreground mb-2">
                You can create or join a household later from your dashboard.
              </p>
            </TabsContent>
            
            <TabsContent value="create">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Create a new household for your family</p>
                </div>
                
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
              </div>
            </TabsContent>
            
            <TabsContent value="join">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Join an existing household with an invite code</p>
                </div>
                
                <FormField
                  control={form.control}
                  name="householdCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Household Invite Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the invite code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
};
