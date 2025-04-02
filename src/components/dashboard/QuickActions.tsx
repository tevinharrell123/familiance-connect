
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="justify-start h-10" asChild>
            <Link to="/goals">
              <Plus className="h-4 w-4 mr-2" /> Add Goal
            </Link>
          </Button>
          <Button variant="outline" className="justify-start h-10" asChild>
            <Link to="/tasks">
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
