
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function CreateHouseholdModal() {
  const [open, setOpen] = useState(true);
  const [householdName, setHouseholdName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createHousehold, household } = useAuth();

  // Close the modal if the user already has a household
  if (household) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!householdName.trim()) {
      toast({
        title: "Household name required",
        description: "Please enter a name for your household",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await createHousehold(householdName);
      setOpen(false);
      toast({
        title: "Household created!",
        description: "Your household has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating household",
        description: error.message || "There was an error creating your household",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to FamPilot!</DialogTitle>
          <DialogDescription>
            Create your household to continue. You'll be able to invite family members to join later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Household Name</Label>
              <Input
                id="name"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="Enter your household name"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Household"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
