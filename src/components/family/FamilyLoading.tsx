
import React from 'react';
import { Card } from "@/components/ui/card";

export function FamilyLoading() {
  return (
    <div className="container mx-auto max-w-md py-10">
      <Card className="p-8 text-center">
        <div className="animate-pulse">Loading...</div>
      </Card>
    </div>
  );
}
