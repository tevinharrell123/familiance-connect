
import React, { useEffect, useState, useRef } from 'react';
import { CalendarEvent } from '@/types/calendar';
import { addDays, addMonths, addWeeks, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { RefreshCw } from 'lucide-react';

interface MobileCalendarContainerProps {
  children: React.ReactNode;
  currentDate: Date;
  view: 'day' | 'week' | 'month';
  onDateChange: (date: Date) => void;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export function MobileCalendarContainer({
  children,
  currentDate,
  view,
  onDateChange,
  onRefresh,
  isRefreshing = false
}: MobileCalendarContainerProps) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isPullToRefresh, setIsPullToRefresh] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const minSwipeDistance = 50;
  const pullToRefreshThreshold = 100;

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    
    const touch = e.targetTouches[0];
    setTouchEnd(null);
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !touchStart) return;
    
    const touch = e.targetTouches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - touchStart.y;
    
    // Pull to refresh logic
    if (deltaY > 0 && window.scrollY === 0) {
      e.preventDefault();
      const distance = Math.min(deltaY * 0.5, pullToRefreshThreshold * 1.5);
      setPullDistance(distance);
      setIsPullToRefresh(distance >= pullToRefreshThreshold);
    }
    
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  const onTouchEnd = () => {
    if (!isMobile || !touchStart || !touchEnd) {
      resetPullToRefresh();
      return;
    }

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    // Handle pull to refresh
    if (isPullToRefresh && onRefresh) {
      onRefresh().finally(() => {
        resetPullToRefresh();
      });
      return;
    }

    resetPullToRefresh();

    // Handle horizontal swipes for date navigation
    if (isHorizontalSwipe) {
      if (isLeftSwipe) {
        // Swipe left - go to next period
        const nextDate = getNextDate(currentDate, view);
        onDateChange(nextDate);
      } else if (isRightSwipe) {
        // Swipe right - go to previous period
        const prevDate = getPreviousDate(currentDate, view);
        onDateChange(prevDate);
      }
    }
  };

  const resetPullToRefresh = () => {
    setIsPullToRefresh(false);
    setPullDistance(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const getNextDate = (date: Date, viewType: string) => {
    switch (viewType) {
      case 'day':
        return addDays(date, 1);
      case 'week':
        return addWeeks(date, 1);
      case 'month':
        return addMonths(date, 1);
      default:
        return date;
    }
  };

  const getPreviousDate = (date: Date, viewType: string) => {
    switch (viewType) {
      case 'day':
        return addDays(date, -1);
      case 'week':
        return addWeeks(date, -1);
      case 'month':
        return addMonths(date, -1);
      default:
        return date;
    }
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className="mobile-calendar-container relative overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm border-b"
          style={{ 
            height: `${pullDistance}px`,
            transform: `translateY(-${pullDistance}px)`
          }}
        >
          <div className="flex flex-col items-center text-muted-foreground">
            <RefreshCw 
              className={cn(
                "h-6 w-6 mb-2 transition-transform duration-200",
                isPullToRefresh && "rotate-180",
                isRefreshing && "animate-spin"
              )} 
            />
            <span className="text-sm font-medium">
              {isRefreshing 
                ? 'Refreshing...' 
                : isPullToRefresh 
                  ? 'Release to refresh' 
                  : 'Pull to refresh'
              }
            </span>
          </div>
        </div>
      )}
      
      {children}
      
      {/* Swipe hint for first-time users */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
        <div className="bg-black/70 text-white text-xs px-3 py-1 rounded-full opacity-60">
          ← Swipe to navigate →
        </div>
      </div>
    </div>
  );
}
