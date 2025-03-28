
import React from 'react';
import { Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import HouseholdSetup from '@/components/household/HouseholdSetup';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HouseholdRole } from '@/types/household';

const roleBadgeColors: Record<HouseholdRole, string> = {
  admin: 'bg-red-100 text-red-800 hover:bg-red-200',
  adult: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  child: 'bg-green-100 text-green-800 hover:bg-green-200',
  guest: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
};

const roleLabels: Record<HouseholdRole, string> = {
  admin: 'Admin',
  adult: 'Adult',
  child: 'Child',
  guest: 'Guest',
};

const Household = () => {
  const { user, isLoading } = useRequireAuth();
  const { 
    household, 
    householdMembers, 
    userRole, 
    leaveHousehold,
    deleteHousehold,
    refreshHousehold
  } = useAuth();
  
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

  const handleRefresh = async () => {
    try {
      await refreshHousehold();
    } catch (error) {
      console.error('Error refreshing household data:', error);
    }
  };

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
          {household ? (
            <div className="space-y-6 w-full max-w-3xl">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{household.name}</CardTitle>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRefresh}
                      title="Refresh household data"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Household Members: {householdMembers?.length || 0}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-4">
                      {householdMembers?.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar_url} alt={member.full_name} />
                              <AvatarFallback>
                                {member.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.full_name}</p>
                              <Badge variant="outline" className={roleBadgeColors[member.role]}>
                                {roleLabels[member.role]}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <div className="flex flex-col space-y-4">
                {userRole === 'admin' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Household
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Household</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this household? This action cannot be undone.
                          All members will be removed from the household.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {}}>Cancel</Button>
                        <Button 
                          variant="destructive" 
                          onClick={deleteHousehold}
                        >
                          Delete Household
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="w-full">
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Household
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Leave Household</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to leave this household? 
                        {userRole === 'admin' && householdMembers && householdMembers.length > 1 && (
                          " As the admin, you must transfer ownership before leaving."
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                      <Button 
                        variant="destructive" 
                        onClick={leaveHousehold}
                        disabled={userRole === 'admin' && householdMembers && householdMembers.length > 1}
                      >
                        Leave Household
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <HouseholdSetup />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Household;
