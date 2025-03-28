
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
        pointer-events: none;
      }
      
      .multi-day-event {
        pointer-events: auto;
      }
      
      .calendar-day {
        min-height: 80px;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
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
