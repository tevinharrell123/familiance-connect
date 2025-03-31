
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGoals } from "@/hooks/mission/useGoals";

export function BudgetSummary() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Monthly Budget</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold">$0</span>
          <span className="ml-1 text-sm text-muted-foreground">remaining</span>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">0 spent</p>
      </CardFooter>
    </Card>
  );
}

export function GoalsSummary() {
  const { goals, isLoading } = useGoals();
  
  // Calculate goal statistics
  const completedGoals = goals.filter(goal => goal.completed).length;
  const inProgressGoals = goals.filter(goal => !goal.completed && (goal.progress || 0) > 0).length;
  
  // Calculate overall progress percentage
  const totalProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length) 
    : 0;
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Goals Progress</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold">{completedGoals}</span>
          <span className="ml-1 text-sm text-muted-foreground">completed</span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <div className="flex justify-between mb-1 text-sm">
            <span>{inProgressGoals} in progress</span>
            <span>{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>
      </CardFooter>
    </Card>
  );
}
