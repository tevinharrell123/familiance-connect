
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { HouseholdMember } from '@/types/household';
import { ChildProfile } from '@/types/child-profiles';

interface Person {
  id: string;
  name: string;
  avatar_url?: string;
  type: 'member' | 'child';
}

interface CalendarFiltersProps {
  householdMembers: HouseholdMember[];
  childProfiles: ChildProfile[] | null;
  selectedPersonIds: string[];
  onPersonToggle: (personId: string) => void;
  onClearFilters: () => void;
}

export function CalendarFilters({
  householdMembers,
  childProfiles,
  selectedPersonIds,
  onPersonToggle,
  onClearFilters
}: CalendarFiltersProps) {
  // Combine household members and children into a single list
  const allPeople: Person[] = [
    ...(householdMembers || []).map(member => ({
      id: member.user_id,
      name: member.user_profiles?.full_name || `User ${member.user_id.substring(0, 8)}`,
      avatar_url: member.user_profiles?.avatar_url,
      type: 'member' as const
    })),
    ...(childProfiles || []).map(child => ({
      id: child.id,
      name: child.name,
      avatar_url: child.avatar_url,
      type: 'child' as const
    }))
  ];

  const getPersonInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const selectedCount = selectedPersonIds.length;
  const hasFilters = selectedCount > 0;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filter by Person
            {hasFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {selectedCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 p-3 bg-background">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Filter by Person</h4>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-6 px-2 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allPeople.map(person => (
                <div key={person.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={person.id}
                    checked={selectedPersonIds.includes(person.id)}
                    onCheckedChange={() => onPersonToggle(person.id)}
                  />
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={person.avatar_url || ''} alt={person.name} />
                    <AvatarFallback className="text-xs">
                      {getPersonInitials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor={person.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {person.name}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({person.type === 'child' ? 'Child' : 'Member'})
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasFilters && (
        <div className="flex items-center gap-1 flex-wrap">
          {selectedPersonIds.slice(0, 3).map(personId => {
            const person = allPeople.find(p => p.id === personId);
            if (!person) return null;
            
            return (
              <Badge key={personId} variant="secondary" className="gap-1">
                <Avatar className="h-3 w-3">
                  <AvatarImage src={person.avatar_url || ''} alt={person.name} />
                  <AvatarFallback className="text-[8px]">
                    {getPersonInitials(person.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{person.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => onPersonToggle(personId)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            );
          })}
          {selectedCount > 3 && (
            <Badge variant="secondary">
              +{selectedCount - 3} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
