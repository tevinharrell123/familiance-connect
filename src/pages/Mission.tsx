
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { VisionBoard } from '@/components/mission/VisionBoard';
import { GoalCategories } from '@/components/mission/GoalCategories';
import { AddGoalDialog } from '@/components/mission/AddGoalDialog';
import { useGoals } from '@/hooks/mission/useGoals';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Mission = () => {
  const { user, isLoading } = useRequireAuth();
  const { household } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { 
    goals, 
    categories, 
    isLoading: isLoadingGoals, 
    error, 
    refreshGoals 
  } = useGoals();

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setOpen(true);
  };

  const handleDialogClose = () => {
    setOpen(false);
    refreshGoals();
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading goals",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!household) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold mb-4">Household Required</h1>
          <p className="text-muted-foreground text-center mb-6">
            You need to join or create a household before setting family goals.
          </p>
          <Button onClick={() => navigate('/household')}>
            Set Up Your Household
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mission & Values</h1>
            <p className="text-muted-foreground mt-2">
              Define your family's goals and create a beautiful vision board
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add New Goal
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Vision Board</h2>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  <Info className="mr-1 h-3 w-3" /> How to use
                </Button>
              </div>
              <VisionBoard goals={goals} isLoading={isLoadingGoals} />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-card border rounded-lg p-4 md:p-6">
              <h2 className="text-xl font-semibold mb-4">Goal Categories</h2>
              <GoalCategories 
                goals={goals} 
                categories={categories}
                onSelectCategory={handleCategorySelect}
                isLoading={isLoadingGoals}
              />
            </div>
          </div>
        </div>
      </div>

      <AddGoalDialog 
        open={open} 
        onOpenChange={setOpen}
        onClose={handleDialogClose}
        initialCategory={selectedCategory}
      />
    </MainLayout>
  );
};

export default Mission;
