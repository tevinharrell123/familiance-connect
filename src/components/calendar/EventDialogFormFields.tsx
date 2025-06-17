import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CalendarFormValues } from '@/types/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChildProfiles } from '@/hooks/household/useChildProfiles';
import { useAuth } from '@/contexts/AuthContext';

interface EventDialogFormFieldsProps {
  form: UseFormReturn<CalendarFormValues>;
  showHouseholdOption: boolean;
}

export function EventDialogFormFields({ form, showHouseholdOption }: EventDialogFormFieldsProps) {
  const { childProfiles } = useChildProfiles();
  const { household } = useAuth();

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
        
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Color</FormLabel>
              <FormControl>
                <Input type="color" {...field} value={field.value || '#7B68EE'} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Child Assignment Field */}
        {household && childProfiles.length > 0 && (
          <FormField
            control={form.control}
            name="assigned_to_child"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign to Child (optional)</FormLabel>
                <FormControl>
                  <select 
                    {...field} 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={field.value || ''}
                  >
                    <option value="">Not assigned to any child</option>
                    {childProfiles.map((child) => (
                      <option key={child.id} value={child.id}>
                        {child.name} {child.age ? `(Age ${child.age})` : ''}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
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
