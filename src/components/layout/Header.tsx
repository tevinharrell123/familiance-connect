
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronDown, Bell, LogOut, HomeIcon, UserCog, X } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';

export function Header() {
  const { user, profile, household, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] max-w-[300px] p-0">
            <div className="flex h-full flex-col">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <Link to="/" onClick={() => setIsMenuOpen(false)}>
                    <h2 className="text-2xl font-semibold tracking-tight">FamPilot</h2>
                  </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </SheetClose>
                </div>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="flex flex-col gap-1 px-2">
                  <div className="py-2">
                    <h3 className="px-3 text-xs font-medium text-muted-foreground mb-1">Overview</h3>
                    <div className="space-y-1">
                      <SheetClose asChild>
                        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent">
                          <HomeIcon className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/mission" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Mission & Values</span>
                        </Link>
                      </SheetClose>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <h3 className="px-3 text-xs font-medium text-muted-foreground mb-1">Planning</h3>
                    <div className="space-y-1">
                      <SheetClose asChild>
                        <Link to="/calendar" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Calendar</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/tasks" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>Tasks & Chores</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/goals" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Goals & Tracking</span>
                        </Link>
                      </SheetClose>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <h3 className="px-3 text-xs font-medium text-muted-foreground mb-1">Family</h3>
                    <div className="space-y-1">
                      <SheetClose asChild>
                        <Link to="/household" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent">
                          <HomeIcon className="h-4 w-4" />
                          <span>Household</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/finances" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Budget & Finance</span>
                        </Link>
                      </SheetClose>
                    </div>
                  </div>
                  
                  <div className="py-2 mt-auto">
                    <SheetClose asChild>
                      <Link to="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent">
                        <UserCog className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </SheetClose>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-sidebar-accent text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </nav>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className={cn(
          "ml-4 md:ml-0",
          user ? "" : "ml-0"
        )}>
          {user && (
            <div className="flex items-center gap-4">
              <Link to="/household">
                <Button variant="ghost" className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4" />
                  {household ? household.name : "Join a Household"}
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
                <span className="sr-only">Notifications</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="pl-0 flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                      <AvatarFallback>{profile?.full_name ? getInitials(profile.full_name) : "U"}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{profile?.full_name || user.email}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <UserCog className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/household">
                      <HomeIcon className="h-4 w-4 mr-2" />
                      Household
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-500">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
