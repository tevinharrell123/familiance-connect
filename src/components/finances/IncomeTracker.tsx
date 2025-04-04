
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample income data
const initialIncomes = [
  { id: 1, source: 'Primary Job', amount: 3500, frequency: 'Monthly' },
  { id: 2, source: 'Side Hustle', amount: 800, frequency: 'Monthly' },
  { id: 3, source: 'Investments', amount: 400, frequency: 'Monthly' },
  { id: 4, source: 'Rental Income', amount: 500, frequency: 'Monthly' },
];

export function IncomeTracker() {
  const [incomes, setIncomes] = useState(initialIncomes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<typeof initialIncomes[0] | null>(null);
  const [newIncome, setNewIncome] = useState({
    source: '',
    amount: '',
    frequency: 'Monthly'
  });

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  const handleAddIncome = () => {
    if (newIncome.source && newIncome.amount) {
      if (editingIncome) {
        // Update existing income
        setIncomes(incomes.map(income => 
          income.id === editingIncome.id 
            ? { ...income, source: newIncome.source, amount: parseFloat(newIncome.amount), frequency: newIncome.frequency } 
            : income
        ));
      } else {
        // Add new income
        setIncomes([
          ...incomes, 
          { 
            id: Date.now(), 
            source: newIncome.source, 
            amount: parseFloat(newIncome.amount), 
            frequency: newIncome.frequency 
          }
        ]);
      }
      setNewIncome({ source: '', amount: '', frequency: 'Monthly' });
      setEditingIncome(null);
      setIsDialogOpen(false);
    }
  };

  const handleEditIncome = (income: typeof initialIncomes[0]) => {
    setEditingIncome(income);
    setNewIncome({
      source: income.source,
      amount: income.amount.toString(),
      frequency: income.frequency
    });
    setIsDialogOpen(true);
  };

  const handleDeleteIncome = (id: number) => {
    setIncomes(incomes.filter(income => income.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Income Sources</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingIncome(null);
                setNewIncome({ source: '', amount: '', frequency: 'Monthly' });
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Income Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingIncome ? 'Edit Income Source' : 'Add Income Source'}</DialogTitle>
              <DialogDescription>
                Enter the details of your income source below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="source">Source</Label>
                <Input 
                  id="source" 
                  value={newIncome.source} 
                  onChange={(e) => setNewIncome({...newIncome, source: e.target.value})}
                  placeholder="e.g., Salary, Freelance, etc."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  type="number"
                  value={newIncome.amount}
                  onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <select 
                  id="frequency"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newIncome.frequency}
                  onChange={(e) => setNewIncome({...newIncome, frequency: e.target.value})}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-weekly">Bi-weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddIncome}>{editingIncome ? 'Update' : 'Add'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Income: ${totalIncome.toFixed(2)}</CardTitle>
          <CardDescription>All income sources combined</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomes.map((income) => (
                <TableRow key={income.id}>
                  <TableCell className="font-medium">{income.source}</TableCell>
                  <TableCell>${income.amount.toFixed(2)}</TableCell>
                  <TableCell>{income.frequency}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditIncome(income)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteIncome(income.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
