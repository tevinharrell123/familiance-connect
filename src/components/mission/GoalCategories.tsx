
import React from 'react';
import { FamilyGoal } from '@/types/goals';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GoalCategoriesProps {
  goals: FamilyGoal[];
  categories: string[];
  onSelectCategory: (category: string) => void;
  isLoading: boolean;
}

export const GoalCategories: React.FC<GoalCategoriesProps> = ({
  goals,
  categories,
  onSelectCategory,
  isLoading
}) => {
  // Default categories to show if no custom ones exist
  const defaultCategories = [
    'Financial', 'Relationship', 'Children', 'Career'
  ];
  
  // Calculate displayed categories
  const displayedCategories = categories.length > 0 
    ? categories 
    : defaultCategories;
  
  // Calculate count of goals per category
  const getCategoryCount = (category: string) => {
    return goals.filter(goal => goal.category === category).length;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(70vh-80px)]">
      <div className="space-y-3 pr-2">
        {displayedCategories.map((category) => (
          <div 
            key={category}
            className="bg-background border rounded-md p-3 hover:bg-accent/20 transition-colors duration-200 cursor-pointer"
            onClick={() => onSelectCategory(category)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{category}</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {getCategoryCount(category)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Click to add a new {category.toLowerCase()} goal
            </p>
          </div>
        ))}
        
        <Button
          variant="outline" 
          className="w-full mt-4 border-dashed"
          onClick={() => onSelectCategory('Other')}
        >
          <Plus className="h-4 w-4 mr-2" /> Add More Categories
        </Button>
      </div>
    </ScrollArea>
  );
};
