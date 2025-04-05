
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FamilyGoal } from '@/types/goals';

interface GoalStatsDashboardProps {
  goals: FamilyGoal[];
}

export function GoalStatsDashboard({ goals }: GoalStatsDashboardProps) {
  // Calculate category counts and completion
  const categoryStats = goals.reduce((stats, goal) => {
    const category = goal.category;
    
    if (!stats[category]) {
      stats[category] = {
        total: 0,
        completed: 0
      };
    }
    
    stats[category].total += 1;
    if (goal.completed) {
      stats[category].completed += 1;
    }
    
    return stats;
  }, {} as Record<string, { total: number; completed: number }>);
  
  // Sort categories by total count (descending)
  const sortedCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1].total - a[1].total);
  
  // Color map for categories
  const categoryColors: Record<string, string> = {
    'Personal': 'bg-slate-500',
    'Relationship': 'bg-pink-500',
    'Children': 'bg-purple-600',
    'Spiritual': 'bg-blue-400',
    'Financial': 'bg-blue-600',
    'Health': 'bg-green-500',
    'Fitness': 'bg-teal-500',
    'Career': 'bg-yellow-500',
    'Travel': 'bg-orange-500',
    'Education': 'bg-red-500',
  };
  
  const getColorForCategory = (category: string) => {
    return categoryColors[category] || 'bg-gray-500';
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Goal Status by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedCategories.length > 0 ? (
              sortedCategories.map(([category, stats]) => {
                const completionPercentage = stats.total > 0 
                  ? Math.round((stats.completed / stats.total) * 100) 
                  : 0;
                
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className={`w-3 h-3 rounded-full mr-2 ${getColorForCategory(category)}`}
                        ></div>
                        <span className="font-medium">{category}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stats.completed} of {stats.total} completed ({completionPercentage}%)
                      </div>
                    </div>
                    <Progress 
                      value={completionPercentage} 
                      className="h-2"
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No goals yet. Create your first goal to start tracking progress.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
