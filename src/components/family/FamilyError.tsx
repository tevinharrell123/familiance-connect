
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

interface FamilyErrorProps {
  error: string | null;
  fetchAttempted: boolean;
  hasUser: boolean;
  onRetry: () => void;
  onContinue: () => void;
}

export function FamilyError({ 
  error,
  fetchAttempted,
  hasUser,
  onRetry,
  onContinue
}: FamilyErrorProps) {
  const navigate = useNavigate();
  
  if (!error) return null;
  
  const isRlsError = error.includes('RLS') || error.includes('policy error');
  
  return (
    <div className="container mx-auto max-w-md py-10">
      <Card className="p-8">
        <CardHeader>
          <div className="flex items-center justify-center mb-2 text-amber-500">
            <AlertTriangle size={40} />
          </div>
          <CardTitle className="text-xl font-bold text-center">Error</CardTitle>
          <CardDescription className="text-center text-red-500">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-6 text-sm text-muted-foreground">
            {isRlsError ? 
              "We're having trouble accessing your household data due to a database configuration issue. You can still proceed to create or join a household." :
              fetchAttempted && hasUser ? 
                "We're having trouble accessing your household data. You can proceed to create or join a household." :
                "There was an error loading your data. Please try again."}
          </p>
          <div className="flex flex-col gap-4 justify-center">
            {(fetchAttempted && hasUser) || isRlsError ? (
              <Button onClick={onContinue} className="w-full">
                Continue to Setup
              </Button>
            ) : (
              <Button onClick={onRetry} className="w-full">
                Try Again
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
