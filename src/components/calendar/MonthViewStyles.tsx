
import React from 'react';

export function MonthViewStyles() {
  return (
    <style>
      {`
      .month-view {
        position: relative;
        width: 100%;
        overflow: hidden;
      }
      
      .grid-container {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        position: relative;
        width: 100%;
      }
      
      .calendar-day {
        min-height: 80px;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
        cursor: pointer;
      }
      
      .day-events-container {
        pointer-events: auto;
        position: relative;
        z-index: 5;
        display: flex;
        flex-direction: column;
        overflow: visible;
        flex-grow: 1;
      }
      
      .single-day-event {
        pointer-events: auto;
        cursor: pointer;
        z-index: 30;
      }
      
      .month-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      @media (max-width: 768px) {
        .calendar-day {
          min-height: 70px;
        }
        
        .grid-container {
          max-width: 100%;
          overflow-x: auto;
        }
      }
      
      @media (max-width: 640px) {
        .calendar-day {
          min-height: 60px;
        }
      }
      
      @media (max-width: 480px) {
        .calendar-day {
          min-height: 50px;
        }
      }
      `}
    </style>
  );
}
