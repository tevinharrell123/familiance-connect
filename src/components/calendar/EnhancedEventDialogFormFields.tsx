
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CalendarFormValues, EVENT_CATEGORIES, CATEGORY_COLORS, PERSON_COLORS } from '@/types/calendar';
import { format } from 'date-fns';
import { CalendarIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { useAuth } from '@/contexts/AuthContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface EnhancedEventDialogFormFieldsProps {
  form: UseFormReturn<CalendarFormValues>;
  showHouseholdOption: boolean;
}

export function EnhancedEventDialogFormFields({ form, showHouseholdOption }: EnhancedEventDialogFormFieldsProps) {
  const { childProfiles } = useChildProfiles();
  const { members: householdMembers } = useFamilyMembers();
  const { household, user } = useAuth();

  // Combine household members and children for assignment dropdown
  const allAssignablePersons = React.useMemo(() => {
    const persons = [];
    
    // Add household members
    if (householdMembers) {
      householdMembers.forEach((member) => {
        persons.push({
          id: member.user_id,
          name: member.user_profiles?.full_name || 'Unknown Member',
          avatar_url: member.user_profiles?.avatar_url,
          type: 'member' as const
        });
      });
    }
    
    // Add children
    if (childProfiles) {
      childProfiles.forEach((child) => {
        persons.push({
          id: child.id,
          name: child.name,
          avatar_url: child.avatar_url,
          type: 'child' as const
        });
      });
    }
    
    return persons;
  }, [householdMembers, childProfiles]);

  const getPersonColor = (personId: string) => {
    const index = allAssignablePersons.findIndex(p => p.id === personId);
    return PERSON_COLORS[index % PERSON_COLORS.length];
  };

  const selectedCategory = form.watch('category');
  const selectedPerson = form.watch('assigned_to_member') || form.watch('assigned_to_child');
  const colorSource = form.watch('color');

  // Auto-set color based on category or person
  React.useEffect(() => {
    if (selectedCategory && selectedCategory !== 'Other') {
      form.setValue('color', CATEGORY_COLORS[selectedCategory as keyof typeof CATEGORY_COLORS]);
    } else if (selectedPerson) {
      form.setValue('color', getPersonColor(selectedPerson));
    }
  }, [selectedCategory, selectedPerson, form]);

  return (
    <Form {...form}>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Event description" 
                  className="resize-none"
                  {...field} 
                  value={field.value || ''} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category Selection */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EVENT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CATEGORY_COLORS[category] }}
                        />
                        {category}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Assign to Person */}
        {household && allAssignablePersons.length > 0 && (
          <FormField
            control={form.control}
            name="assigned_to_member"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign to Person (optional)</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value || undefined);
                    // Clear child assignment if member is selected
                    if (value) {
                      const person = allAssignablePersons.find(p => p.id === value);
                      if (person?.type === 'child') {
                        form.setValue('assigned_to_child', value);
                        form.setValue('assigned_to_member', undefined);
                      } else {
                        form.setValue('assigned_to_child', undefined);
                      }
                    }
                  }} 
                  value={field.value || form.watch('assigned_to_child') || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Not assigned to anyone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Not assigned to anyone</SelectItem>
                    {allAssignablePersons.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            {person.avatar_url ? (
                              <AvatarImage src={person.avatar_url} />
                            ) : null}
                            <AvatarFallback className="text-xs">
                              {person.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{person.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({person.type === 'child' ? 'Child' : 'Member'})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Recurring Event Options */}
        <FormField
          control={form.control}
          name="recurrence_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repeat</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || 'none'}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Does not repeat" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Does not repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Recurrence End Date - only show if recurring */}
        {form.watch('recurrence_type') && form.watch('recurrence_type') !== 'none' && (
          <FormField
            control={form.control}
            name="recurrence_end"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Repeat (optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Never ends</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Color</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input 
                    type="color" 
                    {...field} 
                    value={field.value || '#7B68EE'} 
                    className="w-16 h-10"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedCategory && selectedCategory !== 'Other' 
                      ? `Auto-set from category: ${selectedCategory}`
                      : selectedPerson 
                        ? `Auto-set from person`
                        : 'Custom color'
                    }
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showHouseholdOption && (
          <FormField
            control={form.control}
            name="is_household_event"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Event Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === 'household')}
                    defaultValue={field.value ? 'household' : 'personal'}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="personal" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Personal Event (only visible to you)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="household" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Household Event (visible to all household members)
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </Form>
  );
}
