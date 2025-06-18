
import React, { useRef, useEffect } from 'react';
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';

interface TouchCalendarProps {
  children: React.ReactNode;
  currentDate: Date;
  view: 'day' | 'week' | 'month';
  onDateChange: (date: Date) => void;
  className?: string;
}

export function TouchCalendar({
  children,
  currentDate,
  view,
  onDateChange,
  className = ''
}: TouchCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const handleNavigation = (direction: 'prev' | 'next') => {
    let newDate: Date;
    
    switch (view) {
      case 'day':
        newDate = direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1);
        break;
      case 'week':
        newDate = direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1);
        break;
      case 'month':
        newDate = direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1);
        break;
      default:
        return;
    }
    
    onDateChange(newDate);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isDragging.current = false;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const deltaX = Math.abs(e.touches[0].clientX - startX.current);
      const deltaY = Math.abs(e.touches[0].clientY - startY.current);
      
      // If horizontal movement is greater than vertical, start tracking
      if (deltaX > 10 && deltaX > deltaY) {
        isDragging.current = true;
        e.preventDefault(); // Prevent scrolling
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isDragging.current && e.changedTouches.length === 1) {
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX.current;
      const threshold = 100; // Minimum swipe distance
      
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          handleNavigation('prev'); // Swipe right = previous
        } else {
          handleNavigation('next'); // Swipe left = next
        }
      }
    }
    isDragging.current = false;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add passive: false to allow preventDefault
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentDate, view]);

  return (
    <div 
      ref={containerRef}
      className={`touch-pan-y ${className}`}
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
}
