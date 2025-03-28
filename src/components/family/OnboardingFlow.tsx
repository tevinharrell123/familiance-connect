
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateHouseholdForm } from './CreateHouseholdForm';
import { JoinHouseholdForm } from './JoinHouseholdForm';
import { LoginForm } from './LoginForm';
import { useAuth } from '@/contexts/AuthContext';

export function OnboardingFlow() {
  const [step, setStep] = useState<'welcome' | 'household' | 'login'>('welcome');
  const { user, isLoading } = useAuth();

  const handleStart = () => {
    setStep('household');
  };

  const handleLoginClick = () => {
    setStep('login');
  };

  const handleBackToOptions = () => {
    setStep('household');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-md py-10">
        <Card className="p-8 text-center">
          <div className="animate-pulse">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-10">
      {step === 'welcome' ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to Family Hub</CardTitle>
            <CardDescription>
              Let's get started with setting up your family profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="rounded-lg bg-muted p-6 mb-4">
              <img 
                src="/lovable-uploads/2dd00b84-e39d-4dea-a414-c955a711e06b.png" 
                alt="Family illustration" 
                className="w-24 h-24 mx-auto mb-4 rounded-full"
              />
              <p className="text-muted-foreground">
                Family Hub helps you organize your household, manage tasks, and stay connected with your loved ones.
              </p>
            </div>
            <Button onClick={handleStart} className="w-full">
              Get Started
            </Button>
          </CardContent>
        </Card>
      ) : step === 'login' ? (
        <Card>
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>
              Enter your credentials to access your family dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
            <div className="mt-4 text-center">
              <Button variant="link" onClick={handleBackToOptions}>
                Back to Options
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Set Up Your Household</CardTitle>
            <CardDescription>
              {user ? "Create a new household or join an existing one" : "Create a new account and household or join an existing one"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create New</TabsTrigger>
                <TabsTrigger value="join">Join Existing</TabsTrigger>
              </TabsList>
              <TabsContent value="create">
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {user 
                      ? "Create a new household that your family members can join. You'll be the administrator."
                      : "Create a new account and household. You'll be the administrator."
                    }
                  </p>
                  <CreateHouseholdForm />
                </div>
              </TabsContent>
              <TabsContent value="join">
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {user
                      ? "Join an existing household by entering the household ID shared with you."
                      : "Create an account and join an existing household by entering the household ID shared with you."
                    }
                  </p>
                  <JoinHouseholdForm />
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Already have an account?</p>
              <Button variant="outline" onClick={handleLoginClick} className="w-full">
                Log In
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
