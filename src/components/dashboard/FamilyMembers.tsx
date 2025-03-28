
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from '@/components/ui/use-toast';

type FamilyMember = {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  role: 'admin' | 'adult' | 'child';
};

export function FamilyMembersWidget() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHousehold, setCurrentHousehold] = useState<string | null>(null);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          return;
        }

        // First get the user's household
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('household_id')
          .eq('user_id', session.user.id)
          .single();

        if (membershipError) {
          console.error('Error fetching membership:', membershipError);
          setLoading(false);
          return;
        }

        setCurrentHousehold(membershipData.household_id);

        // Get all household members with their profiles
        const { data: members, error: membersError } = await supabase
          .from('memberships')
          .select(`
            id, role, user_id,
            user_profiles:user_id(id, full_name, avatar_url)
          `)
          .eq('household_id', membershipData.household_id);

        if (membersError) {
          console.error('Error fetching members:', membersError);
          toast({
            title: "Error",
            description: "Failed to fetch family members",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Transform data for component
        const formattedMembers = members.map((member: any) => {
          const profile = member.user_profiles;
          const name = profile?.full_name || 'Family Member';
          const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
          
          return {
            id: member.id,
            name,
            avatar: profile?.avatar_url,
            initials,
            role: member.role
          };
        });

        setFamilyMembers(formattedMembers);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyMembers();
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Family Members</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-pulse text-muted-foreground">Loading members...</div>
          </div>
        ) : familyMembers.length > 0 ? (
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
                <span className="text-xs text-muted-foreground">{member.role}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            No family members found
          </div>
        )}
        
        <div className="space-y-3 mt-4">
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
