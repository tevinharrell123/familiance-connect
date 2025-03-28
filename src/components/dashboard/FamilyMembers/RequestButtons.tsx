
import React from 'react';
import { Button } from "@/components/ui/button";

export function RequestButtons() {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-medium mb-2">Add Request</h3>
      <Button variant="outline" className="w-full justify-start text-left">
        Event Request
      </Button>
      <Button variant="outline" className="w-full justify-start text-left">
        Buying Proposal
      </Button>
      <Button variant="outline" className="w-full justify-start text-left">
        Trip Proposal
      </Button>
    </div>
  );
}
