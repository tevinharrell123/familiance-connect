
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarWidget } from '@/components/dashboard/calendar/CalendarContainer';

const CalendarPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-4 px-0 sm:py-6 sm:px-4">
        <Card className="shadow-sm">
          <CardHeader className="py-3 px-3 sm:py-6 sm:px-4">
            <CardTitle className="text-lg md:text-2xl">Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="calendar-container w-full h-[calc(100vh-12rem)]">
              <CalendarWidget key="calendar-page-widget" initialView="week" />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
