
import React from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import HouseholdSetup from '@/components/household/HouseholdSetup';
import HouseholdDashboard from '@/components/household/HouseholdDashboard';

const Household = () => {
  const { user, isLoading } = useRequireAuth();
  const { household } = useAuth();
  
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
          <h1 className="text-4xl font-bold mb-2">Household Management</h1>
          <p className="text-lg text-muted-foreground">
            {household 
              ? "Manage your household settings and members" 
              : "Create or join a household to get started"
            }
          </p>
        </div>
        
        <div className="flex justify-center">
          {household ? <HouseholdDashboard /> : <HouseholdSetup />}
        </div>
      </div>
    </MainLayout>
  );
};

export default Household;
