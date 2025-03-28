
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateHouseholdForm } from './CreateHouseholdForm';
import { JoinHouseholdForm } from './JoinHouseholdForm';

interface OnboardingFlowProps {
  user: any;
}

export function OnboardingFlow({ user }: OnboardingFlowProps) {
  const [step, setStep] = useState<'welcome' | 'household'>('welcome');

  const handleStart = () => {
    setStep('household');
  };

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
                  <CreateHouseholdForm user={user} />
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
                  <JoinHouseholdForm user={user} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
