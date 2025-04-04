
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

type Transaction = {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  isIncome: boolean;
};

// Sample categorization function (this would be replaced with the OpenAI API call)
const mockCategorizeTransactions = (transactions: Omit<Transaction, 'category'>[]) => {
  const categories = ['Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Income'];
  
  return transactions.map(transaction => {
    let category;
    
    if (transaction.isIncome) {
      category = 'Income';
    } else if (transaction.description.toLowerCase().includes('rent') || 
              transaction.description.toLowerCase().includes('mortgage')) {
      category = 'Housing';
    } else if (transaction.description.toLowerCase().includes('grocery') || 
              transaction.description.toLowerCase().includes('restaurant')) {
      category = 'Food';
    } else if (transaction.description.toLowerCase().includes('gas') || 
              transaction.description.toLowerCase().includes('uber')) {
      category = 'Transportation';
    } else if (transaction.description.toLowerCase().includes('electric') || 
              transaction.description.toLowerCase().includes('water')) {
      category = 'Utilities';
    } else if (transaction.description.toLowerCase().includes('netflix') || 
              transaction.description.toLowerCase().includes('movie')) {
      category = 'Entertainment';
    } else {
      // Randomly assign for mock data
      category = categories[Math.floor(Math.random() * 5)];
    }
    
    return {
      ...transaction,
      category
    };
  });
};

export function TransactionUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    
    // This would be a real CSV/file parser in production
    // For demo purposes, we'll create mock transactions
    setTimeout(() => {
      // Mock transactions data
      const mockTransactions: Omit<Transaction, 'category'>[] = [
        { id: 1, date: '2025-04-01', description: 'Monthly Salary', amount: 3500, isIncome: true },
        { id: 2, date: '2025-04-02', description: 'Rent Payment', amount: 1500, isIncome: false },
        { id: 3, date: '2025-04-03', description: 'Whole Foods Grocery', amount: 125.45, isIncome: false },
        { id: 4, date: '2025-04-05', description: 'Netflix Subscription', amount: 15.99, isIncome: false },
        { id: 5, date: '2025-04-07', description: 'Shell Gas Station', amount: 45.33, isIncome: false },
        { id: 6, date: '2025-04-10', description: 'Electric Bill', amount: 85.20, isIncome: false },
        { id: 7, date: '2025-04-12', description: 'Uber Ride', amount: 24.50, isIncome: false },
        { id: 8, date: '2025-04-15', description: 'Freelance Payment', amount: 800, isIncome: true },
        { id: 9, date: '2025-04-18', description: 'Restaurant Dinner', amount: 78.90, isIncome: false },
        { id: 10, date: '2025-04-20', description: 'Amazon Purchase', amount: 56.78, isIncome: false },
      ];
      
      // In production, this would be the OpenAI API call to categorize transactions
      const categorizedTransactions = mockCategorizeTransactions(mockTransactions);
      
      setTransactions(categorizedTransactions);
      setIsProcessing(false);
      toast({
        title: "Transactions processed!",
        description: `${categorizedTransactions.length} transactions were processed and categorized.`,
      });
    }, 2000);
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Housing': return 'bg-purple-100 text-purple-800';
      case 'Food': return 'bg-green-100 text-green-800';
      case 'Transportation': return 'bg-blue-100 text-blue-800';
      case 'Utilities': return 'bg-yellow-100 text-yellow-800';
      case 'Entertainment': return 'bg-pink-100 text-pink-800';
      case 'Income': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Transaction Statement</CardTitle>
          <CardDescription>
            Upload your bank or credit card statement to automatically categorize your transactions using AI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="transaction-file">Upload statement (CSV, PDF)</Label>
              <div className="flex items-center gap-3">
                <Input 
                  id="transaction-file" 
                  type="file" 
                  accept=".csv,.pdf,.xlsx" 
                  onChange={handleFileChange}
                />
                <Button 
                  onClick={processFile}
                  disabled={!file || isProcessing}
                >
                  {isProcessing ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" /> Upload</>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Your data is processed securely and never stored on our servers.
              </p>
            </div>
            
            {transactions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Processed Transactions</h3>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" /> Export
                  </Button>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell className={transaction.isIncome ? "text-green-600" : "text-red-600"}>
                            {transaction.isIncome ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(transaction.category)}>
                              {transaction.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.isIncome ? "outline" : "secondary"}>
                              {transaction.isIncome ? "Income" : "Expense"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4 pl-5 list-decimal">
            <li className="text-sm">
              <span className="font-medium">Upload your statement:</span> We support CSV, PDF, and Excel formats from most major banks and credit card providers.
            </li>
            <li className="text-sm">
              <span className="font-medium">AI categorization:</span> Our AI automatically analyzes and categorizes each transaction based on the description and amount.
            </li>
            <li className="text-sm">
              <span className="font-medium">Review and adjust:</span> You can review the categorized transactions and make any necessary adjustments.
            </li>
            <li className="text-sm">
              <span className="font-medium">Compare with budget:</span> See how your actual spending compares to your planned budget and identify areas to improve.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
