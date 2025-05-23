
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, BarChart3, Briefcase, WalletCards, 
  Target, CalendarDays, ClipboardList, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

type NavItemProps = {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
  isActive?: boolean;
};

const NavItem = ({ href, icon: Icon, children, isActive }: NavItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
};

type NavGroupProps = {
  title: string;
  children: React.ReactNode;
};

const NavGroup = ({ title, children }: NavGroupProps) => {
  return (
    <div className="py-2">
      <h3 className="px-3 text-xs font-medium text-muted-foreground mb-1">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

export function Sidebar() {
  const currentPath = window.location.pathname;

  return (
    <aside className="w-64 border-r bg-sidebar p-4 hidden md:block">
      <div className="flex items-center gap-2 px-2 py-4">
        <h1 className="text-2xl font-semibold tracking-tight">FamPilot</h1>
      </div>
      
      <nav className="mt-8 flex flex-col gap-2">
        <NavGroup title="Overview">
          <NavItem href="/" icon={Home} isActive={currentPath === '/'}>
            Dashboard
          </NavItem>
          <NavItem href="/mission" icon={Target} isActive={currentPath === '/mission'}>
            Mission & Values
          </NavItem>
        </NavGroup>
        
        <NavGroup title="Planning">
          <NavItem href="/calendar" icon={CalendarDays} isActive={currentPath === '/calendar'}>
            Calendar
          </NavItem>
          <NavItem href="/tasks" icon={ClipboardList} isActive={currentPath === '/tasks'}>
            Tasks & Chores
          </NavItem>
          <NavItem href="/goals" icon={BarChart3} isActive={currentPath === '/goals'}>
            Goals & Tracking
          </NavItem>
        </NavGroup>
        
        <NavGroup title="Family">
          <NavItem href="/collaboration" icon={Briefcase} isActive={currentPath === '/collaboration'}>
            Collaboration
          </NavItem>
          <NavItem href="/finances" icon={WalletCards} isActive={currentPath === '/finances'}>
            Budget & Finance
          </NavItem>
        </NavGroup>
      </nav>
      
      <div className="mt-auto pt-4 border-t">
        <NavItem href="/profile" icon={User} isActive={currentPath === '/profile'}>
          Profile
        </NavItem>
      </div>
    </aside>
  );
}
