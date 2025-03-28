
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Household = () => {
  const { user, isLoading } = useRequireAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Household</h1>
          <p className="text-lg text-muted-foreground">
            This feature has been removed.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <CardTitle>Household Management Removed</CardTitle>
              <CardDescription>
                The household management functionality has been removed from this application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please return to the dashboard to access other features of the application.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Household;
