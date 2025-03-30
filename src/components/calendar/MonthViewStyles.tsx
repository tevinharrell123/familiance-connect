
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
        transition: background-color 0.2s ease;
      }
      
      .calendar-day:hover {
        background-color: rgba(0, 0, 0, 0.03);
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
      
      .multi-day-event {
        background-color: #8B5CF6;
        color: white;
        margin-top: 2px;
        border-radius: 4px;
        padding: 2px 4px;
        font-size: 0.7rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        cursor: pointer;
        z-index: 20;
      }
      
      @media (max-width: 768px) {
        .calendar-day {
          min-height: 70px;
        }
        
        .grid-container {
          width: 100%;
          min-width: 300px;
          overflow-x: auto;
        }
      }
      
      @media (max-width: 640px) {
        .calendar-day {
          min-height: 60px;
        }
        
        .multi-day-event {
          font-size: 0.6rem;
          padding: 1px 2px;
        }
        
        .grid-container {
          min-width: 400px;
        }
      }
      
      @media (max-width: 480px) {
        .calendar-day {
          min-height: 50px;
        }
        
        .month-view {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
      }
      `}
    </style>
  );
}
