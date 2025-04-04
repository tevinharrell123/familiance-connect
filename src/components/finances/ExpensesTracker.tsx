
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
import { Badge } from '@/components/ui/badge';

// Sample expenses data
const initialExpenses = [
  { id: 1, name: 'Rent', amount: 1500, category: 'Housing', dueDate: '2025-04-01' },
  { id: 2, name: 'Groceries', amount: 500, category: 'Food', dueDate: '2025-04-15' },
  { id: 3, name: 'Internet', amount: 80, category: 'Utilities', dueDate: '2025-04-10' },
  { id: 4, name: 'Car Payment', amount: 350, category: 'Transportation', dueDate: '2025-04-05' },
  { id: 5, name: 'Streaming Services', amount: 50, category: 'Entertainment', dueDate: '2025-04-15' },
];

const categories = [
  'Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 
  'Healthcare', 'Debt', 'Savings', 'Personal', 'Other'
];

export function ExpensesTracker() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<typeof initialExpenses[0] | null>(null);
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    category: 'Housing',
    dueDate: ''
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Housing': return 'bg-purple-100 text-purple-800';
      case 'Food': return 'bg-green-100 text-green-800';
      case 'Transportation': return 'bg-blue-100 text-blue-800';
      case 'Utilities': return 'bg-yellow-100 text-yellow-800';
      case 'Entertainment': return 'bg-pink-100 text-pink-800';
      case 'Healthcare': return 'bg-red-100 text-red-800';
      case 'Debt': return 'bg-orange-100 text-orange-800';
      case 'Savings': return 'bg-cyan-100 text-cyan-800';
      case 'Personal': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddExpense = () => {
    if (newExpense.name && newExpense.amount && newExpense.dueDate) {
      if (editingExpense) {
        // Update existing expense
        setExpenses(expenses.map(expense => 
          expense.id === editingExpense.id 
            ? { 
                ...expense, 
                name: newExpense.name, 
                amount: parseFloat(newExpense.amount), 
                category: newExpense.category,
                dueDate: newExpense.dueDate
              } 
            : expense
        ));
      } else {
        // Add new expense
        setExpenses([
          ...expenses, 
          { 
            id: Date.now(), 
            name: newExpense.name, 
            amount: parseFloat(newExpense.amount), 
            category: newExpense.category,
            dueDate: newExpense.dueDate
          }
        ]);
      }
      setNewExpense({ name: '', amount: '', category: 'Housing', dueDate: '' });
      setEditingExpense(null);
      setIsDialogOpen(false);
    }
  };

  const handleEditExpense = (expense: typeof initialExpenses[0]) => {
    setEditingExpense(expense);
    setNewExpense({
      name: expense.name,
      amount: expense.amount.toString(),
      category: expense.category,
      dueDate: expense.dueDate
    });
    setIsDialogOpen(true);
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Sort expenses by due date
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Monthly Expenses</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingExpense(null);
                setNewExpense({ name: '', amount: '', category: 'Housing', dueDate: '' });
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
              <DialogDescription>
                Enter the details of your expense below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Expense Name</Label>
                <Input 
                  id="name" 
                  value={newExpense.name} 
                  onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                  placeholder="e.g., Rent, Groceries, etc."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount" 
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date"
                  value={newExpense.dueDate}
                  onChange={(e) => setNewExpense({...newExpense, dueDate: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddExpense}>{editingExpense ? 'Update' : 'Add'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Monthly Expenses: ${totalExpenses.toFixed(2)}</CardTitle>
          <CardDescription>All expenses combined</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Expense</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.name}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(expense.category)}>
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(expense.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEditExpense(expense)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
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
