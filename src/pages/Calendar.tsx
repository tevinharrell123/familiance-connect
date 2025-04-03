
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarWidget } from '@/components/dashboard/calendar/CalendarContainer';

const CalendarPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-4 px-2 sm:py-6 sm:px-4">
        <Card className="shadow-sm">
          <CardHeader className="py-4 px-4 sm:py-6">
            <CardTitle className="text-xl md:text-2xl">Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="calendar-container w-full h-[calc(100vh-12rem)]">
              <CalendarWidget key="calendar-page-widget" />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
