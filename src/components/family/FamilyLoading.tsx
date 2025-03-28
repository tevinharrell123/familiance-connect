
import React from 'react';
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function FamilyLoading() {
  return (
    <div className="container mx-auto max-w-md py-10">
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your family data...</p>
        </div>
      </Card>
    </div>
  );
}
