
import React from 'react';
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface FamilyLoadingProps {
  isPolling?: boolean;
  pollCount?: number;
  maxPolls?: number;
  onCreateHousehold?: () => void;
  onRetry?: () => void;
  isAuthLoading?: boolean;
}

export function FamilyLoading({ 
  isPolling = false, 
  pollCount = 0, 
  maxPolls = 12,
  onCreateHousehold,
  onRetry,
  isAuthLoading = false
}: FamilyLoadingProps) {
  const progressValue = Math.min(100, (pollCount / maxPolls) * 100);
  const pollingComplete = pollCount >= maxPolls;
  
  return (
    <div className="container mx-auto max-w-md py-10">
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          {(isPolling || isAuthLoading) && !pollingComplete && (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
          
          {isAuthLoading && (
            <p className="text-sm text-muted-foreground">Verifying your account...</p>
          )}
          
          {isPolling && !pollingComplete && !isAuthLoading && (
            <div className="space-y-3 w-full">
              <p className="text-sm text-muted-foreground">
                Checking membership status...
              </p>
              <Progress value={progressValue} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Attempt {pollCount} of {maxPolls}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {progressValue < 40 
                  ? "Just a moment while we sync your data..." 
                  : progressValue < 80 
                    ? "Almost there..." 
                    : "Finalizing setup..."}
              </p>
            </div>
          )}
          
          {!isPolling && !isAuthLoading && !pollingComplete && (
            <p className="text-sm text-muted-foreground">Loading your family data...</p>
          )}
          
          {pollingComplete && onCreateHousehold && (
            <div className="space-y-4 w-full">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 mb-2">
                <p className="text-amber-800 font-medium">No household found</p>
                <p className="text-sm text-amber-700 mt-1">
                  We couldn't find an existing household for your account.
                </p>
              </div>
              <Button onClick={onCreateHousehold} className="w-full">
                Create or Join a Household
              </Button>
              {onRetry && (
                <Button onClick={onRetry} variant="outline" className="w-full mt-2">
                  Retry
                </Button>
              )}
            </div>
          )}
          
          {!pollingComplete && (
            <div className="w-full space-y-2 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
