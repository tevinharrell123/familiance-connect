
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHousehold } from '@/hooks/useHousehold';
import { MemberAvatar } from './MemberAvatar';
import { RequestButtons } from './RequestButtons';
import { EmptyState } from './EmptyState';

export function FamilyMembersWidget() {
  const { members, isLoading } = useHousehold();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Family Members</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              {members.length > 0 ? (
                members.map((member) => (
                  <MemberAvatar key={member.id} member={member} />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
            
            <RequestButtons />
          </>
        )}
      </CardContent>
    </Card>
  );
}
