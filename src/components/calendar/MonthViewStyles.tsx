
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
        padding: 2px 4px;
        border-radius: 3px;
        transition: background-color 0.2s;
      }
      
      .multi-day-event:hover {
        filter: brightness(1.1);
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
      }
      
      .single-day-event {
        pointer-events: auto;
        cursor: pointer;
        z-index: 30;
      }
      
      @media (max-width: 768px) {
        .calendar-day {
          min-height: 70px;
        }
        
        .multi-day-event {
          font-size: 0.65rem;
          padding: 1px 2px;
        }
      }
      
      @media (max-width: 640px) {
        .calendar-day {
          min-height: 60px;
        }
        
        .multi-day-event {
          font-size: 0.6rem;
          padding: 1px;
        }
      }
      
      @media (max-width: 480px) {
        .calendar-day {
          min-height: 50px;
        }
        
        .multi-day-event {
          font-size: 0.5rem;
          padding: 0px 1px;
        }
      }
      `}
    </style>
  );
}
