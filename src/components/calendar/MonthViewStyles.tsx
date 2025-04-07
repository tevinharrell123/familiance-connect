
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
      
      .calendar-table {
        table-layout: fixed;
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
      }
      
      .calendar-day {
        height: 100%;
        aspect-ratio: 1;
        vertical-align: top;
        border: 1px solid #e5e7eb;
      }
      
      .day-events-container {
        pointer-events: auto;
        position: relative;
        z-index: 5;
        display: flex;
        flex-direction: column;
        overflow: visible;
        flex-grow: 1;
        gap: 2px;
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
      
      /* Desktop styles */
      @media (min-width: 1024px) {
        .calendar-day {
          min-height: 130px;
          padding: 4px;
        }
        
        .single-day-event {
          font-size: 12px !important;
          padding: 3px 6px !important;
          line-height: 1.4 !important;
        }
        
        .day-events-container {
          gap: 3px;
        }
      }
      
      /* Tablet styles */
      @media (max-width: 1023px) {
        .calendar-day {
          min-height: 110px;
          padding: 2px;
        }
      }
      
      /* Mobile styles */
      @media (max-width: 768px) {
        .calendar-day {
          min-height: 65px;
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
        
        .single-day-event {
          font-size: 8px !important;
          padding: 0px 1px !important;
          margin-top: 0px !important;
          line-height: 1 !important;
        }
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
