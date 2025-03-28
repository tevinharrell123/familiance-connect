
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const createHouseholdSchema = z.object({
  name: z.string().min(2, { message: "Household name must be at least 2 characters" })
});

const joinHouseholdSchema = z.object({
  inviteCode: z.string().min(6, { message: "Invite code must be at least 6 characters" })
});

type CreateHouseholdValues = z.infer<typeof createHouseholdSchema>;
type JoinHouseholdValues = z.infer<typeof joinHouseholdSchema>;

const HouseholdSetup = () => {
  const { createHousehold, joinHousehold } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  const createForm = useForm<CreateHouseholdValues>({
    resolver: zodResolver(createHouseholdSchema),
    defaultValues: {
      name: '',
    },
  });

  const joinForm = useForm<JoinHouseholdValues>({
    resolver: zodResolver(joinHouseholdSchema),
    defaultValues: {
      inviteCode: '',
    },
  });

  const handleCreateSubmit = async (values: CreateHouseholdValues) => {
    setError(null);
    try {
      setIsSubmitting(true);
      console.log("Attempting to create household:", values.name);
      await createHousehold(values.name);
      
      toast({
        title: "Success!",
        description: "Your household has been created successfully.",
      });
    } catch (error) {
      console.error('Create household error:', error);
      setError(error instanceof Error ? error.message : "Failed to create household. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Failed to create household",
        description: error instanceof Error ? error.message : "An unknown error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSubmit = async (values: JoinHouseholdValues) => {
    setError(null);
    try {
      setIsSubmitting(true);
      console.log("Attempting to join household with invite code:", values.inviteCode);
      await joinHousehold(values.inviteCode);
      
      toast({
        title: "Success!",
        description: "You've successfully joined the household.",
      });
    } catch (error) {
      console.error('Join household error:', error);
      setError(error instanceof Error ? error.message : "Failed to join household. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Failed to join household",
        description: error instanceof Error ? error.message : "An unknown error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome to FamPilot</CardTitle>
        <CardDescription>
          Create a new household or join an existing one
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs 
          defaultValue="create" 
          value={activeTab} 
          onValueChange={(value) => {
            setActiveTab(value as 'create' | 'join');
            setError(null);
          }}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
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
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Household"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="join">
            <Form {...joinForm}>
              <form onSubmit={joinForm.handleSubmit(handleJoinSubmit)} className="space-y-4">
                <FormField
                  control={joinForm.control}
                  name="inviteCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invite Code</FormLabel>
                      <FormControl>
                        <Input placeholder="AB12CD34" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Joining..." : "Join Household"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          {activeTab === 'create'
            ? "Have an invite code? "
            : "Want to create your own? "}
          <Button
            variant="link"
            className="p-0"
            onClick={() => {
              setActiveTab(activeTab === 'create' ? 'join' : 'create');
              setError(null);
            }}
          >
            {activeTab === 'create' ? 'Join a household' : 'Create a household'}
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
};

export default HouseholdSetup;
