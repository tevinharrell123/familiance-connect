
import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  // Default state is false (not collapsed) to have sidebar shown by default
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  // Save sidebar state in localStorage, but never start collapsed on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
      return;
    }
    
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  return (
    <div className="flex min-h-screen flex-col mobile-render-fix">
      <Header />
      <div className="flex flex-1">
        <div className={`relative transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-0' : 'w-64'}`}>
          <div className={`absolute top-0 bottom-0 left-0 overflow-hidden transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-0 opacity-0' : 'w-64 opacity-100'
          }`}>
            <Sidebar />
          </div>
        </div>
        <div className="relative flex-1">
          {/* Only show toggle button on desktop */}
          {!isMobile && (
            <Button 
              variant="outline" 
              size="icon" 
              className="fixed top-20 left-0 z-40 rounded-l-none border-l-0 h-10 shadow-md transition-all duration-300 ease-in-out"
              onClick={toggleSidebar}
              style={{
                left: sidebarCollapsed ? 0 : '15.5rem',
              }}
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
          <div className="p-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
