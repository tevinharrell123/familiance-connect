
import React from 'react';
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function FamilyLoading() {
  return (
    <div className="container mx-auto max-w-md py-10">
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your family data...</p>
          
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
