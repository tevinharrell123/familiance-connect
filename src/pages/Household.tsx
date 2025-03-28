import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { AlertTriangle, Copy, Home, MoreHorizontal, Plus, RefreshCw, UserPlus } from 'lucide-react';
import { HouseholdRole } from '@/types/household';

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
  
  const [newHouseholdName, setNewHouseholdName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (household && user) {
      handleRefreshHousehold();
    }
  }, [household, user]);

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseholdName.trim()) return;
    
    try {
      setIsSubmitting(true);
      await createHousehold(newHouseholdName);
      setNewHouseholdName('');
    } catch (error) {
      console.error('Error creating household:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    
    try {
      setIsJoining(true);
      await joinHousehold(inviteCode);
      setInviteCode('');
      
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
    try {
      setIsRefreshing(true);
      await refreshHousehold();
    } catch (error) {
      console.error('Error refreshing household data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (household?.invite_code) {
      navigator.clipboard.writeText(household.invite_code);
      toast({
        title: "Invite code copied",
        description: "The invite code has been copied to your clipboard",
      });
    }
  };

  const handleRoleChange = async (memberId: string, role: HouseholdRole) => {
    try {
      await updateMemberRole(memberId, role);
      handleRefreshHousehold();
    } catch (error) {
      console.error('Error updating role:', error);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="mr-2 h-5 w-5" /> Create New Household
                </CardTitle>
                <CardDescription>
                  Start a new household for your family
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateHousehold} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="household-name" className="text-sm font-medium">
                      Household Name
                    </label>
                    <Input
                      id="household-name"
                      placeholder="The Smith Family"
                      value={newHouseholdName}
                      onChange={(e) => setNewHouseholdName(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting || !newHouseholdName.trim()}>
                    {isSubmitting ? "Creating..." : "Create Household"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" /> Join Existing Household
                </CardTitle>
                <CardDescription>
                  Join an existing household with an invite code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinHousehold} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="invite-code" className="text-sm font-medium">
                      Invite Code
                    </label>
                    <Input
                      id="invite-code"
                      placeholder="Enter invite code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isJoining || !inviteCode.trim()}>
                    {isJoining ? "Joining..." : "Join Household"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{household.name}</CardTitle>
                    <CardDescription>
                      {userRole === 'admin' ? 'You are the admin of this household' : 'You are a member of this household'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRefreshHousehold}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
                      Refresh
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <UserPlus className="h-4 w-4 mr-2" /> Invite Members
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Family Members</DialogTitle>
                          <DialogDescription>
                            Share this invite code with family members to join your household.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center space-x-2 mt-4 p-4 bg-muted rounded-md">
                          <code className="text-lg font-mono">{household.invite_code}</code>
                          <Button variant="ghost" size="icon" onClick={handleCopyInviteCode}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <DialogFooter className="mt-4">
                          <Button onClick={handleCopyInviteCode}>
                            Copy Invite Code
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-4">Household Members</h3>
                {householdMembers && householdMembers.length > 0 ? (
                  <div className="space-y-4">
                    {householdMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between bg-muted/20 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={member.profile?.avatar_url} />
                            <AvatarFallback>
                              {member.profile?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.profile?.full_name || 'Unknown User'}</p>
                            <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                          </div>
                        </div>
                        
                        {userRole === 'admin' && member.user_id !== user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'admin')}>
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'adult')}>
                                Set as Adult
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRoleChange(member.id, 'child')}>
                                Set as Child
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No members found. Try refreshing the data.</p>
                    <Button variant="outline" className="mt-4" onClick={handleRefreshHousehold}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Leave Household
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Leave Household?</DialogTitle>
                      <DialogDescription>
                        {userRole === 'admin' && householdMembers && householdMembers.length > 1 
                          ? "As the admin, if you leave, another member will be promoted to admin."
                          : "Are you sure you want to leave this household? This action cannot be undone."
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleLeaveHousehold}
                        disabled={isLeaving}
                      >
                        {isLeaving ? "Leaving..." : "Leave Household"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Household;
