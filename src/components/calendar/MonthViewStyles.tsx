
import React from 'react';

export function MonthViewStyles() {
  return (
    <style>
      {`
      .month-view {
        position: relative;
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .calendar-table {
        table-layout: fixed;
        border-collapse: collapse;
        width: 100%;
        height: 100%;
      }
      
      .calendar-day {
        height: 120px; 
        min-height: 80px;
        vertical-align: top;
        position: relative;
        z-index: 1;
      }
      
      .day-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      
      .day-events-container {
        pointer-events: auto;
        position: relative;
        z-index: 5;
        display: flex;
        flex-direction: column;
        min-height: 50px;
        max-height: calc(100% - 20px);
        overflow-y: hidden;
      }
      
      .day-events-container:hover {
        overflow-y: auto;
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
      
      @media (min-width: 1024px) {
        .calendar-day {
          height: 140px; 
          min-height: 120px;
        }
        
        .single-day-event {
          font-size: 12px !important;
          padding: 3px 5px !important;
          line-height: 1.3 !important;
        }
      }
      
      @media (min-width: 1280px) {
        .calendar-day {
          height: 160px; 
          min-height: 130px;
        }
      }
      
      @media (max-width: 768px) {
        .calendar-day {
          height: 80px;
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
          height: 60px;
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
          height: 50px;
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
      
      /* Fix for ensuring the days wrap properly without horizontal scrolling */
      .month-view, .calendar-table {
        max-width: 100%;
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
      
      /* Calendar header styling */
      .calendar-header th {
        font-weight: 600;
        color: var(--foreground);
        border-bottom: 1px solid var(--border);
        padding: 8px 4px;
      }
      
      /* Adjust day cell padding */
      .calendar-week .calendar-day {
        padding: 4px;
      }
      `}
    </style>
  );
}
