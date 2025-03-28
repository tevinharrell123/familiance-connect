
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Goals Progress</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold">0</span>
          <span className="ml-1 text-sm text-muted-foreground">completed</span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <div className="flex justify-between mb-1 text-sm">
            <span>3 in progress</span>
            <span>0%</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>
      </CardFooter>
    </Card>
  );
}
