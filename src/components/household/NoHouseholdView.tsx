
import React from 'react';
import { CreateHouseholdForm } from './CreateHouseholdForm';
import { JoinHouseholdForm } from './JoinHouseholdForm';

interface NoHouseholdViewProps {
  onCreateHousehold: (name: string) => Promise<void>;
  onJoinHousehold: (inviteCode: string) => Promise<void>;
  isSubmitting: boolean;
  isJoining: boolean;
}

export const NoHouseholdView = ({
  onCreateHousehold,
  onJoinHousehold,
  isSubmitting,
  isJoining
}: NoHouseholdViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CreateHouseholdForm 
        onCreateHousehold={onCreateHousehold}
        isSubmitting={isSubmitting}
      />
      <JoinHouseholdForm 
        onJoinHousehold={onJoinHousehold}
        isJoining={isJoining}
      />
    </div>
  );
};
