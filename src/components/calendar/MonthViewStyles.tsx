
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
      
      .multi-day-events-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 20;
      }
      
      .multi-day-event {
        pointer-events: auto;
        position: absolute;
        z-index: 10;
        font-size: 0.7rem;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
        padding: 0;
        border-radius: 4px;
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      
      .multi-day-event:hover {
        filter: brightness(1.1);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transform: translateY(-1px);
      }
      
      .calendar-day {
        min-height: 80px;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
      }
      
      .day-events-container {
        pointer-events: auto;
        position: relative;
        z-index: 5;
        display: flex;
        flex-direction: column;
        overflow: visible;
        flex-grow: 1;
        margin-top: 28px; /* Space for multi-day events */
      }
      
      .single-day-event {
        pointer-events: auto;
        cursor: pointer;
        z-index: 30;
      }
      
      @media (max-width: 768px) {
        .calendar-day {
          min-height: 50px; /* Reduced height on mobile */
        }
        
        .multi-day-event {
          font-size: 0.6rem;
        }
        
        .day-events-container {
          margin-top: 22px; /* Reduced margin on mobile but still enough for 2 rows of events */
        }
      }
      
      @media (max-width: 640px) {
        .calendar-day {
          min-height: 50px;
        }
        
        .multi-day-event {
          font-size: 0.55rem;
        }
        
        .day-events-container {
          margin-top: 20px;
        }
      }
      
      @media (max-width: 480px) {
        .calendar-day {
          min-height: 50px;
        }
        
        .multi-day-event {
          font-size: 0.5rem;
        }
        
        .day-events-container {
          margin-top: 18px;
        }
      }
      `}
    </style>
  );
}
