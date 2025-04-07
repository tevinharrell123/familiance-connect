
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
        min-height: 100px; /* Increased from 80px */
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
        aspect-ratio: auto;
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
        font-size: 11px !important;
        padding: 2px 4px !important;
        margin-top: 1px !important;
        line-height: 1.2 !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      @media (max-width: 768px) {
        .calendar-day {
          min-height: 65px;
        }
        
        .grid-container {
          grid-template-columns: repeat(7, minmax(40px, 1fr));
        }
        
        .single-day-event {
          font-size: 10px !important;
          padding: 1px 2px !important;
          line-height: 1.1 !important;
        }
      }
      
      @media (max-width: 640px) {
        .calendar-day {
          min-height: 55px;
          padding: 1px;
        }
        
        /* Improve mobile wrapping for calendar grid */
        .grid-container {
          width: 100%;
          grid-template-columns: repeat(7, minmax(30px, 1fr));
        }
        
        .single-day-event {
          font-size: 9px !important;
          padding: 0px 2px !important;
          margin-top: 1px !important;
          line-height: 1 !important;
        }
      }
      
      @media (max-width: 480px) {
        .calendar-day {
          min-height: 45px;
          font-size: 0.7rem;
          padding: 1px;
        }
        
        .grid-container {
          grid-template-columns: repeat(7, minmax(25px, 1fr));
        }
        
        .single-day-event {
          font-size: 8px !important;
          padding: 0px 1px !important;
          margin-top: 0px !important;
          line-height: 1 !important;
        }
      }
      
      /* Fix for ensuring the days wrap properly without horizontal scrolling */
      .month-view, .calendar-grid {
        max-width: 100vw;
        width: 100%;
      }
      
      /* Specific multi-day event styling */
      .single-day-event.rounded-l-md:not(.rounded-r-md) {
        margin-right: 0;
        border-right-width: 0;
        position: relative;
      }
      
      .single-day-event.rounded-none {
        margin-left: 0;
        margin-right: 0;
        border-left-width: 0;
        border-right-width: 0;
      }
      
      .single-day-event.rounded-r-md:not(.rounded-l-md) {
        margin-left: 0;
        border-left-width: 0;
      }
      `}
    </style>
  );
}
