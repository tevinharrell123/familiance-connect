
import React from 'react';

export function MonthViewStyles() {
  return (
    <style>
      {`
      .grid-container {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        position: relative;
      }
      
      .multi-day-events-container {
        position: relative;
        width: 100%;
        height: 0;
      }
      
      .multi-day-event {
        left: 0;
        right: 0;
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
