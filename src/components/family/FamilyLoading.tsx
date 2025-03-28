
import React from 'react';
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface FamilyLoadingProps {
  isPolling?: boolean;
  pollCount?: number;
  maxPolls?: number;
}

export function FamilyLoading({ 
  isPolling = false, 
  pollCount = 0, 
  maxPolls = 12 
}: FamilyLoadingProps) {
  const progressValue = Math.min(100, (pollCount / maxPolls) * 100);
  
  return (
    <div className="container mx-auto max-w-md py-10">
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          
          {isPolling ? (
            <div className="space-y-3 w-full">
              <p className="text-sm text-muted-foreground">
                Checking membership status...
              </p>
              <Progress value={progressValue} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Attempt {pollCount} of {maxPolls}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {progressValue < 50 
                  ? "Just a moment while we sync your data..." 
                  : progressValue < 90 
                    ? "Almost there..." 
                    : "Finalizing setup..."}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading your family data...</p>
          )}
          
          <div className="w-full space-y-2 mt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </Card>
    </div>
  );
}
