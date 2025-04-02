
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarWidget } from '@/components/dashboard/calendar/CalendarContainer';

const CalendarPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="calendar-container w-full">
              {/* Using the CalendarContainer component directly */}
              <CalendarWidget key="calendar-page-widget" />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CalendarPage;
