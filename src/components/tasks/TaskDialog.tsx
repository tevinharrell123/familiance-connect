
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose 
} from '@/components/ui/dialog';
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFamilyMembers } from '@/hooks/household/useFamilyMembers';
import { GoalTask, TaskProperty } from '@/types/tasks';
import { useGoals } from '@/hooks/mission/useGoals';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  defaultValues?: Partial<GoalTask>;
  title: string;
  goalId?: string;
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  goal_id: z.string(),
  assigned_to: z.string().optional().nullable(),
  target_date: z.date().optional().nullable(),
  properties: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    value: z.any()
  })).optional(),
});

const propertyTypes = [
  { id: 'text', name: 'Text', icon: 'text' },
  { id: 'number', name: 'Number', icon: 'number' },
  { id: 'select', name: 'Select', icon: 'select' },
  { id: 'multi-select', name: 'Multi-select', icon: 'multi-select' },
  { id: 'status', name: 'Status', icon: 'status' },
  { id: 'date', name: 'Date', icon: 'date' },
  { id: 'person', name: 'Person', icon: 'person' },
  { id: 'files-media', name: 'Files & media', icon: 'files-media' },
  { id: 'checkbox', name: 'Checkbox', icon: 'checkbox' },
  { id: 'url', name: 'URL', icon: 'url' },
  { id: 'email', name: 'Email', icon: 'email' },
  { id: 'phone', name: 'Phone', icon: 'phone' },
  { id: 'formula', name: 'Formula', icon: 'formula' },
  { id: 'relation', name: 'Relation', icon: 'relation' },
  { id: 'rollup', name: 'Rollup', icon: 'rollup' },
];

export function TaskDialog({ isOpen, onClose, onSubmit, defaultValues, title, goalId }: TaskDialogProps) {
  const { members } = useFamilyMembers();
  const { goals } = useGoals();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPropertyMenu, setShowPropertyMenu] = useState(false);
  const [properties, setProperties] = useState<TaskProperty[]>(defaultValues?.properties || []);
  const [propertySearchTerm, setPropertySearchTerm] = useState('');

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      goal_id: defaultValues?.goal_id || goalId || '',
      assigned_to: defaultValues?.assigned_to || 'unassigned',
      target_date: defaultValues?.target_date ? new Date(defaultValues.target_date) : null,
      properties: defaultValues?.properties || [],
    }
  });

  const handleSubmit = async (data: z.infer<typeof taskSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = {
        ...data,
        properties: properties
      };
      await onSubmit(formData);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
      toast({
        title: "Error saving task",
        description: "Failed to save task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProperty = (type: string) => {
    const newProperty: TaskProperty = {
      id: `prop_${Date.now()}`,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      type: type as any,
      value: type === 'status' ? 'In progress' : '', 
    };
    
    setProperties([...properties, newProperty]);
    setShowPropertyMenu(false);
  };

  const removeProperty = (id: string) => {
    setProperties(properties.filter(prop => prop.id !== id));
  };

  const updatePropertyValue = (id: string, value: any) => {
    setProperties(properties.map(prop => 
      prop.id === id ? { ...prop, value } : prop
    ));
  };

  const filteredPropertyTypes = propertyTypes.filter(type => 
    type.name.toLowerCase().includes(propertySearchTerm.toLowerCase())
  );

  const renderPropertyInput = (property: TaskProperty) => {
    switch(property.type) {
      case 'text':
        return (
          <Input
            value={property.value || ''}
            onChange={(e) => updatePropertyValue(property.id, e.target.value)}
            placeholder="Text value"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={property.value || ''}
            onChange={(e) => updatePropertyValue(property.id, e.target.value)}
            placeholder="0"
          />
        );
      case 'select':
        return (
          <Select
            value={property.value || ''}
            onValueChange={(value) => updatePropertyValue(property.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'status':
        return (
          <Select
            value={property.value || 'In progress'}
            onValueChange={(value) => updatePropertyValue(property.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todo">Todo</SelectItem>
              <SelectItem value="In progress">In progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
              <SelectItem value="Backlog">Backlog</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !property.value && "text-muted-foreground"
                )}
              >
                {property.value ? format(new Date(property.value), "PPP") : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={property.value ? new Date(property.value) : undefined}
                onSelect={(date) => updatePropertyValue(property.id, date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case 'person':
        return (
          <Select 
            value={property.value || ''}
            onValueChange={(value) => updatePropertyValue(property.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select person" />
            </SelectTrigger>
            <SelectContent>
              {members?.map(member => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  {member.user_profiles?.full_name || 'Unnamed Member'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              checked={property.value === true}
              onChange={(e) => updatePropertyValue(property.id, e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>Yes/No</span>
          </div>
        );
      default:
        return (
          <Input
            value={property.value || ''}
            onChange={(e) => updatePropertyValue(property.id, e.target.value)}
            placeholder={`${property.type} value`}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Task description (optional)" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="goal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Goal</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!!goalId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {goals?.map(goal => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || 'unassigned'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select family member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {members?.map(member => (
                          <SelectItem key={member.user_id} value={member.user_id}>
                            {member.user_profiles?.full_name || 'Unnamed Member'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Target Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
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
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Custom Properties Section */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Properties</h3>
                <DropdownMenu open={showPropertyMenu} onOpenChange={setShowPropertyMenu}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add property
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end">
                    <div className="px-2 py-2">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search or add new property"
                          className="pl-8"
                          value={propertySearchTerm}
                          onChange={(e) => setPropertySearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <DropdownMenuLabel>AI autofill</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem>
                        <span className="text-violet-500 mr-2">AI</span>
                        AI summary
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span className="text-violet-500 mr-2">AI</span>
                        AI custom autofill
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span className="text-violet-500 mr-2">AI</span>
                        AI translation
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span className="text-violet-500 mr-2">AI</span>
                        AI keywords
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Type</DropdownMenuLabel>
                    
                    {filteredPropertyTypes.map(type => (
                      <DropdownMenuItem 
                        key={type.id} 
                        onSelect={() => addProperty(type.id)}
                      >
                        <span className="mr-2">{type.id === 'text' ? 'T' : type.id === 'number' ? '#' : type.id[0]?.toUpperCase()}</span>
                        {type.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {properties.map((property) => (
                <div key={property.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">{property.name}</label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeProperty(property.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {renderPropertyInput(property)}
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
