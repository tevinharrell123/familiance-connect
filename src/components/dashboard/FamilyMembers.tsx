
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useHousehold } from '@/hooks/useHousehold';
import { Plus, UserPlus } from "lucide-react";

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
                  <div key={member.id} className="flex flex-col items-center mx-2">
                    <Avatar className="h-12 w-12 mb-1">
                      {member.avatar_url ? (
                        <AvatarImage src={member.avatar_url} alt={member.first_name || 'Member'} />
                      ) : null}
                      <AvatarFallback>
                        {member.first_name ? member.first_name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.first_name || 'User'}</span>
                  </div>
                ))
              ) : (
                <div className="py-2 text-center text-muted-foreground">
                  <UserPlus className="mx-auto h-8 w-8 mb-2 text-muted-foreground/60" />
                  <p>No members yet</p>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <h3 className="text-base font-medium mb-2">Add Request</h3>
              <Button variant="outline" className="w-full justify-start text-left">
                Event Request
              </Button>
              <Button variant="outline" className="w-full justify-start text-left">
                Buying Proposal
              </Button>
              <Button variant="outline" className="w-full justify-start text-left">
                Trip Proposal
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
