
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FamilyGoal } from '@/types/goals';
import { CircleIcon } from 'lucide-react';

type GoalStatusData = {
  label: string;
  count: number;
  bgColor: string;
  textColor: string;
};

interface GoalStatsDashboardProps {
  goals: FamilyGoal[];
}

export function GoalStatsDashboard({ goals }: GoalStatsDashboardProps) {
  // Calculate completion rate
  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.completed).length;
  const completionPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  
  // Calculate category counts
  const categoryMap = goals.reduce((acc, goal) => {
    const category = goal.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category]++;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort categories by count (descending)
  const sortedCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Show top 5 categories
  
  // Calculate status counts
  const inProgressCount = goals.filter(goal => !goal.completed && (goal.progress || 0) > 0).length;
  const onTrackCount = goals.filter(goal => !goal.completed && (goal.progress || 0) >= 50).length;
  const atRiskCount = goals.filter(goal => !goal.completed && (goal.progress || 0) < 20 && (goal.progress || 0) > 0).length;
  const onHoldCount = goals.filter(goal => !goal.completed && (goal.progress || 0) === 0).length;
  
  // Status data for display
  const statusData: GoalStatusData[] = [
    { label: 'In Progress', count: inProgressCount, bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
    { label: 'On Track', count: onTrackCount, bgColor: 'bg-green-50', textColor: 'text-green-700' },
    { label: 'At Risk', count: atRiskCount, bgColor: 'bg-amber-50', textColor: 'text-amber-700' },
    { label: 'On Hold', count: onHoldCount, bgColor: 'bg-red-50', textColor: 'text-red-700' },
  ];
  
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
      {/* Completion Rate */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 my-2">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold">{completionPercentage}%</div>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#f1f1f1"
                  strokeWidth="10"
                />
                {completionPercentage > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={`${completionPercentage * 2.83} 283`}
                    strokeLinecap="round"
                    className="text-primary transform -rotate-90 origin-center"
                  />
                )}
              </svg>
            </div>
            <div className="text-center text-muted-foreground mt-2">
              {completedGoals} of {totalGoals} goals completed
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Goal Categories */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Goal Categories</h3>
          <div className="space-y-4">
            {sortedCategories.length > 0 ? (
              sortedCategories.map(([category, count]) => (
                <div key={category} className="space-y-1">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${getColorForCategory(category)}`}></div>
                    <span>{category}</span>
                    <span className="ml-auto">{count}</span>
                  </div>
                  <Progress 
                    value={totalGoals > 0 ? (count / totalGoals) * 100 : 0} 
                    className="h-1.5"
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">No goals yet</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Goal Status */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Goal Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {statusData.map((status) => (
              <div 
                key={status.label} 
                className={`${status.bgColor} ${status.textColor} rounded-lg p-4 text-center`}
              >
                <div className="text-2xl font-bold">{status.count}</div>
                <div className="text-sm">{status.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
