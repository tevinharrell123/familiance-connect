
import React from 'react';
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FamilyLoadingProps {
  isPolling?: boolean;
  pollCount?: number;
  maxPolls?: number;
}

export function FamilyLoading({ 
  isPolling = false, 
  pollCount = 0, 
  maxPolls = 10 
}: FamilyLoadingProps) {
  return (
    <div className="container mx-auto max-w-md py-10">
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          
          {isPolling ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Checking membership status...</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, (pollCount / maxPolls) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Attempt {pollCount} of {maxPolls}</p>
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
