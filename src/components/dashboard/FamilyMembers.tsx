
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-3 sm:p-4">
        <CardTitle className="text-base sm:text-lg">Family Members</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="flex justify-center mb-3 sm:mb-4">
          {familyMembers.map((member) => (
            <div key={member.id} className="flex flex-col items-center mx-1 sm:mx-2">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mb-1">
                {member.avatar ? (
                  <AvatarImage src={member.avatar} alt={member.name} />
                ) : null}
                <AvatarFallback className="text-xs sm:text-sm">{member.initials}</AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm">{member.name}</span>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">Add Request</h3>
          <Button variant="outline" className="w-full justify-start text-left text-xs sm:text-sm py-1 sm:py-2">
            Event Request
          </Button>
          <Button variant="outline" className="w-full justify-start text-left text-xs sm:text-sm py-1 sm:py-2">
            Buying Proposal
          </Button>
          <Button variant="outline" className="w-full justify-start text-left text-xs sm:text-sm py-1 sm:py-2">
            Trip Proposal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
