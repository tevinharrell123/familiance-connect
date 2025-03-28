
import React from 'react';
import { UserPlus } from "lucide-react";

export function EmptyState() {
  return (
    <div className="py-2 text-center text-muted-foreground">
      <UserPlus className="mx-auto h-8 w-8 mb-2 text-muted-foreground/60" />
      <p>No members yet</p>
    </div>
  );
}
