
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { NoHouseholdView } from '@/components/household/NoHouseholdView';
import { HouseholdDetails } from '@/components/household/HouseholdDetails';
import { HouseholdRole, HouseholdMember } from '@/types/household';

const Household = () => {
  const { user, isLoading } = useRequireAuth();
  const auth = useAuth();
  const { 
    household, 
    householdMembers,
    userRole,
    createHousehold,
    joinHousehold,
    leaveHousehold,
    updateMemberRole,
    refreshHousehold
  } = auth;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load household data only once when component mounts
  useEffect(() => {
    if (household && user && !isRefreshing) {
      handleRefreshHousehold();
    }
  }, []);

  const handleCreateHousehold = async (name: string) => {
    try {
      setIsSubmitting(true);
      await createHousehold(name);
    } catch (error) {
      console.error('Error creating household:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinHousehold = async (inviteCode: string) => {
    try {
      setIsJoining(true);
      await joinHousehold(inviteCode);
      
      // Only refresh once after joining
      setTimeout(() => {
        handleRefreshHousehold();
      }, 500);
    } catch (error) {
      console.error('Error joining household:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveHousehold = async () => {
    try {
      setIsLeaving(true);
      await leaveHousehold();
    } catch (error) {
      console.error('Error leaving household:', error);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleRefreshHousehold = async () => {
    if (isRefreshing) return; // Prevent concurrent refreshes
    
    try {
      setIsRefreshing(true);
      await refreshHousehold();
    } catch (error) {
      console.error('Error refreshing household data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: HouseholdRole) => {
    try {
      await updateMemberRole(memberId, role);
      // We don't need to manually refresh here as the UI already shows the change
    } catch (error) {
      console.error('Error updating role:', error);
      // Only refresh if there's an error to ensure UI is in sync
      handleRefreshHousehold();
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Household Management</h1>
            <p className="text-muted-foreground">Manage your family household</p>
          </div>
        </div>

        {!household ? (
          <NoHouseholdView 
            onCreateHousehold={handleCreateHousehold}
            onJoinHousehold={handleJoinHousehold}
            isSubmitting={isSubmitting}
            isJoining={isJoining}
          />
        ) : (
          <div className="space-y-6">
            <HouseholdDetails 
              household={household}
              householdMembers={householdMembers}
              userRole={userRole}
              userId={user?.id || ''}
              onRefreshHousehold={handleRefreshHousehold}
              onLeaveHousehold={handleLeaveHousehold}
              onRoleChange={handleRoleChange}
              isRefreshing={isRefreshing}
              isLeaving={isLeaving}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Household;
