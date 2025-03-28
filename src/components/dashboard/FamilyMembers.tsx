
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type FamilyMember = {
  id: number;
  name: string;
  avatar?: string;
  initials: string;
};

const familyMembers: FamilyMember[] = [
  {
    id: 1,
    name: "Olivia",
    initials: "O",
  },
  {
    id: 2,
    name: "Sarah",
    avatar: "/lovable-uploads/2dd00b84-e39d-4dea-a414-c955a711e06b.png",
    initials: "S",
  },
  {
    id: 3,
    name: "Jason",
    initials: "J",
  },
  {
    id: 4,
    name: "Ethan",
    initials: "E",
  }
];

export function FamilyMembersWidget() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Family Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-4">
          {familyMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center mx-2">
              <Avatar className="h-12 w-12 mb-1">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name} />
                ) : null}
                <AvatarFallback>{member.initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{member.name}</span>
            </div>
          ))}
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
      </CardContent>
    </Card>
  );
}
