
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const Auth = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-fampilot-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">FamPilot</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'login' | 'register')}
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {activeTab === 'login'
              ? "Don't have an account? "
              : "Already have an account? "}
            <Button
              variant="link"
              className="p-0"
              onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
            >
              {activeTab === 'login' ? 'Register' : 'Login'}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
