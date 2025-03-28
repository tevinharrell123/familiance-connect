
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';

interface CreateHouseholdFormProps {
  onCreateHousehold: (name: string) => Promise<void>;
  isSubmitting: boolean;
}

export const CreateHouseholdForm = ({ onCreateHousehold, isSubmitting }: CreateHouseholdFormProps) => {
  const [newHouseholdName, setNewHouseholdName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHouseholdName.trim()) return;
    
    try {
      await onCreateHousehold(newHouseholdName);
      setNewHouseholdName('');
    } catch (error) {
      console.error('Error in CreateHouseholdForm:', error);
    }
  };

  return (
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
  );
};
