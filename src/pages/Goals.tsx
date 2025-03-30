
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useGoals } from '@/hooks/mission/useGoals';
import { Navigate, useNavigate, Link, Routes, Route } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, Edit, Plus, Search, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { FamilyGoal } from '@/types/goals';
import { GoalDetails } from '@/components/mission/GoalDetails';
import { AddGoalDialog } from '@/components/mission/AddGoalDialog';
import { useAuth } from '@/contexts/AuthContext';

const Goals = () => {
  const { user, isLoading: authLoading } = useRequireAuth();
  const { household } = useAuth();
  const navigate = useNavigate();
  
  const { goals, categories, isLoading: goalsLoading, refreshGoals } = useGoals();
  
  const [filteredGoals, setFilteredGoals] = useState<FamilyGoal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('target_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  
  // Filter and sort goals
  useEffect(() => {
    if (!goals) return;
    
    let result = [...goals];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(goal => goal.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter === 'completed') {
      result = result.filter(goal => goal.completed);
    } else if (statusFilter === 'in-progress') {
      result = result.filter(goal => goal.progress > 0 && !goal.completed);
    } else if (statusFilter === 'not-started') {
      result = result.filter(goal => goal.progress === 0 && !goal.completed);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(goal => 
        goal.title.toLowerCase().includes(term) || 
        (goal.description && goal.description.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'progress':
          comparison = (a.progress || 0) - (b.progress || 0);
          break;
        case 'target_date':
          // Handle null dates - sort them to the end regardless of direction
          if (!a.target_date && !b.target_date) return 0;
          if (!a.target_date) return 1;
          if (!b.target_date) return -1;
          comparison = new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
          break;
        default:
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredGoals(result);
  }, [goals, categoryFilter, statusFilter, searchTerm, sortField, sortDirection]);
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!household) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold mb-4">Household Required</h1>
          <p className="text-muted-foreground text-center mb-6">
            You need to join or create a household before setting family goals.
          </p>
          <Button onClick={() => navigate('/household')}>
            Set Up Your Household
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <Routes>
        <Route path="/:goalId" element={<GoalDetails />} />
        <Route path="/" element={
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold">Goals Tracker</h1>
                <p className="text-muted-foreground mt-2">
                  Track and manage all your family goals in one place
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button onClick={() => setAddGoalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Goal
                </Button>
              </div>
            </div>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter and search through your goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search goals..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  <div className="w-full md:w-48">
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full md:w-48">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="not-started">Not Started</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {goalsLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex space-x-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-2 flex-grow">
                          <Skeleton className="h-4 w-3/4 rounded-md" />
                          <Skeleton className="h-3 w-1/2 rounded-md" />
                        </div>
                        <Skeleton className="h-8 w-24 rounded-md" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : filteredGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <p className="text-muted-foreground mb-2">No goals found</p>
                  <p className="text-sm mb-4">
                    {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try changing your filters or search term'
                      : 'Start by adding your first goal'}
                  </p>
                  {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                    <Button onClick={() => setAddGoalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Add New Goal
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort('title')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Goal</span>
                            {getSortIcon('title')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort('category')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Category</span>
                            {getSortIcon('category')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort('target_date')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Target Date</span>
                            {getSortIcon('target_date')}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer"
                          onClick={() => handleSort('progress')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Progress</span>
                            {getSortIcon('progress')}
                          </div>
                        </TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGoals.map((goal) => (
                        <TableRow 
                          key={goal.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/goals/${goal.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {goal.completed && (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              )}
                              <span className="font-medium">{goal.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{goal.category}</Badge>
                          </TableCell>
                          <TableCell>
                            {goal.target_date ? (
                              <div className="flex items-center text-sm">
                                <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                                {format(new Date(goal.target_date), 'MMM d, yyyy')}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No date</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={goal.progress || 0} className="h-2 w-24" />
                              <span className="text-sm">{goal.progress || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {goal.assigned_to ? (
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {goal.assigned_to_name ? goal.assigned_to_name.substring(0, 2).toUpperCase() : '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{goal.assigned_to_name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Unassigned</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/goals/${goal.id}`);
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
            
            <AddGoalDialog 
              open={addGoalOpen} 
              onOpenChange={setAddGoalOpen}
              onClose={() => {
                setAddGoalOpen(false);
                refreshGoals();
              }}
              initialCategory={null}
            />
          </div>
        } />
      </Routes>
    </MainLayout>
  );
};

export default Goals;
