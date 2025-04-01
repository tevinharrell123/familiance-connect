
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function QuickActions() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="justify-start h-10">
            <Plus className="h-4 w-4 mr-2" /> Add Goal
          </Button>
          <Button variant="outline" className="justify-start h-10">
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
