
import React from 'react';

export function MonthViewStyles() {
  return (
    <style>
      {`
      .month-view {
        position: relative;
      }
      
      .grid-container {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        position: relative;
      }
      
      .multi-day-events-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        /* Ensure the container allows clicks */
        pointer-events: auto;
        z-index: 20;
      }
      
      .multi-day-event {
        pointer-events: auto;
        position: absolute;
        z-index: 10;
      }
      
      .calendar-day {
        min-height: 80px;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
      }
      
      .day-events-container {
        /* Explicitly set to ensure clicks work */
        pointer-events: auto;
        position: relative;
        z-index: 5;
        display: flex;
        flex-direction: column;
        overflow: visible;
      }
      
      @media (max-width: 640px) {
        .calendar-day {
          min-height: 60px;
        }
      }
    `}
    </style>
  );
}
