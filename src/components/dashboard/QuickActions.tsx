
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle } from "lucide-react";

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
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </Button>
          <Button variant="outline" className="justify-start h-10">
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
          <Button variant="outline" className="justify-start h-10">
            <Plus className="h-4 w-4 mr-2" /> Add Event
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TasksAndChores() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Tasks & Chores</CardTitle>
        <Button variant="ghost" size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2 text-amber-500">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <span>Add Task</span>
          </div>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Goal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyRoutines() {
  const routines = [
    { id: 1, task: "Clean the garage", assignee: "Today" },
    { id: 2, task: "Organize pantry", assignee: "Jason", color: "bg-purple-400" },
    { id: 3, task: "Vacuum upstairs", assignee: "Olivia", color: "bg-blue-400" },
    { id: 4, task: "Tidy the living room", assignee: "Sarah", color: "bg-sky-400" },
    { id: 5, task: "Mow the lawn", assignee: "Jason", color: "bg-orange-400" },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Routines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {routines.map((routine) => (
            <div key={routine.id} className="flex items-center justify-between">
              <div className="flex items-center">
                {routine.assignee === "Today" ? (
                  <div className="w-5 h-5 rounded-full border border-gray-300 mr-3"></div>
                ) : (
                  <div className={`w-5 h-5 rounded-full ${routine.color} mr-3`}></div>
                )}
                <span>{routine.task}</span>
              </div>
              <span className="text-sm text-muted-foreground">{routine.assignee}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
