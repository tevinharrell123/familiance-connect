
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, Sparkles } from 'lucide-react';

const Mission = () => {
  const [coreValues, setCoreValues] = React.useState<string[]>([
    "Honesty", "Support", "Fun", "Growth", "Communication"
  ]);
  const [newValue, setNewValue] = React.useState('');

  const handleAddValue = () => {
    if (newValue.trim() && !coreValues.includes(newValue.trim())) {
      setCoreValues([...coreValues, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemoveValue = (value: string) => {
    setCoreValues(coreValues.filter(v => v !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddValue();
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mission & Values</h1>
          <p className="text-lg text-muted-foreground">Define what matters most to your family</p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Family Mission Statement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Our family's purpose is to..." 
                className="min-h-32 text-base"
                defaultValue="Our family exists to support each other's growth, celebrate our victories, weather life's challenges together, and create a home filled with joy, learning, and unconditional love."
              />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Generate Suggestions
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Core Values</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                {coreValues.map((value) => (
                  <Badge 
                    key={value} 
                    variant="outline"
                    className="py-2 px-3 text-sm cursor-pointer hover:bg-muted transition-colors group"
                    onClick={() => handleRemoveValue(value)}
                  >
                    {value}
                    <span className="ml-1 opacity-0 group-hover:opacity-100">×</span>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a new value..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button 
                  onClick={handleAddValue}
                  size="sm"
                  disabled={!newValue.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Suggest Values
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Vision Board</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="aspect-square rounded-lg border-2 border-dashed border-muted flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center p-4 text-center">
                  <span className="text-sm">Summer vacation in Italy</span>
                </div>
                <div className="aspect-square rounded-lg bg-gradient-to-br from-fampilot-accent1/20 to-fampilot-accent1/10 flex items-center justify-center p-4 text-center">
                  <span className="text-sm">Build a treehouse together</span>
                </div>
                <div className="aspect-square rounded-lg bg-gradient-to-br from-fampilot-secondary/20 to-fampilot-secondary/10 flex items-center justify-center p-4 text-center">
                  <span className="text-sm">Weekly family game nights</span>
                </div>
                <div className="aspect-square rounded-lg bg-gradient-to-br from-fampilot-accent2/20 to-fampilot-accent2/10 flex items-center justify-center p-4 text-center">
                  <span className="text-sm">Learn to cook together</span>
                </div>
                <div className="aspect-square rounded-lg border-2 border-dashed border-muted flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Vision Ideas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Mission;
